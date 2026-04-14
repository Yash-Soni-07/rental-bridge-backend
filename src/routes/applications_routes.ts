import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { applications, properties } from "../db/schema/app.js";
import { eq } from "drizzle-orm";
import { authenticate } from "../middlewares/authenticate.js";
import { verifyOwnership } from "../middlewares/verifyOwnership.js";

const router = Router();

/**
 * Helper: Validate ID
 */
import { parseId } from "../utils/parseId.js";

// DB Error Handler
import { isConstraintViolation } from "../utils/dbErrorHandler.js";

// GET /api/applications — Admin: get all applications
router.get("/", async (_req: Request, res: Response) => {
    try {
        const all = await db.select().from(applications);
        return res.status(200).json(all);
    } catch (error) {
        console.error("GET /applications error:", error);
        return res.status(500).json({ error: "Failed to fetch applications" });
    }
});

// GET /api/applications/tenant/:tenantId — Tenant: my applications
router.get(
    "/tenant/:tenantId",
    authenticate,
    verifyOwnership("tenantId"),
    async (req: Request, res: Response) => {
        const tenantId = parseId(req.params.tenantId);
        if (!tenantId) {
            return res.status(400).json({ error: "Invalid tenant ID" });
        }

        try {
            const tenantApps = await db
                .select()
                .from(applications)
                .where(eq(applications.applicant_id, tenantId));

            return res.status(200).json(tenantApps);
        } catch (error) {
            console.error(`GET /applications/tenant/${tenantId} error:`, error);
            return res.status(500).json({ error: "Failed to fetch tenant applications" });
        }
    }
);

// GET /api/applications/property/:propertyId — Owner: applications for property
router.get("/property/:propertyId", authenticate, async (req: Request, res: Response) => {
    const propertyId = parseId(req.params.propertyId);
    if (!propertyId) {
        return res.status(400).json({ error: "Invalid property ID" });
    }

    try {
        // 🔒 Ownership check
        const property = await db
            .select()
            .from(properties)
            .where(eq(properties.id, propertyId));

        if (!property.length) {
            return res.status(404).json({ error: "Property not found" });
        }

        const propertyData = property[0];

        if (!propertyData) {
            return res.status(404).json({ error: "Property not found" });
        }

        if (req.user?.role !== "admin" && propertyData.owner_id !== req.user?.id) {
            return res.status(403).json({ error: "Forbidden: Not your property" });
        }

        const propertyApps = await db
            .select()
            .from(applications)
            .where(eq(applications.property_id, propertyId));

        return res.status(200).json(propertyApps);
    } catch (error) {
        console.error(`GET /applications/property/${propertyId} error:`, error);
        return res.status(500).json({ error: "Failed to fetch property applications" });
    }
});

// GET /api/applications/:id — Get single application
router.get("/:id", authenticate, async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid application ID" });
    }

    try {
        const app = await db
            .select()
            .from(applications)
            .where(eq(applications.id, id));

        if (!app.length) {
            return res.status(404).json({ error: "Application not found" });
        }

        const application = app[0];

        // 🔒 Ownership check

        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        if (
            req.user?.role !== "admin" &&
            application.applicant_id !== req.user?.id
        ) {
            return res.status(403).json({ error: "Forbidden: Not your application" });
        }

        return res.status(200).json(application);
    } catch (error) {
        console.error(`GET /applications/${id} error:`, error);
        return res.status(500).json({ error: "Failed to fetch application" });
    }
});

// POST /api/applications — Submit application
router.post("/", authenticate, async (req: Request, res: Response) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body is required" });
        }

        const newApp = await db
            .insert(applications)
            .values({
                ...req.body,
                move_in_date: new Date(req.body.move_in_date),
            })
            .returning();

        return res.status(201).json(newApp[0]);
    } catch (error) {
        console.error("POST /applications error:", error);
        return res.status(500).json({ error: "Failed to submit application" });
    }
});

// PUT /api/applications/:id — Update application
router.put("/:id", authenticate, async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid application ID" });
    }

    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body is required" });
        }

        const existing = await db
            .select()
            .from(applications)
            .where(eq(applications.id, id));

        if (!existing.length) {
            return res.status(404).json({ error: "Application not found" });
        }

        const application = existing[0];

        // 🔒 Ownership check
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        if (
            req.user?.role !== "admin" &&
            application.applicant_id !== req.user?.id
        ) {
            return res.status(403).json({ error: "Forbidden: Not your application" });
        }

        const updated = await db
            .update(applications)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(applications.id, id))
            .returning();

        return res.status(200).json(updated[0]);
    } catch (error) {
        console.error(`PUT /applications/${id} error:`, error);
        return res.status(500).json({ error: "Failed to update application" });
    }
});

// DELETE /api/applications/:id — Withdraw application
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid application ID" });
    }

    try {
        const existing = await db
            .select()
            .from(applications)
            .where(eq(applications.id, id));

        if (!existing.length) {
            return res.status(404).json({ error: "Application not found" });
        }

        const application = existing[0];

        // 🔒 Ownership check
        if (!application) {
            return res.status(404).json({ error: "Application not found" });
        }

        if (
            req.user?.role !== "admin" &&
            application.applicant_id !== req.user?.id
        ) {
            return res.status(403).json({ error: "Forbidden: Not your application" });
        }

        const deleted = await db
            .delete(applications)
            .where(eq(applications.id, id))
            .returning();

        return res.status(200).json({ message: "Application withdrawn" });
    } catch (error: any) {
        console.error(`DELETE /applications/${id} error:`, error);

        if (isConstraintViolation(error)) {
            return res.status(409).json({
                error: "Cannot delete application due to existing dependencies",
            });
        }

        return res.status(500).json({
            error: "Failed to delete application",
        });
    }
});

export default router;