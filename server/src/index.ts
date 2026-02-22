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
import { assetsRoutes } from "./routes/assets.routes";
import { employeesRoutes } from "./routes/employees.routes";
import { modulesRoutes } from "./routes/modules.routes";
import { permissionsRoutes } from "./routes/permissions.routes";
import { licensesRoutes } from "./routes/licenses.routes";
import { repairsRoutes } from "./routes/repairs.routes";
import { fingerprintsRoutes } from "./routes/fingerprints.routes";

async function main() {
  await connectDB();
  await seedAdmin();

  const app = express();

  app.use(
    cors({
      origin: ENV.CLIENT_ORIGIN,
      credentials: true,
      exposedHeaders: ["Content-Disposition"],
    }),
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(auditContext);

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", usersRoutes);
  app.use("/api/audit", auditRoutes);
  app.use("/api/assets", assetsRoutes);
  app.use("/api/employees", employeesRoutes);
  app.use("/api/modules", modulesRoutes);
  app.use("/api/permissions", permissionsRoutes);
  app.use("/api/licenses", licensesRoutes);
  app.use("/api/repairs", repairsRoutes);
  app.use("/api/fingerprints", fingerprintsRoutes);

  app.listen(ENV.PORT, () =>
    console.log(`API running on http://localhost:${ENV.PORT}`),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
