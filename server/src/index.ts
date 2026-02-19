import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ENV } from "./config/env";
import { connectDB } from "./config/db";
import { seedAdmin } from "./utils/seedAdmin";
import { auditContext } from "./middleware/auditContext";

// Routes
import { authRoutes } from "./routes/auth.routes";
import { usersRoutes } from "./routes/users.routes";
import { auditRoutes } from "./routes/audit.routes";

async function main() {
  await connectDB();
  await seedAdmin();

  const app = express();

  app.use(
    cors({
      origin: ENV.CLIENT_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(auditContext);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/audit", auditRoutes);

  app.listen(ENV.PORT, () =>
    console.log(`API running on http://localhost:${ENV.PORT}`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
