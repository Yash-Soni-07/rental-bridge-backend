import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { properties } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/properties — Public: list all available properties
router.get("/", async (req: Request, res: Response) => {
    try {
        const allProperties = await db.select().from(properties);
        res.json(allProperties);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch properties" });
    }
});

// GET /api/properties/:id — Public: get property details
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const property = await db
            .select()
            .from(properties)
            .where(eq(properties.id, Number(req.params.id)));
        if (!property.length) return res.status(404).json({ error: "Property not found" });
        res.json(property[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch property" });
    }
});

// GET /api/properties/owner/:ownerId — Owner: get my properties
router.get("/owner/:ownerId", async (req: Request, res: Response) => {
    try {
        const ownerProperties = await db
            .select()
            .from(properties)
            .where(eq(properties.owner_id, Number(req.params.ownerId)));
        res.json(ownerProperties);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch owner properties" });
    }
});

// POST /api/properties — Owner: create new property
router.post("/", async (req: Request, res: Response) => {
    try {
        const newProperty = await db.insert(properties).values(req.body).returning();
        res.status(201).json(newProperty[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to create property" });
    }
});

// PUT /api/properties/:id — Owner: update property
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const updated = await db
            .update(properties)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(properties.id, Number(req.params.id)))
            .returning();
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update property" });
    }
});

// DELETE /api/properties/:id — Owner/Admin: delete property
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await db.delete(properties).where(eq(properties.id, Number(req.params.id)));
        res.json({ message: "Property deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete property" });
    }
});

export default router;