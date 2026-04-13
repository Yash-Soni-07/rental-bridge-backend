import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { applications } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/applications — Admin: get all applications
router.get("/", async (req: Request, res: Response) => {
    try {
        const all = await db.select().from(applications);
        res.json(all);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch applications" });
    }
});

// GET /api/applications/:id — Get single application
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const app = await db
            .select()
            .from(applications)
            .where(eq(applications.id, Number(req.params.id)));
        if (!app.length) return res.status(404).json({ error: "Application not found" });
        res.json(app[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch application" });
    }
});

// GET /api/applications/tenant/:tenantId — Tenant: my applications
router.get("/tenant/:tenantId", async (req: Request, res: Response) => {
    try {
        const tenantApps = await db
            .select()
            .from(applications)
            .where(eq(applications.applicant_id, Number(req.params.tenantId)));
        res.json(tenantApps);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tenant applications" });
    }
});

// GET /api/applications/property/:propertyId — Owner: applications for my property
router.get("/property/:propertyId", async (req: Request, res: Response) => {
    try {
        const propertyApps = await db
            .select()
            .from(applications)
            .where(eq(applications.property_id, Number(req.params.propertyId)));
        res.json(propertyApps);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch property applications" });
    }
});

// POST /api/applications — Tenant: submit application
router.post("/", async (req: Request, res: Response) => {
    try {
        const newApp = await db.insert(applications).values(req.body).returning();
        res.status(201).json(newApp[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to submit application" });
    }
});

// PUT /api/applications/:id — Owner/Admin: update application status
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const updated = await db
            .update(applications)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(applications.id, Number(req.params.id)))
            .returning();
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update application" });
    }
});

// DELETE /api/applications/:id — Tenant: withdraw application
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await db.delete(applications).where(eq(applications.id, Number(req.params.id)));
        res.json({ message: "Application withdrawn" });
    } catch (err) {
        res.status(500).json({ error: "Failed to withdraw application" });
    }
});

export default router;