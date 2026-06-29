import "dotenv/config";
import fetch from "node-fetch";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceRole) {
  console.error(
    "Missing VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, or SUPABASE_SERVICE_ROLE_KEY in .env",
  );
  process.exit(1);
}

async function run() {
  const tokenRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "yanshudiv22@gmail.com",
      password: "iwillnot_share2008",
    }),
  });

  const tokenBody = await tokenRes.text();
  console.log("token status", tokenRes.status);
  console.log(tokenBody);

  const adminRes = await fetch(`${url}/auth/v1/admin/users?email=yanshudiv22@gmail.com`, {
    method: "GET",
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${serviceRole}`,
      "Content-Type": "application/json",
    },
  });
  const adminBody = await adminRes.text();
  console.log("admin status", adminRes.status);
  console.log(adminBody);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
