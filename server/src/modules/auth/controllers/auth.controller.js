import { config } from "../../../config/env.js";
import Store from "../../stores/model/store.model.js";
import axios from "axios";
import { asyncWrapper } from "../../../utils/errorHandler.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

/* ===================================
 * EASY MODE: Get store info for setup
 * Uses secure token instead of store_id
 * =================================== */
export const getSetupInfo = asyncWrapper(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Missing setup token",
    });
  }

  // Find store by setup_token
  const storeDoc = await Store.findOne({
    setup_token: token,
    is_deleted: false,
  });

  if (!storeDoc) {
    return res.status(404).json({
      success: false,
      message: "Invalid or expired setup link",
      error_code: "INVALID_TOKEN",
    });
  }

  if (storeDoc.first_login_completed) {
    return res.status(400).json({
      success: false,
      message: "Setup already completed",
      error_code: "ALREADY_SETUP",
    });
  }

  // Fetch store info from Salla to get merchant email
  let merchantEmail = null;
  try {
    const storeInfoRes = await axios.get(
      "https://api.salla.dev/admin/v2/store/info",
      {
        headers: {
          Authorization: `Bearer ${storeDoc.access_token}`,
        },
      }
    );
    merchantEmail = storeInfoRes.data.data.email;
  } catch (error) {
    console.error("[Setup]: Failed to fetch merchant email:", error.message);
  }

  res.json({
    success: true,
    data: {
      store_id: storeDoc.store_id,
      name: storeDoc.name,
      domain: storeDoc.domain,
      merchant_email: merchantEmail, // Merchant's email from Salla (optional)
    },
  });
});

/* ===================================
 * EASY MODE: Complete first-time setup
 * POST /api/v1/auth/setup
 * Creates email/password for merchant
 * Uses secure token instead of store_id
 * =================================== */
export const completeSetup = asyncWrapper(async (req, res) => {
  const { token, email, password } = req.body;

  if (!token || !email || !password) {
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "البريد الإلكتروني غير صحيح" });
  }

  // Validate password length
  if (password.length < 8) {
    return res
      .status(400)
      .json({ message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
  }

  const store = await Store.findOne({
    setup_token: token,
    is_deleted: false,
  });

  if (!store) {
    return res.status(404).json({
      message: "رابط الإعداد غير صالح",
      error_code: "INVALID_TOKEN",
    });
  }

  if (store.first_login_completed) {
    return res.status(400).json({
      message: "تم إعداد هذا الحساب مسبقاً. يرجى تسجيل الدخول",
      error_code: "ALREADY_SETUP",
    });
  }

  // Check if this store already has email and password set
  if (store.email && store.password) {
    return res.status(400).json({
      message: "الحساب موجود بالفعل. يرجى تسجيل الدخول",
      error_code: "ALREADY_SETUP",
    });
  }

  // Check if email already used by another store
  const existingEmail = await Store.findOne({
    email: email.toLowerCase(),
    _id: { $ne: store._id },
  });

  if (existingEmail) {
    return res.status(400).json({ message: "البريد الإلكتروني مستخدم بالفعل" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update store with credentials and remove setup token
  store.email = email.toLowerCase();
  store.password = hashedPassword;
  store.first_login_completed = true;
  store.setup_token = undefined; // Remove field entirely to avoid unique index conflict
  await store.save();

  // Generate JWT for dashboard
  const jwtToken = jwt.sign(
    {
      store_id: store.store_id,
      name: store.name,
      domain: store.domain,
      plan: store.plan,
      email: store.email,
    },
    config.jwtSecret,
    { expiresIn: "30d" } // Long-lived token
  );

  console.log(
    `[Setup Complete]: Store ${store.store_id} (${email}) completed first-time setup`
  );

  res.json({
    success: true,
    token: jwtToken,
    message: "تم إنشاء الحساب بنجاح",
  });
});

/* ===================================
 * Email/Password Login
 * Merchants use this to login directly to dashboard
 * =================================== */
export const loginWithCredentials = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "البريد الإلكتروني وكلمة المرور مطلوبين" });
  }

  const store = await Store.findOne({
    email: email.toLowerCase(),
    is_deleted: false,
  }).select("+password");

  if (!store) {
    return res
      .status(401)
      .json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  const isValidPassword = await bcrypt.compare(password, store.password);

  if (!isValidPassword) {
    return res
      .status(401)
      .json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
  }

  if (!store.access_token) {
    return res.status(403).json({
      message:
        "يبدو أن التطبيق غير مثبت أو تم إلغاؤه. يرجى إعادة التثبيت من متجر سلة",
      error_code: "APP_NOT_INSTALLED",
    });
  }

  // If access token is expired, refresh it automatically
  if (
    store.access_token_expires_at &&
    store.access_token_expires_at < new Date()
  ) {
    console.log(
      `[Login]: Access token expired for store ${store.store_id}, refreshing...`
    );

    if (!store.refresh_token) {
      return res.status(403).json({
        message:
          "انتهت صلاحية الوصول ولا يوجد رمز تحديث. يرجى إعادة تثبيت التطبيق",
        error_code: "NO_REFRESH_TOKEN",
      });
    }

    try {
      const tokenData = new URLSearchParams();
      tokenData.append("grant_type", "refresh_token");
      tokenData.append("refresh_token", store.refresh_token);
      tokenData.append("client_id", config.clientKey);
      tokenData.append("client_secret", config.clientSecretKey);

      const tokenResponse = await axios.post(
        "https://accounts.salla.sa/oauth2/token",
        tokenData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token, refresh_token, expires_in } = tokenResponse.data;

      store.access_token = access_token;
      if (refresh_token) {
        store.refresh_token = refresh_token;
      }
      store.access_token_expires_at = new Date(Date.now() + expires_in * 1000);
      await store.save();

      console.log(
        `[Login]: Successfully refreshed token for store ${store.store_id}`
      );
    } catch (error) {
      console.error(
        `[Login]: Failed to refresh token for store ${store.store_id}:`,
        error.response?.data || error.message
      );

      return res.status(403).json({
        message: "فشل تحديث صلاحية الوصول. يرجى إعادة تثبيت التطبيق",
        error_code: "TOKEN_REFRESH_FAILED",
      });
    }
  }

  // Generate JWT
  const jwtToken = jwt.sign(
    {
      store_id: store.store_id,
      name: store.name,
      domain: store.domain,
      plan: store.plan,
      email: store.email,
    },
    config.jwtSecret,
    { expiresIn: "30d" }
  );

  console.log(
    `[Login]: Store ${store.store_id} (${email}) logged in successfully`
  );

  res.json({
    success: true,
    token: jwtToken,
    store: {
      store_id: store.store_id,
      name: store.name,
      domain: store.domain,
      plan: store.plan,
      email: store.email,
    },
  });
});

/* ===================================
 * Forgot Password - Send reset code
 * POST /api/v1/auth/forgot-password
 * Generates 6-digit code and logs it (or emails it)
 * =================================== */
export const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "البريد الإلكتروني مطلوب",
    });
  }

  const store = await Store.findOne({
    email: email.toLowerCase(),
    is_deleted: false,
  }).select("+reset_code +reset_code_expires");

  if (!store) {
    // Don't reveal if email exists or not (security)
    return res.json({
      success: true,
      message: "إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رمز التحقق",
    });
  }

  // Generate 6-digit reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Code expires in 15 minutes
  store.reset_code = resetCode;
  store.reset_code_expires = new Date(Date.now() + 15 * 60 * 1000);
  await store.save();

  // TODO: Send email with reset code
  // For now, log it to console
  console.log("\n" + "=".repeat(80));
  console.log("🔐 PASSWORD RESET CODE (SMTP NOT CONFIGURED)");
  console.log("=".repeat(80));
  console.log(`Store: ${store.name} (${store.store_id})`);
  console.log(`Email: ${email}`);
  console.log(`\n🔢 RESET CODE:`);
  console.log(`   ${resetCode}`);
  console.log(`\n⏰ Expires in 15 minutes`);
  console.log("=".repeat(80) + "\n");

  res.json({
    success: true,
    message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني",
  });
});

/* ===================================
 * Reset Password with code
 * POST /api/v1/auth/reset-password
 * Verifies code and updates password
 * =================================== */
export const resetPassword = asyncWrapper(async (req, res) => {
  const { email, code, new_password } = req.body;

  if (!email || !code || !new_password) {
    return res.status(400).json({
      success: false,
      message: "جميع الحقول مطلوبة",
    });
  }

  // Validate password length
  if (new_password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
    });
  }

  const store = await Store.findOne({
    email: email.toLowerCase(),
    is_deleted: false,
  }).select("+reset_code +reset_code_expires +password");

  if (!store) {
    return res.status(404).json({
      success: false,
      message: "البريد الإلكتروني غير موجود",
    });
  }

  // Check if code exists and not expired
  if (!store.reset_code || !store.reset_code_expires) {
    return res.status(400).json({
      success: false,
      message: "لم يتم طلب إعادة تعيين كلمة المرور",
    });
  }

  if (store.reset_code_expires < new Date()) {
    return res.status(400).json({
      success: false,
      message: "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد",
    });
  }

  // Verify code
  if (store.reset_code !== code) {
    return res.status(400).json({
      success: false,
      message: "رمز التحقق غير صحيح",
    });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(new_password, 10);

  // Update password and clear reset code
  store.password = hashedPassword;
  store.reset_code = undefined;
  store.reset_code_expires = undefined;
  await store.save();

  console.log(
    `[Password Reset]: Store ${store.store_id} (${email}) password updated successfully`
  );

  res.json({
    success: true,
    message: "تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول",
  });
});
