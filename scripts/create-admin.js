import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const email = "yanshudiv22@gmail.com";
const password = "iwillnot_share2008";

if (!url || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL / VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
  );
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function updatePassword(userId) {
  const response = await fetch(`${url}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password, email_confirm: true }),
  });

  const body = await response.text();
  if (!response.ok) {
    console.error("Failed to update admin password:", response.status, body);
    process.exit(1);
  }

  console.log("Admin password reset for user id:", userId);
}

async function findUserByEmail() {
  const response = await fetch(`${url}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
  });

  const body = await response.text();
  if (!response.ok) {
    console.error("Failed to query admin user:", response.status, body);
    process.exit(1);
  }

  const parsed = JSON.parse(body);
  return parsed.users?.[0] ?? null;
}

async function createAdmin() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (!error) {
    console.log("Admin user created:", data?.user?.email);
    return;
  }

  if (error.message?.includes("already been registered")) {
    console.log("Admin user already exists:", email);
    const existingUser = await findUserByEmail();
    if (!existingUser) {
      console.error("User exists but could not be retrieved.");
      process.exit(1);
    }
    await updatePassword(existingUser.id);
    return;
  }

  console.error("Failed to create admin user:", error.message);
  process.exitCode = 1;
}

createAdmin();
