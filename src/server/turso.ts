import { createClient, Client } from '@libsql/client';
import { BuyerAnalysisResult, AppSettings } from '../types';
import { INITIAL_BUYER_ASSESSMENTS } from '../data/mockBuyers';

const rawUrl = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();

// If TURSO_DATABASE_URL is provided, use it (typically libsql://[db-name]-[org].turso.io)
// Otherwise, default to local embedded libSQL file (file:local_turso.db)
const dbUrl = rawUrl || 'file:local_turso.db';
const isRemoteTurso = dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://');

export const db: Client = createClient({
  url: dbUrl,
  authToken: authToken || undefined,
});

export const DEFAULT_INITIAL_SETTINGS: AppSettings = {
  ownerName: 'Rajesh Kulkarni',
  ownerRole: 'Managing Director & Credit Head',
  ownerEmail: 'rajesh@kulkarniprecision.in',
  companyName: 'Kulkarni Precision Components Pvt Ltd',
  gstNumber: '27AABCK4921M1Z5',
  primaryIndustry: 'Industrial Manufacturing & B2B Supply',
  defaultCreditPolicy: '30% Advance · Net 30',
  weights: {
    paymentBehaviour: 30,
    purchaseHistory: 25,
    engagement: 20,
    priceAcceptance: 15,
    otherSignals: 10,
  },
  thresholds: {
    lowRiskMin: 75,
    reviewMin: 50,
  },
  notifications: {
    highRiskEmailAlerts: true,
    paymentDelayReminders: true,
    weeklyPipelineDigest: true,
  },
  twoFactorEnabled: true,
};

export async function initDatabase(): Promise<void> {
  try {
    // 1. Buyers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS buyers (
        id TEXT PRIMARY KEY,
        company_name TEXT NOT NULL,
        buyer_name TEXT NOT NULL,
        industry TEXT NOT NULL,
        location TEXT NOT NULL,
        business_type TEXT NOT NULL,
        confidence_score INTEGER NOT NULL,
        risk_level TEXT NOT NULL,
        expected_order_value REAL NOT NULL,
        outstanding_amount REAL NOT NULL,
        average_payment_delay INTEGER NOT NULL,
        credit_terms TEXT NOT NULL,
        assessed_at TEXT NOT NULL,
        date_label TEXT NOT NULL,
        data_json TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Invoices table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        invoice_id TEXT PRIMARY KEY,
        buyer_id TEXT NOT NULL,
        invoice_date TEXT NOT NULL,
        amount REAL NOT NULL,
        terms TEXT NOT NULL,
        settled_in_days INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Settings table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id TEXT PRIMARY KEY,
        settings_json TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Audit Log table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        buyer_id TEXT,
        action TEXT NOT NULL,
        details TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if buyers table is empty; if so, seed initial buyers
    const buyersCountRes = await db.execute('SELECT COUNT(*) as count FROM buyers');
    const count = Number(buyersCountRes.rows[0]?.count ?? 0);

    if (count === 0 && INITIAL_BUYER_ASSESSMENTS.length > 0) {
      console.log(`[Turso DB] Seeding ${INITIAL_BUYER_ASSESSMENTS.length} default buyer assessments...`);
      for (const buyer of INITIAL_BUYER_ASSESSMENTS) {
        await saveBuyerToDb(buyer, false);
      }
      console.log('[Turso DB] Seed completed successfully.');
    }

    // Check if settings table is empty
    const settingsCountRes = await db.execute('SELECT COUNT(*) as count FROM app_settings WHERE id = "default"');
    const settingsCount = Number(settingsCountRes.rows[0]?.count ?? 0);

    if (settingsCount === 0) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO app_settings (id, settings_json, updated_at) VALUES ('default', ?, datetime('now'))`,
        args: [JSON.stringify(DEFAULT_INITIAL_SETTINGS)],
      });
    }

    console.log(`[Turso DB] Initialized database using ${isRemoteTurso ? 'Remote Turso Cloud' : 'Local libSQL'} (${dbUrl})`);
  } catch (error) {
    console.error('[Turso DB] Error during database initialization:', error);
    throw error;
  }
}

export async function getDatabaseStatus() {
  const start = performance.now();
  try {
    await db.execute('SELECT 1 as ping');
    const latencyMs = Math.round(performance.now() - start);

    const buyersRes = await db.execute('SELECT COUNT(*) as count FROM buyers');
    const invoicesRes = await db.execute('SELECT COUNT(*) as count FROM invoices');

    const buyerCount = Number(buyersRes.rows[0]?.count ?? 0);
    const invoiceCount = Number(invoicesRes.rows[0]?.count ?? 0);

    return {
      connected: true,
      mode: isRemoteTurso ? ('remote-turso' as const) : ('local-libsql' as const),
      url: dbUrl.startsWith('libsql://') ? dbUrl.replace(/\/\/[^@]*@/, '//') : dbUrl,
      hasAuthToken: Boolean(authToken),
      latencyMs,
      buyerCount,
      invoiceCount,
      timestamp: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      mode: isRemoteTurso ? ('remote-turso' as const) : ('local-libsql' as const),
      url: dbUrl,
      hasAuthToken: Boolean(authToken),
      latencyMs: -1,
      buyerCount: 0,
      invoiceCount: 0,
      error: message,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getAllBuyersFromDb(): Promise<BuyerAnalysisResult[]> {
  const res = await db.execute('SELECT data_json FROM buyers ORDER BY updated_at DESC, created_at DESC');
  const results: BuyerAnalysisResult[] = [];
  for (const row of res.rows) {
    if (typeof row.data_json === 'string') {
      try {
        results.push(JSON.parse(row.data_json));
      } catch {
        // skip malformed
      }
    }
  }
  return results;
}

export async function getBuyerByIdFromDb(id: string): Promise<BuyerAnalysisResult | null> {
  const res = await db.execute({
    sql: 'SELECT data_json FROM buyers WHERE id = ?',
    args: [id],
  });
  if (res.rows.length === 0) return null;
  const raw = res.rows[0]?.data_json;
  if (typeof raw === 'string') {
    return JSON.parse(raw);
  }
  return null;
}

export async function saveBuyerToDb(buyer: BuyerAnalysisResult, logAudit = true): Promise<void> {
  const input = buyer.input;
  const jsonStr = JSON.stringify(buyer);

  await db.execute({
    sql: `
      INSERT OR REPLACE INTO buyers (
        id, company_name, buyer_name, industry, location, business_type,
        confidence_score, risk_level, expected_order_value, outstanding_amount,
        average_payment_delay, credit_terms, assessed_at, date_label,
        data_json, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, datetime('now')
      )
    `,
    args: [
      buyer.id,
      input.companyName,
      input.buyerName,
      input.industry,
      input.location,
      input.businessType,
      buyer.confidenceScore,
      buyer.riskLevel,
      input.expectedOrderValue,
      input.outstandingAmount,
      input.averagePaymentDelay,
      input.creditTerms,
      buyer.assessedAt,
      buyer.dateLabel,
      jsonStr,
    ],
  });

  // Also sync past invoices relationally
  if (Array.isArray(buyer.pastInvoices) && buyer.pastInvoices.length > 0) {
    for (const inv of buyer.pastInvoices) {
      await db.execute({
        sql: `
          INSERT OR REPLACE INTO invoices (
            invoice_id, buyer_id, invoice_date, amount, terms, settled_in_days, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          inv.invoiceId,
          buyer.id,
          inv.date,
          inv.amount,
          inv.terms,
          inv.settledInDays,
          inv.status,
        ],
      });
    }
  }

  if (logAudit) {
    await db.execute({
      sql: `INSERT INTO audit_logs (id, buyer_id, action, details) VALUES (?, ?, ?, ?)`,
      args: [
        `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        buyer.id,
        'SAVE_BUYER',
        `Score: ${buyer.confidenceScore}/100, Risk: ${buyer.riskLevel}`,
      ],
    });
  }
}

export async function deleteBuyerFromDb(id: string): Promise<boolean> {
  await db.execute({
    sql: 'DELETE FROM invoices WHERE buyer_id = ?',
    args: [id],
  });
  const res = await db.execute({
    sql: 'DELETE FROM buyers WHERE id = ?',
    args: [id],
  });
  await db.execute({
    sql: `INSERT INTO audit_logs (id, buyer_id, action, details) VALUES (?, ?, ?, ?)`,
    args: [
      `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      id,
      'DELETE_BUYER',
      'Buyer record removed',
    ],
  });
  return res.rowsAffected > 0;
}

export async function resetDatabaseToDefaults(defaultBuyers: BuyerAnalysisResult[]): Promise<void> {
  await db.execute('DELETE FROM invoices');
  await db.execute('DELETE FROM buyers');
  for (const b of defaultBuyers) {
    await saveBuyerToDb(b, false);
  }
  await db.execute({
    sql: `INSERT INTO audit_logs (id, buyer_id, action, details) VALUES (?, ?, ?, ?)`,
    args: [
      `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      'SYSTEM',
      'RESET_DEFAULTS',
      `Restored ${defaultBuyers.length} benchmark buyers`,
    ],
  });
}

export async function getSettingsFromDb(): Promise<AppSettings> {
  const res = await db.execute({
    sql: "SELECT settings_json FROM app_settings WHERE id = 'default'",
    args: [],
  });
  if (res.rows.length > 0 && typeof res.rows[0]?.settings_json === 'string') {
    try {
      return JSON.parse(res.rows[0].settings_json);
    } catch {
      // fallback
    }
  }
  // If not found, seed and return default initial settings
  await saveSettingsToDb(DEFAULT_INITIAL_SETTINGS);
  return DEFAULT_INITIAL_SETTINGS;
}

export async function saveSettingsToDb(settings: AppSettings): Promise<void> {
  await db.execute({
    sql: `INSERT OR REPLACE INTO app_settings (id, settings_json, updated_at) VALUES ('default', ?, datetime('now'))`,
    args: [JSON.stringify(settings)],
  });
}
