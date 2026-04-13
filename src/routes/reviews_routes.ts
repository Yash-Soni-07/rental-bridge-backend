import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { reviews } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/reviews — Admin: get all reviews
router.get("/", async (req: Request, res: Response) => {
    try {
        const all = await db.select().from(reviews);
        res.json(all);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// GET /api/reviews/property/:propertyId — Public: reviews for a property
router.get("/property/:propertyId", async (req: Request, res: Response) => {
    try {
        const propertyReviews = await db
            .select()
            .from(reviews)
            .where(eq(reviews.property_id, Number(req.params.propertyId)));
        res.json(propertyReviews);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch property reviews" });
    }
});

// GET /api/reviews/reviewer/:reviewerId — Tenant: my reviews
router.get("/reviewer/:reviewerId", async (req: Request, res: Response) => {
    try {
        const userReviews = await db
            .select()
            .from(reviews)
            .where(eq(reviews.reviewer_id, Number(req.params.reviewerId)));
        res.json(userReviews);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user reviews" });
    }
});

// POST /api/reviews — Tenant: submit review
router.post("/", async (req: Request, res: Response) => {
    try {
        const newReview = await db.insert(reviews).values(req.body).returning();
        res.status(201).json(newReview[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to submit review" });
    }
});

// PUT /api/reviews/:id — Admin: verify or update review
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const updated = await db
            .update(reviews)
            .set(req.body)
            .where(eq(reviews.id, Number(req.params.id)))
            .returning();
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update review" });
    }
});

// DELETE /api/reviews/:id — Admin/Tenant: delete review
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await db.delete(reviews).where(eq(reviews.id, Number(req.params.id)));
        res.json({ message: "Review deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete review" });
    }
});

export default router;