import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { maintenanceRequests } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/maintenance — Admin: get all requests
router.get("/", async (req: Request, res: Response) => {
    try {
        const all = await db.select().from(maintenanceRequests);
        res.json(all);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch maintenance requests" });
    }
});

// GET /api/maintenance/:id — Get single request
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const request = await db
            .select()
            .from(maintenanceRequests)
            .where(eq(maintenanceRequests.id, Number(req.params.id)));
        if (!request.length) return res.status(404).json({ error: "Request not found" });
        res.json(request[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch request" });
    }
});

// GET /api/maintenance/tenant/:tenantId — Tenant: my maintenance requests
router.get("/tenant/:tenantId", async (req: Request, res: Response) => {
    try {
        const tenantRequests = await db
            .select()
            .from(maintenanceRequests)
            .where(eq(maintenanceRequests.tenant_id, Number(req.params.tenantId)));
        res.json(tenantRequests);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tenant requests" });
    }
});

// GET /api/maintenance/property/:propertyId — Owner: requests for my property
router.get("/property/:propertyId", async (req: Request, res: Response) => {
    try {
        const propertyRequests = await db
            .select()
            .from(maintenanceRequests)
            .where(eq(maintenanceRequests.property_id, Number(req.params.propertyId)));
        res.json(propertyRequests);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch property requests" });
    }
});

// POST /api/maintenance — Tenant: submit maintenance request
router.post("/", async (req: Request, res: Response) => {
    try {
        const newRequest = await db.insert(maintenanceRequests).values(req.body).returning();
        res.status(201).json(newRequest[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to create request" });
    }
});

// PUT /api/maintenance/:id — Owner/Admin: update request status/cost
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const updated = await db
            .update(maintenanceRequests)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(maintenanceRequests.id, Number(req.params.id)))
            .returning();
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update request" });
    }
});

// DELETE /api/maintenance/:id — Admin: delete request
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await db.delete(maintenanceRequests).where(eq(maintenanceRequests.id, Number(req.params.id)));
        res.json({ message: "Maintenance request deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete request" });
    }
});

export default router;