import axios from "axios";
import nodemailer from "nodemailer";
import { config } from "../../../config/env.js";
import Store from "../../stores/model/store.model.js";

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.emailHost || "smtp.gmail.com",
    port: config.emailPort || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.emailUser,
      pass: config.emailPassword,
    },
    ignoreTLS: config.emailDisableTls === true,
    tls: {
      rejectUnauthorized: !config.emailDisableTls,
    },
  });
};

export const sendWelcomeMessage = async (
  storeId,
  accessToken,
  type = "install"
) => {
  try {
    const dashboardUrl = config.dashboard || "http://localhost:3999";
    const storeDoc = await Store.findOne({ store_id: storeId });

    if (!storeDoc || !storeDoc.setup_token) {
      console.error(
        `[Notification Service]: Store ${storeId} not found or missing setup token`
      );
      return;
    }

    const storeResponse = await axios.get(
      "https://api.salla.dev/admin/v2/store/info",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const merchantEmail = storeResponse.data.data.email;
    const storeName = storeResponse.data.data.name;

    if (!merchantEmail) {
      console.warn(
        `[Notification Service]: No email found for store ${storeId}`
      );
      return;
    }

    const setupLink = `${dashboardUrl}/setup?token=${storeDoc.setup_token}`;
    const isReinstall = type === "reinstall";

    // Log to console until SMTP is configured
    console.log("\n" + "=".repeat(80));
    console.log("=".repeat(80));
    console.log(`Store ID: ${storeId}`);
    console.log(`Store Name: ${storeName}`);
    console.log(`Merchant Email: ${merchantEmail}`);
    console.log(`Type: ${isReinstall ? "RE-INSTALL 🔄" : "NEW INSTALL 🎉"}`);
    console.log(`\n🔗 SECURE SETUP LINK (Share this with merchant):`);
    console.log(`   ${setupLink}`);
    console.log("\n📝 Instructions for merchant:");
    if (isReinstall) {
      console.log(
        "   1. Click the secure setup link to create NEW credentials"
      );
      console.log("   2. Your old account has been reset");
      console.log("   3. Create email/password for dashboard access");
      console.log("   4. Login with your new credentials");
    } else {
      console.log("   1. Click the secure setup link above");
      console.log("   2. Create email/password for dashboard access");
      console.log("   3. Login anytime with your credentials");
    }
    console.log("=".repeat(80) + "\n");

    // If SMTP is configured, send actual email
    if (config.emailUser && config.emailPassword) {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"تطبيق الباقات المتقدمة" <${config.emailUser}>`,
        to: merchantEmail,
        subject: isReinstall
          ? "🔄 مرحباً بعودتك إلى تطبيق الباقات المتقدمة!"
          : "🎉 مرحباً بك في تطبيق الباقات المتقدمة!",
        html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #667eea; margin-bottom: 20px;">
              ${isReinstall ? "🔄 مرحباً بعودتك" : "🎉 مرحباً بك"} ${storeName}!
            </h1>
            
            ${
              isReinstall
                ? `
            <div style="background-color: #fef3c7; border-radius: 6px; padding: 15px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">
                ⚠️ ملاحظة مهمة
              </p>
              <p style="margin: 5px 0 0 0; color: #92400e;">
                تم إعادة تثبيت التطبيق. يرجى إنشاء بيانات دخول جديدة.
              </p>
            </div>
            `
                : ""
            }
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              ${
                isReinstall
                  ? "تم إعادة تثبيت <strong>تطبيق الباقات المتقدمة</strong> في متجرك بنجاح!"
                  : "تم تثبيت <strong>تطبيق الباقات المتقدمة</strong> بنجاح في متجرك!"
              }
            </p>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              يمكنك الآن إنشاء باقات منتجات جذابة لزيادة مبيعاتك ومتوسط قيمة الطلب.
            </p>
            
            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">📊 ${
                isReinstall ? "إعداد حساب جديد" : "لوحة التحكم"
              }</h3>
              <p style="margin: 10px 0;">
                <a href="${setupLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  ${isReinstall ? "إنشاء حساب جديد" : "ابدأ الإعداد الآن"}
                </a>
              </p>
            </div>
            
            <h3 style="color: #1f2937;">✨ ابدأ الآن:</h3>
            <ol style="font-size: 15px; color: #374151; line-height: 1.8;">
              <li>انقر على زر "${
                isReinstall ? "إنشاء حساب جديد" : "ابدأ الإعداد الآن"
              }"</li>
              <li>أنشئ بريد إلكتروني وكلمة مرور للوحة التحكم</li>
              <li>قم بإنشاء ${isReinstall ? "" : "أول "}باقة منتجات ${
          isReinstall ? "جديدة" : "لك"
        }</li>
              <li>فعّل الباقة وشاهد المبيعات تزداد!</li>
            </ol>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
            
            <p style="font-size: 14px; color: #6b7280;">
              إذا كان لديك أي استفسار، لا تتردد في التواصل معنا.
            </p>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              مع تحياتنا،<br>
              <strong>فريق تطبيق الباقات المتقدمة</strong>
            </p>
          </div>
        </div>
      `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(
        `[Notification Service]: ${
          isReinstall ? "Welcome back" : "Welcome"
        } email sent to ${merchantEmail} - Message ID: ${info.messageId}`
      );
      return info;
    }
  } catch (error) {
    console.error(
      `[Notification Service]: Failed to send welcome email to store ${storeId}:`,
      error.message
    );
    throw error;
  }
};

/**
 * Send custom email notification to store owner
 */
export const sendNotification = async (
  storeId,
  accessToken,
  { title, body, html }
) => {
  try {
    // Get store info to get merchant email
    const storeResponse = await axios.get(
      "https://api.salla.dev/admin/v2/store/info",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const merchantEmail = storeResponse.data.data.email;

    if (!merchantEmail) {
      console.warn(
        `[Notification Service]: No email found for store ${storeId}`
      );
      return;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"تطبيق الباقات المتقدمة" <${config.emailUser}>`,
      to: merchantEmail,
      subject: title,
      text: body,
      html: html || body,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `[Notification Service]: Email sent to ${merchantEmail} - Message ID: ${info.messageId}`
    );

    return info;
  } catch (error) {
    console.error(
      `[Notification Service]: Failed to send email to store ${storeId}:`,
      error.message
    );
    throw error;
  }
};
