import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { getDb, ensureDbInitialized } from "./src/db/index";
import {
  categoriesTable,
  movementsTable,
  fixedPaymentsTable,
  fixedPaymentRecordsTable,
  budgetLimitsTable,
} from "./src/db/schema";
import { eq, and } from "drizzle-orm";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_BUDGET_LIMITS,
  DEFAULT_FIXED_PAYMENTS,
  SAMPLE_MOVEMENTS,
  INITIAL_FIXED_PAYMENTS_STATUS,
} from "./src/data/initialData";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Automatically ensure PostgreSQL tables exist for all API calls
  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api") && req.path !== "/api/health") {
      try {
        await ensureDbInitialized();
      } catch (err) {
        console.error("ensureDbInitialized error in middleware:", err);
      }
    }
    next();
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Check DB status and seed if empty
  app.get("/api/db/status", async (req, res) => {
    await ensureDbInitialized();
    const db = getDb();
    if (!db) {
      return res.json({ connected: false, message: "No DATABASE_URL configured" });
    }
    try {
      const cats = await db.select().from(categoriesTable);
      res.json({ connected: true, categoriesCount: cats.length });
    } catch (err: any) {
      res.status(500).json({ connected: false, error: err.message });
    }
  });

  // Seed / Reset Initial Data
  app.post("/api/db/seed", async (req, res) => {
    await ensureDbInitialized();
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    try {
      // Clear existing
      await db.delete(fixedPaymentRecordsTable);
      await db.delete(movementsTable);
      await db.delete(fixedPaymentsTable);
      await db.delete(budgetLimitsTable);
      await db.delete(categoriesTable);

      // Insert categories
      for (const cat of DEFAULT_CATEGORIES) {
        await db.insert(categoriesTable).values({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          iconName: cat.iconName,
          color: cat.color,
          isCustom: false,
        });
      }

      // Insert budget limits
      for (const bl of DEFAULT_BUDGET_LIMITS) {
        await db.insert(budgetLimitsTable).values({
          categoryId: bl.categoryId,
          monthlyLimit: bl.monthlyLimit,
        });
      }

      // Insert fixed payments
      for (const fp of DEFAULT_FIXED_PAYMENTS) {
        await db.insert(fixedPaymentsTable).values({
          id: fp.id,
          name: fp.name,
          amount: fp.amount,
          dueDay: fp.dueDay,
          categoryId: fp.categoryId,
          notes: fp.notes,
          reminderActive: true,
        });
      }

      // Insert sample movements
      for (const mov of SAMPLE_MOVEMENTS) {
        await db.insert(movementsTable).values({
          id: mov.id,
          date: mov.date,
          type: mov.type,
          amount: mov.amount,
          categoryId: mov.categoryId,
          description: mov.description,
          paymentMethod: mov.paymentMethod,
          fixedPaymentId: mov.fixedPaymentId || null,
        });
      }

      // Insert initial fixed payment records
      for (const [yearMonthKey, records] of Object.entries(INITIAL_FIXED_PAYMENTS_STATUS)) {
        const [y, m] = yearMonthKey.split("-").map(Number);
        const monthIndex = m - 1;
        for (const [fixedPaymentId, rec] of Object.entries(records)) {
          const recId = `${y}-${monthIndex}-${fixedPaymentId}`;
          await db.insert(fixedPaymentRecordsTable).values({
            id: recId,
            year: y,
            month: monthIndex,
            fixedPaymentId,
            isPaid: rec.isPaid,
            paidDate: rec.paidDate || null,
            movementId: rec.movementId || null,
          });
        }
      }

      res.json({ success: true, message: "Database seeded successfully" });
    } catch (err: any) {
      console.error("Seed error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get full state
  app.get("/api/state", async (req, res) => {
    await ensureDbInitialized();
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not connected" });
    }
    try {
      let categories = await db.select().from(categoriesTable);
      
      // Auto seed if empty
      if (categories.length === 0) {
        for (const cat of DEFAULT_CATEGORIES) {
          await db.insert(categoriesTable).values({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            iconName: cat.iconName,
            color: cat.color,
            isCustom: false,
          });
        }
        for (const bl of DEFAULT_BUDGET_LIMITS) {
          await db.insert(budgetLimitsTable).values({
            categoryId: bl.categoryId,
            monthlyLimit: bl.monthlyLimit,
          });
        }
        for (const fp of DEFAULT_FIXED_PAYMENTS) {
          await db.insert(fixedPaymentsTable).values({
            id: fp.id,
            name: fp.name,
            amount: fp.amount,
            dueDay: fp.dueDay,
            categoryId: fp.categoryId,
            notes: fp.notes,
            reminderActive: true,
          });
        }
        for (const mov of SAMPLE_MOVEMENTS) {
          await db.insert(movementsTable).values({
            id: mov.id,
            date: mov.date,
            type: mov.type,
            amount: mov.amount,
            categoryId: mov.categoryId,
            description: mov.description,
            paymentMethod: mov.paymentMethod,
            fixedPaymentId: mov.fixedPaymentId || null,
          });
        }
        for (const [yearMonthKey, records] of Object.entries(INITIAL_FIXED_PAYMENTS_STATUS)) {
          const [y, m] = yearMonthKey.split("-").map(Number);
          const monthIndex = m - 1;
          for (const [fixedPaymentId, rec] of Object.entries(records)) {
            const recId = `${y}-${monthIndex}-${fixedPaymentId}`;
            await db.insert(fixedPaymentRecordsTable).values({
              id: recId,
              year: y,
              month: monthIndex,
              fixedPaymentId,
              isPaid: rec.isPaid,
              paidDate: rec.paidDate || null,
              movementId: rec.movementId || null,
            });
          }
        }
        categories = await db.select().from(categoriesTable);
      }

      const movements = await db.select().from(movementsTable);
      const fixedPayments = await db.select().from(fixedPaymentsTable);
      const budgetLimits = await db.select().from(budgetLimitsTable);
      const fixedRecords = await db.select().from(fixedPaymentRecordsTable);

      // Build fixed payment month status record
      const fixedPaymentMonthStatus: Record<string, Record<string, any>> = {};
      for (const rec of fixedRecords) {
        const ymKey = `${rec.year}-${String(rec.month + 1).padStart(2, "0")}`;
        if (!fixedPaymentMonthStatus[ymKey]) {
          fixedPaymentMonthStatus[ymKey] = {};
        }
        fixedPaymentMonthStatus[ymKey][rec.fixedPaymentId] = {
          isPaid: rec.isPaid,
          paidDate: rec.paidDate,
          movementId: rec.movementId,
        };
      }

      res.json({
        categories,
        movements,
        fixedPayments,
        budgetLimits,
        fixedPaymentMonthStatus,
      });
    } catch (err: any) {
      console.error("Get state error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // --- MOVEMENTS ENDPOINTS ---
  app.post("/api/movements", async (req, res) => {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not connected" });
    try {
      const mov = req.body;
      await db.insert(movementsTable).values({
        id: mov.id,
        date: mov.date,
        type: mov.type,
        amount: mov.amount,
        categoryId: mov.categoryId,
        description: mov.description,
        paymentMethod: mov.paymentMethod,
        fixedPaymentId: mov.fixedPaymentId || null,
      });
      res.json({ success: true, movement: mov });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/movements/:id", async (req, res) => {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not connected" });
    try {
      const { id } = req.params;
      await db.delete(movementsTable).where(eq(movementsTable.id, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- FIXED PAYMENTS ENDPOINTS ---
  app.post("/api/fixed-payments", async (req, res) => {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not connected" });
    try {
      const fp = req.body;
      await db.insert(fixedPaymentsTable).values({
        id: fp.id,
        name: fp.name,
        amount: fp.amount,
        dueDay: fp.dueDay,
        categoryId: fp.categoryId,
        notes: fp.notes || null,
        reminderActive: fp.reminderActive !== false,
      });
      res.json({ success: true, fixedPayment: fp });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/fixed-payments/:id", async (req, res) => {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not connected" });
    try {
      const { id } = req.params;
      await db.delete(fixedPaymentsTable).where(eq(fixedPaymentsTable.id, id));
      await db.delete(fixedPaymentRecordsTable).where(eq(fixedPaymentRecordsTable.fixedPaymentId, id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- FIXED PAYMENT RECORD TOGGLE ---
  app.post("/api/fixed-payments/toggle-status", async (req, res) => {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not connected" });
    try {
      const { year, month, fixedPaymentId, isPaid, paidDate, movementId } = req.body;
      const recId = `${year}-${month}-${fixedPaymentId}`;
      
      const existing = await db
        .select()
        .from(fixedPaymentRecordsTable)
        .where(eq(fixedPaymentRecordsTable.id, recId));

      if (existing.length > 0) {
        await db
          .update(fixedPaymentRecordsTable)
          .set({
            isPaid,
            paidDate: paidDate || null,
            movementId: movementId || null,
            updatedAt: new Date(),
          })
          .where(eq(fixedPaymentRecordsTable.id, recId));
      } else {
        await db.insert(fixedPaymentRecordsTable).values({
          id: recId,
          year,
          month,
          fixedPaymentId,
          isPaid,
          paidDate: paidDate || null,
          movementId: movementId || null,
        });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- CATEGORIES ENDPOINTS ---
  app.post("/api/categories", async (req, res) => {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not connected" });
    try {
      const cat = req.body;
      await db.insert(categoriesTable).values({
        id: cat.id,
        name: cat.name,
        type: cat.type,
        iconName: cat.iconName,
        color: cat.color,
        isCustom: true,
      });
      res.json({ success: true, category: cat });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- BUDGET LIMITS ENDPOINTS ---
  app.post("/api/budget-limits", async (req, res) => {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not connected" });
    try {
      const { categoryId, monthlyLimit } = req.body;
      const existing = await db
        .select()
        .from(budgetLimitsTable)
        .where(eq(budgetLimitsTable.categoryId, categoryId));

      if (existing.length > 0) {
        await db
          .update(budgetLimitsTable)
          .set({ monthlyLimit, updatedAt: new Date() })
          .where(eq(budgetLimitsTable.categoryId, categoryId));
      } else {
        await db.insert(budgetLimitsTable).values({
          categoryId,
          monthlyLimit,
        });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- IMPORT RESTORE FULL DATA ---
  app.post("/api/import-backup", async (req, res) => {
    const db = getDb();
    if (!db) return res.status(500).json({ error: "Database not connected" });
    try {
      const { movements, fixedPayments, budgetLimits, categories, fixedPaymentMonthStatus } = req.body;

      if (categories && Array.isArray(categories)) {
        await db.delete(categoriesTable);
        for (const cat of categories) {
          await db.insert(categoriesTable).values({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            iconName: cat.iconName,
            color: cat.color,
            isCustom: cat.isCustom || false,
          });
        }
      }

      if (movements && Array.isArray(movements)) {
        await db.delete(movementsTable);
        for (const mov of movements) {
          await db.insert(movementsTable).values({
            id: mov.id,
            date: mov.date,
            type: mov.type,
            amount: mov.amount,
            categoryId: mov.categoryId,
            description: mov.description,
            paymentMethod: mov.paymentMethod,
            fixedPaymentId: mov.fixedPaymentId || null,
          });
        }
      }

      if (fixedPayments && Array.isArray(fixedPayments)) {
        await db.delete(fixedPaymentsTable);
        for (const fp of fixedPayments) {
          await db.insert(fixedPaymentsTable).values({
            id: fp.id,
            name: fp.name,
            amount: fp.amount,
            dueDay: fp.dueDay,
            categoryId: fp.categoryId,
            notes: fp.notes,
            reminderActive: fp.reminderActive !== false,
          });
        }
      }

      if (budgetLimits && Array.isArray(budgetLimits)) {
        await db.delete(budgetLimitsTable);
        for (const bl of budgetLimits) {
          await db.insert(budgetLimitsTable).values({
            categoryId: bl.categoryId,
            monthlyLimit: bl.monthlyLimit,
          });
        }
      }

      if (fixedPaymentMonthStatus && typeof fixedPaymentMonthStatus === "object") {
        await db.delete(fixedPaymentRecordsTable);
        for (const [yearMonthKey, records] of Object.entries(fixedPaymentMonthStatus)) {
          const [y, m] = yearMonthKey.split("-").map(Number);
          const monthIndex = m - 1;
          for (const [fixedPaymentId, rec] of Object.entries(records as Record<string, any>)) {
            const recId = `${y}-${monthIndex}-${fixedPaymentId}`;
            await db.insert(fixedPaymentRecordsTable).values({
              id: recId,
              year: y,
              month: monthIndex,
              fixedPaymentId,
              isPaid: !!rec.isPaid,
              paidDate: rec.paidDate || null,
              movementId: rec.movementId || null,
            });
          }
        }
      }

      res.json({ success: true, message: "Restored successfully" });
    } catch (err: any) {
      console.error("Import backup error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development / static serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
