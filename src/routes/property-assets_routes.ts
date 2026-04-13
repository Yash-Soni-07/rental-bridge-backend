import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { propertyImages, amenities, propertyAmenities } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

// ─── Property Images ──────────────────────────────────────────────────────────

// GET /api/property-images/:propertyId — Get all images for a property
router.get("/images/:propertyId", async (req: Request, res: Response) => {
    try {
        const images = await db
            .select()
            .from(propertyImages)
            .where(eq(propertyImages.property_id, Number(req.params.propertyId)));
        res.json(images);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

// POST /api/property-images — Owner: add image to property
router.post("/images", async (req: Request, res: Response) => {
    try {
        const newImage = await db.insert(propertyImages).values(req.body).returning();
        res.status(201).json(newImage[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to add image" });
    }
});

// DELETE /api/property-images/:id — Owner: delete image
router.delete("/images/:id", async (req: Request, res: Response) => {
    try {
        await db.delete(propertyImages).where(eq(propertyImages.id, Number(req.params.id)));
        res.json({ message: "Image deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete image" });
    }
});

// ─── Amenities ────────────────────────────────────────────────────────────────

// GET /api/amenities — Public: list all amenities
router.get("/amenities", async (req: Request, res: Response) => {
    try {
        const allAmenities = await db.select().from(amenities);
        res.json(allAmenities);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch amenities" });
    }
});

// POST /api/amenities — Admin: create amenity
router.post("/amenities", async (req: Request, res: Response) => {
    try {
        const newAmenity = await db.insert(amenities).values(req.body).returning();
        res.status(201).json(newAmenity[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to create amenity" });
    }
});

// DELETE /api/amenities/:id — Admin: delete amenity
router.delete("/amenities/:id", async (req: Request, res: Response) => {
    try {
        await db.delete(amenities).where(eq(amenities.id, Number(req.params.id)));
        res.json({ message: "Amenity deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete amenity" });
    }
});

// ─── Property Amenities ───────────────────────────────────────────────────────

// GET /api/property-amenities/:propertyId — Get amenities for a property
router.get("/property-amenities/:propertyId", async (req: Request, res: Response) => {
    try {
        const result = await db
            .select()
            .from(propertyAmenities)
            .where(eq(propertyAmenities.property_id, Number(req.params.propertyId)));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch property amenities" });
    }
});

// POST /api/property-amenities — Owner: assign amenity to property
router.post("/property-amenities", async (req: Request, res: Response) => {
    try {
        const result = await db.insert(propertyAmenities).values(req.body).returning();
        res.status(201).json(result[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to assign amenity" });
    }
});

// DELETE /api/property-amenities/:id — Owner: remove amenity from property
router.delete("/property-amenities/:id", async (req: Request, res: Response) => {
    try {
        await db.delete(propertyAmenities).where(eq(propertyAmenities.id, Number(req.params.id)));
        res.json({ message: "Amenity removed from property" });
    } catch (err) {
        res.status(500).json({ error: "Failed to remove amenity" });
    }
});

export default router;