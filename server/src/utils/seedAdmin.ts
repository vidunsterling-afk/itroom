import argon2 from "argon2";
import { User } from "../models/User";

export async function seedAdmin() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminUsername = process.env.SEED_ADMIN_USERNAME;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmail || !adminUsername || !adminPassword) {
    console.log("ℹ️ Admin seed skipped (missing SEED_ADMIN_* env vars)");
    return;
  }

  const existing = await User.findOne({
    $or: [{ email: adminEmail.toLowerCase() }, { username: adminUsername }],
  }).lean();

  if (existing) {
    console.log("ℹ️ Admin seed: already exists");
    return;
  }

  const passwordHash = await argon2.hash(adminPassword);
  await User.create({
    username: adminUsername,
    email: adminEmail.toLowerCase(),
    passwordHash,
    role: "admin",
    isActive: true,
  });

  console.log("✅ Admin seeded:", adminUsername, adminEmail);
}
