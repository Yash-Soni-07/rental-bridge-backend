import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { applications } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Helper: Validate ID
 */
const parseId = (idParam: string | string[] | undefined): number | null => {
    if (!idParam || Array.isArray(idParam)) return null;

    const id = Number(idParam);
    if (!id || isNaN(id)) return null;

    return id;
};

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

// GET /api/applications/:id — Get single application
router.get("/:id", async (req: Request, res: Response) => {
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

        return res.status(200).json(app[0]);
    } catch (error) {
        console.error(`GET /applications/${id} error:`, error);
        return res.status(500).json({ error: "Failed to fetch application" });
    }
});

// GET /api/applications/tenant/:tenantId — Tenant: my applications
router.get("/tenant/:tenantId", async (req: Request, res: Response) => {
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
});

// GET /api/applications/property/:propertyId — Owner: applications for property
router.get("/property/:propertyId", async (req: Request, res: Response) => {
    const propertyId = parseId(req.params.propertyId);
    if (!propertyId) {
        return res.status(400).json({ error: "Invalid property ID" });
    }

    try {
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

// POST /api/applications — Submit application
router.post("/", async (req: Request, res: Response) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body is required" });
        }

        const newApp = await db
            .insert(applications)
            .values(req.body)
            .returning();

        return res.status(201).json(newApp[0]);
    } catch (error) {
        console.error("POST /applications error:", error);
        return res.status(500).json({ error: "Failed to submit application" });
    }
});

// PUT /api/applications/:id — Update application
router.put("/:id", async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid application ID" });
    }

    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body is required" });
        }

        const updated = await db
            .update(applications)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(applications.id, id))
            .returning();

        if (!updated.length) {
            return res.status(404).json({ error: "Application not found" });
        }

        return res.status(200).json(updated[0]);
    } catch (error) {
        console.error(`PUT /applications/${id} error:`, error);
        return res.status(500).json({ error: "Failed to update application" });
    }
});

// DELETE /api/applications/:id — Withdraw application
router.delete("/:id", async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid application ID" });
    }

    try {
        const deleted = await db
            .delete(applications)
            .where(eq(applications.id, id))
            .returning();

        if (!deleted.length) {
            return res.status(404).json({ error: "Application not found" });
        }

        return res.status(200).json({ message: "Application withdrawn" });
    } catch (error) {
        console.error(`DELETE /applications/${id} error:`, error);

        // 🔥 Important: due to restrict on property/user
        return res.status(400).json({
            error: "Cannot delete application due to existing dependencies",
        });
    }
});

export default router;