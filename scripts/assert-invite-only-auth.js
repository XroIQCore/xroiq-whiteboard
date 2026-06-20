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
  /supabase\.auth\.signInWithOtp\s*\(\s*\{[\s\S]*?options\s*:\s*\{[\s\S]*?shouldCreateUser\s*:\s*false[\s\S]*?\}/m.test(loginPage),
  "Login magic links must call signInWithOtp with options.shouldCreateUser set to false.",
);

const signupPage = read("apps/web/pages/signup.tsx");
assert(
  /Sign-ups disabled/.test(signupPage) && /invite-only/i.test(signupPage),
  "The signup route must remain an invite-only access notice.",
);
assert(
  !/supabase\.auth\.(signUp|signInWithOtp)/.test(signupPage),
  "The signup route must not create users or send magic links.",
);

console.log("Invite-only auth guard passed.");
