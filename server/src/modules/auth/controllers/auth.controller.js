import { config } from "../../../config/env.js";
import Store from "../../stores/model/store.model.js";
import axios from "axios";
import { asyncWrapper } from "../../../utils/errorHandler.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

/* ===================================
 * Login (only via salla)
 * =================================== */
export const loginViaSalla = (req, res) => {
  const state = crypto.randomBytes(8).toString("hex");

  // store in cookie/session
  res.cookie("oauth_state_seo_booster", state, {
    httpOnly: true,
    maxAge: 5 * 60 * 1000,
  });

  const sallaUrl = new URL("https://accounts.salla.sa/oauth2/auth");
  sallaUrl.searchParams.set("response_type", "code");
  sallaUrl.searchParams.set("client_id", config.clientKey);
  sallaUrl.searchParams.set("redirect_uri", config.redirectUri);
  sallaUrl.searchParams.set(
    "scope",
    "offline_access specialoffers.read_write products.read_write webhooks.read_write orders.read metadata.read_write"
  );
  sallaUrl.searchParams.set("state", state);

  res.redirect(sallaUrl.toString());
};

/* ===================================
 * redirect to correct callback
 * =================================== */
export const sallaCallback = asyncWrapper(async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("Missing code");

  const tokenData = new URLSearchParams();
  tokenData.append("grant_type", "authorization_code");
  tokenData.append("code", code);
  tokenData.append("client_id", config.clientKey);
  tokenData.append("client_secret", config.clientSecretKey);
  tokenData.append("redirect_uri", config.redirectUri);

  const tokenRes = await axios.post(
    "https://accounts.salla.sa/oauth2/token",
    tokenData.toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const { access_token, refresh_token, expires_in, scope } = tokenRes.data;

  const storeRes = await axios.get(
    "https://api.salla.dev/admin/v2/store/info",
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );

  const store = storeRes.data.data;

  const storePlan = store.plan || "basic";

  // Calculate bundle limit based on plan
  let maxBundles = 3; // default
  switch (storePlan) {
    case "basic":
      maxBundles = 3;
      break;
    case "pro":
      maxBundles = 10;
      break;
    case "enterprise":
      maxBundles = 50;
      break;
    case "special":
      maxBundles = 100;
      break;
  }

  await Store.findOneAndUpdate(
    { store_id: store.id },
    {
      name: store.name,
      domain: store.domain,
      description: store.description,
      plan: storePlan,
      access_token,
      refresh_token,
      scope,
      access_token_expires_at: new Date(Date.now() + expires_in * 1000),
      installed_at: new Date(),
      avatar: store.avatar,
      bundle_settings: {
        max_bundles_per_store: maxBundles,
        analytics_enabled: true,
      },
      bundles_enabled: true,
      status: "active",
    },
    { upsert: true }
  );

  const jwtPayload = {
    store_id: store.id,
    name: store.name,
    domain: store.domain,
  };

  const token = jwt.sign(jwtPayload, config.jwtSecret, {
    expiresIn: "7d",
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>تسجيل الدخول...</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                direction: rtl;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
                text-align: center;
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                max-width: 400px;
            }
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
                margin: 0 auto 1.5rem;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            h2 {
                color: #333;
                margin-bottom: 0.5rem;
            }
            p {
                color: #666;
                font-size: 0.9rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="spinner"></div>
            <h2>جاري تسجيل الدخول...</h2>
            <p>سيتم توجيهك إلى لوحة التحكم خلال لحظات</p>
        </div>
        
        <script>
            // Authentication data from backend
            const authData = ${JSON.stringify({
              success: true,
              message: "Authentication successful",
              data: {
                token,
                user: {
                  store_id: store.id,
                  name: store.name,
                  domain: store.domain,
                  avatar: store.avatar,
                  plan: store.plan || "basic",
                },
              },
            })};
            
            // Encode auth data for URL
            const encodedToken = encodeURIComponent(authData.data.token);
            const encodedUser = encodeURIComponent(JSON.stringify(authData.data.user));
            
            // Redirect to frontend with auth data in URL
            setTimeout(() => {
                window.location.href = '${
                  config.dashboard
                }/auth/callback?token=' + encodedToken + '&user=' + encodedUser;
            }, 1500);
        </script>
    </body>
    </html>
  `;

  res.send(html);
});
