import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function createAdmin() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "yanshudiv22@gmail.com",
    password: "iwillnot_share2008",
    email_confirm: true,
  });

  if (error) {
    console.error("Failed to create admin user:", error.message);
    process.exit(1);
  }

  console.log("Admin user created:", data?.user?.email);
}

createAdmin();
