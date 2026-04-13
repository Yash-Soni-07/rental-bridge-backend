import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { bookings } from "../db/schema/app.js";
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

// GET /api/bookings — Admin: get all bookings
router.get("/", async (_req: Request, res: Response) => {
    try {
        const all = await db.select().from(bookings);
        return res.status(200).json(all);
    } catch (error) {
        console.error("GET /bookings error:", error);
        return res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// GET /api/bookings/:id — Get single booking
router.get("/:id", async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid booking ID" });
    }

    try {
        const booking = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, id));

        if (!booking.length) {
            return res.status(404).json({ error: "Booking not found" });
        }

        return res.status(200).json(booking[0]);
    } catch (error) {
        console.error(`GET /bookings/${id} error:`, error);
        return res.status(500).json({ error: "Failed to fetch booking" });
    }
});

// GET /api/bookings/tenant/:tenantId — Tenant: my bookings
router.get("/tenant/:tenantId", async (req: Request, res: Response) => {
    const tenantId = parseId(req.params.tenantId);
    if (!tenantId) {
        return res.status(400).json({ error: "Invalid tenant ID" });
    }

    try {
        const tenantBookings = await db
            .select()
            .from(bookings)
            .where(eq(bookings.tenant_id, tenantId));

        return res.status(200).json(tenantBookings);
    } catch (error) {
        console.error(`GET /bookings/tenant/${tenantId} error:`, error);
        return res.status(500).json({ error: "Failed to fetch tenant bookings" });
    }
});

// GET /api/bookings/property/:propertyId — Owner: bookings for property
router.get("/property/:propertyId", async (req: Request, res: Response) => {
    const propertyId = parseId(req.params.propertyId);
    if (!propertyId) {
        return res.status(400).json({ error: "Invalid property ID" });
    }

    try {
        const propertyBookings = await db
            .select()
            .from(bookings)
            .where(eq(bookings.property_id, propertyId));

        return res.status(200).json(propertyBookings);
    } catch (error) {
        console.error(`GET /bookings/property/${propertyId} error:`, error);
        return res.status(500).json({ error: "Failed to fetch property bookings" });
    }
});

// POST /api/bookings — Create booking
router.post("/", async (req: Request, res: Response) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body is required" });
        }

        const newBooking = await db
            .insert(bookings)
            .values(req.body)
            .returning();

        return res.status(201).json(newBooking[0]);
    } catch (error) {
        console.error("POST /bookings error:", error);
        return res.status(500).json({ error: "Failed to create booking" });
    }
});

// PUT /api/bookings/:id — Update booking
router.put("/:id", async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid booking ID" });
    }

    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ error: "Request body is required" });
        }

        const updated = await db
            .update(bookings)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(bookings.id, id))
            .returning();

        if (!updated.length) {
            return res.status(404).json({ error: "Booking not found" });
        }

        return res.status(200).json(updated[0]);
    } catch (error) {
        console.error(`PUT /bookings/${id} error:`, error);
        return res.status(500).json({ error: "Failed to update booking" });
    }
});

// DELETE /api/bookings/:id — Delete booking
router.delete("/:id", async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    if (!id) {
        return res.status(400).json({ error: "Invalid booking ID" });
    }

    try {
        const deleted = await db
            .delete(bookings)
            .where(eq(bookings.id, id))
            .returning();

        if (!deleted.length) {
            return res.status(404).json({ error: "Booking not found" });
        }

        return res.status(200).json({
            message: "Booking deleted successfully",
        });
    } catch (error) {
        console.error(`DELETE /bookings/${id} error:`, error);
        return res.status(500).json({ error: "Failed to delete booking" });
    }
});

export default router;