/**
 * Creates (or updates the password of) the single DayBloom account.
 * Usage: npm run seed
 */
process.loadEnvFile?.(".env.local");

const { neon } = await import("@neondatabase/serverless");
const bcrypt = (await import("bcryptjs")).default;

const url = process.env.DATABASE_URL;
const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
const password = process.env.SEED_USER_PASSWORD;
const name = process.env.SEED_USER_NAME?.trim() || "DayBloom";

if (!url) {
  console.error("Thiếu DATABASE_URL trong .env.local");
  process.exit(1);
}
if (!email || !password) {
  console.error("Thiếu SEED_USER_EMAIL hoặc SEED_USER_PASSWORD trong .env.local");
  process.exit(1);
}
if (password.length < 8) {
  console.error("SEED_USER_PASSWORD cần tối thiểu 8 ký tự");
  process.exit(1);
}

const sql = neon(url);
const passwordHash = await bcrypt.hash(password, 12);

const [row] = await sql`
  INSERT INTO users (email, name, password_hash)
  VALUES (${email}, ${name}, ${passwordHash})
  ON CONFLICT (email)
  DO UPDATE SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name, updated_at = now()
  RETURNING id, email
`;

console.log(`Đã tạo/cập nhật tài khoản: ${row.email} (${row.id})`);
