import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { bookings } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/bookings — Admin: get all bookings
router.get("/", async (req: Request, res: Response) => {
    try {
        const all = await db.select().from(bookings);
        res.json(all);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// GET /api/bookings/:id — Get single booking
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const booking = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, Number(req.params.id)));
        if (!booking.length) return res.status(404).json({ error: "Booking not found" });
        res.json(booking[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch booking" });
    }
});

// GET /api/bookings/tenant/:tenantId — Tenant: my bookings
router.get("/tenant/:tenantId", async (req: Request, res: Response) => {
    try {
        const tenantBookings = await db
            .select()
            .from(bookings)
            .where(eq(bookings.tenant_id, Number(req.params.tenantId)));
        res.json(tenantBookings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tenant bookings" });
    }
});

// GET /api/bookings/property/:propertyId — Owner: bookings for my property
router.get("/property/:propertyId", async (req: Request, res: Response) => {
    try {
        const propertyBookings = await db
            .select()
            .from(bookings)
            .where(eq(bookings.property_id, Number(req.params.propertyId)));
        res.json(propertyBookings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch property bookings" });
    }
});

// POST /api/bookings — Owner/Admin: create booking after approval
router.post("/", async (req: Request, res: Response) => {
    try {
        const newBooking = await db.insert(bookings).values(req.body).returning();
        res.status(201).json(newBooking[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to create booking" });
    }
});

// PUT /api/bookings/:id — Owner/Admin: update booking status
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const updated = await db
            .update(bookings)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(bookings.id, Number(req.params.id)))
            .returning();
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update booking" });
    }
});

// DELETE /api/bookings/:id — Admin: delete booking
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await db.delete(bookings).where(eq(bookings.id, Number(req.params.id)));
        res.json({ message: "Booking deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete booking" });
    }
});

export default router;