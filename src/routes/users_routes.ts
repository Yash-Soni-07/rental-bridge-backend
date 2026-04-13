import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema/app.js";
import { eq } from "drizzle-orm";

const router = Router();

// GET /api/users — Admin only: get all users
router.get("/", async (req: Request, res: Response) => {
    try {
        const allUsers = await db.select().from(users);
        res.json(allUsers);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// GET /api/users/:id — Get user by ID
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const user = await db.select().from(users).where(eq(users.id, Number(req.params.id)));
        if (!user.length) return res.status(404).json({ error: "User not found" });
        res.json(user[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// POST /api/users — Register new user
router.post("/", async (req: Request, res: Response) => {
    try {
        const newUser = await db.insert(users).values(req.body).returning();
        res.status(201).json(newUser[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to create user" });
    }
});

// PUT /api/users/:id — Update user profile
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const updated = await db
            .update(users)
            .set({ ...req.body, updated_at: new Date() })
            .where(eq(users.id, Number(req.params.id)))
            .returning();
        res.json(updated[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

// DELETE /api/users/:id — Admin only: delete user
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        await db.delete(users).where(eq(users.id, Number(req.params.id)));
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;