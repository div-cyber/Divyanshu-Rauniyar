import "dotenv/config";

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceRoleKey) {
  console.error(
    "Missing environment variables. Ensure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are set in .env",
  );
  process.exit(1);
}

async function run() {
  const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
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

  const loginBody = await loginRes.text();
  console.log("LOGIN RESPONSE STATUS:", loginRes.status);
  console.log(loginBody);

  const userRes = await fetch(`${url}/auth/v1/admin/users?email=yanshudiv22@gmail.com`, {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
  });

  const userBody = await userRes.text();
  console.log("USER QUERY STATUS:", userRes.status);
  console.log(userBody);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
