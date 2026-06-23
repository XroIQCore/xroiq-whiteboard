const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function tomlSection(source, sectionName) {
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `[${sectionName}]`);
  if (start === -1) {
    return null;
  }

  const body = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\s*\[.+\]\s*$/.test(line)) {
      break;
    }
    body.push(line);
  }

  return body.join("\n");
}

const supabaseConfig = read("supabase/config.toml");
const authSection = tomlSection(supabaseConfig, "auth");
assert(authSection, "supabase/config.toml must include an [auth] section.");

const enableSignup = authSection.match(/^\s*enable_signup\s*=\s*(true|false)\s*(?:#.*)?$/m);
assert(
  enableSignup && enableSignup[1] === "false",
  "supabase/config.toml must keep auth.enable_signup disabled for invite-only auth.",
);

const loginPage = read("apps/web/pages/login.tsx");
assert(
  /supabase\.auth\.signInWithOAuth\s*\(\s*\{[\s\S]*?provider\s*:\s*oauthProvider[\s\S]*?redirectTo\s*:\s*`\$\{window\.location\.origin\}\/auth\/callback\?next=\$\{encodeURIComponent\(next\)\}`[\s\S]*?\}/m.test(loginPage),
  "Login must use OAuth auth.",
);
assert(
  !/supabase\.auth\.(signInWithOtp|signInWithPassword)/.test(loginPage) && !/magic link|password/i.test(loginPage),
  "Login must not use magic links or password auth.",
);

const authCallbackPage = read("apps/web/pages/auth/callback.tsx");
assert(
  /supabase\.auth\.exchangeCodeForSession\s*\(\s*code\s*\)/.test(authCallbackPage),
  "OAuth callback must exchange the auth code for a session.",
);

const signupPage = read("apps/web/pages/signup.tsx");
assert(
  /Sign-ups disabled/.test(signupPage) && /invite-only/i.test(signupPage),
  "The signup route must remain an invite-only access notice.",
);
assert(
  !/supabase\.auth\.(signUp|signInWithOtp|signInWithPassword|signInWithOAuth)/.test(signupPage),
  "The signup route must not create users or start auth flows.",
);

console.log("Invite-only auth guard passed.");
