import express from "express";
import dotenv from "dotenv";

import usersRouter from "./routes/users_routes.js";
import propertiesRouter from "./routes/properties_routes.js";
import propertyAssetsRouter from "./routes/property-assets_routes.js";
import applicationsRouter from "./routes/applications_routes.js";
import bookingsRouter from "./routes/bookings_routes.js";
import paymentsRouter from "./routes/payments_routes.js";
import maintenanceRouter from "./routes/maintenance_routes.js";
import reviewsRouter from "./routes/reviews_routes.js";
import cors from "cors";
import 'dotenv/config';

dotenv.config();

const app = express();
app.use(express.json());

// ─── CORS ───────────────────────────────────────────────────────────────────
if (!process.env.FRONTEND_URL) {
    console.warn('FRONTEND_URL is not defined, CORS will block cross-origin requests');
}

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}))

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/users", usersRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api", propertyAssetsRouter);              // images, amenities, property-amenities
app.use("/api/applications", applicationsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/reviews", reviewsRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (_, res) => res.json({ message: "Rental Bridge API running ✅" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;