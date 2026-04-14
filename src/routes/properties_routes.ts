import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { properties } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * Helper: Validate ID
 */
import { parseId } from "../utils/parseId.js";

// DB Error Handler
import {isConstraintViolation } from "../utils/dbErrorHandler.js";

// ─────────────────────────────────────────────
// GET /api/properties — List all properties
// ─────────────────────────────────────────────
router.get("/", async (_req: Request, res: Response) => {
    try {
        const allProperties = await db.select().from(properties);
        return res.status(200).json(allProperties);
    } catch (error) {
        console.error("GET /properties error:", error);
        return res.status(500).json({ error: "Failed to fetch properties" });
    }
});

// ─────────────────────────────────────────────
// GET /api/properties/owner/:ownerId — Owner properties
// ─────────────────────────────────────────────
router.get("/owner/:ownerId", async (req: Request, res: Response) => {
    const ownerId = parseId(req.params.ownerId);
    if (!ownerId) {
        return res.status(400).json({ error: "Invalid owner ID" });
    }

    try {
        const ownerProperties = await db
            .select()
            .from(properties)
            .where(eq(properties.owner_id, ownerId));

        return res.status(200).json(ownerProperties);
    } catch (error) {
        console.error(`GET /properties/owner/${ownerId} error:`, error);
        return res.status(500).json({ error: "Failed to fetch owner properties" });
    }
});

// ─────────────────────────────────────────────
// GET /api/properties/:id — Get property by ID
// ─────────────────────────────────────────────
router.get("/:id", async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid property ID" });
    }

    try {
        const property = await db
            .select()
            .from(properties)
            .where(eq(properties.id, id));

        if (!property.length) {
            return res.status(404).json({ error: "Property not found" });
        }

        return res.status(200).json(property[0]);
    } catch (error) {
        console.error(`GET /properties/${id} error:`, error);
        return res.status(500).json({ error: "Failed to fetch property" });
    }
});

// ─────────────────────────────────────────────
// POST /api/properties — Create property
// ─────────────────────────────────────────────
router.post("/", async (req: Request, res: Response) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body is required" });
        }

        const newProperty = await db
            .insert(properties)
            .values(req.body)
            .returning();

        return res.status(201).json(newProperty[0]);
    } catch (error) {
        console.error("POST /properties error:", error);
        return res.status(500).json({ error: "Failed to create property" });
    }
});

// ─────────────────────────────────────────────
// PUT /api/properties/:id — Update property
// ─────────────────────────────────────────────
router.put("/:id", async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid property ID" });
    }

    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body is required" });
        }

        const updated = await db
            .update(properties)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(properties.id, id))
            .returning();

        if (!updated.length) {
            return res.status(404).json({ error: "Property not found" });
        }

        return res.status(200).json(updated[0]);
    } catch (error) {
        console.error(`PUT /properties/${id} error:`, error);
        return res.status(500).json({ error: "Failed to update property" });
    }
});

// ─────────────────────────────────────────────
// DELETE /api/properties/:id — Delete property
// ─────────────────────────────────────────────
router.delete("/:id", async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid property ID" });
    }

    try {
        const deleted = await db
            .delete(properties)
            .where(eq(properties.id, id))
            .returning();

        if (!deleted.length) {
            return res.status(404).json({ error: "Property not found" });
        }

        return res.status(200).json({
            message: "Property deleted successfully",
        });
    } catch (error: any) {
        console.error(`DELETE /properties/${id} error:`, error);

        if (isConstraintViolation(error)) {
            return res.status(409).json({
                error: "Cannot delete property due to existing dependencies",
            });
        }

        return res.status(500).json({
            error: "Failed to delete property",
        });
    }
});

export default router;