import express from "express";
import "dotenv/config";
import cors from "cors";

import usersRouter from "./routes/users_routes.js";
import propertiesRouter from "./routes/properties_routes.js";
import propertyAssetsRouter from "./routes/property-assets_routes.js";
import applicationsRouter from "./routes/applications_routes.js";
import bookingsRouter from "./routes/bookings_routes.js";
import paymentsRouter from "./routes/payments_routes.js";
import maintenanceRouter from "./routes/maintenance_routes.js";
import reviewsRouter from "./routes/reviews_routes.js";

const app = express();

// ─── Middlewares ─────────────────────────────────────────

// JSON parser
app.use(express.json());

// ─── CORS ───────────────────────────────────────────────

if (!process.env.FRONTEND_URL) {
    console.warn(
        "⚠️ FRONTEND_URL is not defined, CORS may block requests"
    );
}

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "*", // fallback (non-breaking)
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);

// ─── Routes ─────────────────────────────────────────────

app.use("/api/users", usersRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api", propertyAssetsRouter); // images, amenities, property-amenities
app.use("/api/applications", applicationsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/maintenance", maintenanceRouter);
app.use("/api/reviews", reviewsRouter);

// ─── Health Check ───────────────────────────────────────

app.get("/", (_req, res) => {
    return res.status(200).json({
        message: "Rental Bridge API running ✅",
    });
});

// ─── Global Error Handler (SAFE ADDITION) ───────────────

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Global Error:", err);
    return res.status(500).json({
        error: "Internal Server Error",
    });
});

// ─── Server ─────────────────────────────────────────────

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

export default app;