import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { payments } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/payments — Admin: get all payments
router.get("/", async (req: Request, res: Response) => {
    try {
        const all = await db.select().from(payments);
        res.json(all);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch payments" });
    }
});

// GET /api/payments/:id — Get single payment
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const payment = await db
            .select()
            .from(payments)
            .where(eq(payments.id, Number(req.params.id)));
        if (!payment.length) return res.status(404).json({ error: "Payment not found" });
        res.json(payment[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch payment" });
    }
});

// GET /api/payments/booking/:bookingId — Tenant/Owner: payments for a booking
router.get("/booking/:bookingId", async (req: Request, res: Response) => {
    try {
        const bookingPayments = await db
            .select()
            .from(payments)
            .where(eq(payments.booking_id, Number(req.params.bookingId)));
        res.json(bookingPayments);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch booking payments" });
    }
});

// POST /api/payments — Tenant: make a payment
router.post("/", async (req: Request, res: Response) => {
    try {
        const newPayment = await db.insert(payments).values(req.body).returning();
        res.status(201).json(newPayment[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to create payment" });
    }
});

// PUT /api/payments/:id — Admin/Owner: update payment status
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const updated = await db
            .update(payments)
            .set(req.body)
            .where(eq(payments.id, Number(req.params.id)))
            .returning();
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update payment" });
    }
});

export default router;