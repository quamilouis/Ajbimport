const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();

const dataDirectory = path.join(__dirname, "data");
const databasePath = path.join(dataDirectory, "website.db");
const legacyAdminsFile = path.join(dataDirectory, "admins.json");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const db = new sqlite3.Database(databasePath, (error) => {
  if (error) {
    console.error("Database connection error:", error.message);
  }
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({
        id: this.lastID,
        changes: this.changes
      });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

async function initializeDatabase() {
  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt TEXT NOT NULL,
      resetTokenHash TEXT,
      resetTokenExpires INTEGER,
      passwordChangedAt TEXT
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS quote_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      createdAt TEXT NOT NULL,
      fullName TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      email TEXT NOT NULL,
      service TEXT,
      origin TEXT,
      destination TEXT,
      cargoType TEXT,
      cargoWeight TEXT,
      cargoVolume TEXT,
      shippingDate TEXT,
      preferredContact TEXT DEFAULT 'Email / Phone',
      message TEXT,
      status TEXT DEFAULT 'New',
      adminNotes TEXT DEFAULT ''
    )
  `);

  await run(`CREATE INDEX IF NOT EXISTS idx_admin_email ON admins(email)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_quote_email ON quote_submissions(email)`);
}

async function migrateLegacyAdmins() {
  if (!fs.existsSync(legacyAdminsFile)) {
    return;
  }

  try {
    const raw = fs.readFileSync(legacyAdminsFile, "utf8").trim();
    if (!raw) {
      return;
    }

    const admins = JSON.parse(raw);
    if (!Array.isArray(admins) || admins.length === 0) {
      return;
    }

    const existingAdmins = await all("SELECT email FROM admins");
    const existingEmails = new Set(existingAdmins.map((admin) => admin.email));

    for (const admin of admins) {
      if (!admin || !admin.email || existingEmails.has(admin.email)) {
        continue;
      }

      await run(
        `INSERT INTO admins (id, fullName, email, passwordHash, role, createdAt, resetTokenHash, resetTokenExpires, passwordChangedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          admin.id || crypto.randomUUID(),
          admin.fullName || "Admin",
          admin.email,
          admin.passwordHash || "",
          admin.role || "admin",
          admin.createdAt || new Date().toISOString(),
          admin.resetTokenHash || null,
          admin.resetTokenExpires || null,
          admin.passwordChangedAt || null
        ]
      );

      existingEmails.add(admin.email);
    }
  } catch (error) {
    console.error("Legacy admin migration failed:", error.message);
  }
}

async function getAdminByEmail(email) {
  return get("SELECT * FROM admins WHERE email = ?", [email]);
}

async function getAdminById(id) {
  return get("SELECT * FROM admins WHERE id = ?", [id]);
}

async function getAdminByResetTokenHash(tokenHash) {
  return get("SELECT * FROM admins WHERE resetTokenHash = ?", [tokenHash]);
}

async function getAllAdmins() {
  return all("SELECT * FROM admins ORDER BY createdAt DESC");
}

async function createAdmin({
  id,
  fullName,
  email,
  passwordHash,
  role = "admin",
  createdAt
}) {
  return run(
    `INSERT INTO admins (id, fullName, email, passwordHash, role, createdAt, resetTokenHash, resetTokenExpires, passwordChangedAt)
     VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, NULL)`,
    [id, fullName, email, passwordHash, role, createdAt]
  );
}

async function updatePasswordResetToken(id, resetTokenHash, resetTokenExpires) {
  return run(
    `UPDATE admins
     SET resetTokenHash = ?, resetTokenExpires = ?
     WHERE id = ?`,
    [resetTokenHash, resetTokenExpires, id]
  );
}

async function clearPasswordResetToken(id) {
  return run(
    `UPDATE admins
     SET resetTokenHash = NULL, resetTokenExpires = NULL
     WHERE id = ?`,
    [id]
  );
}

async function updatePassword(id, passwordHash, passwordChangedAt) {
  return run(
    `UPDATE admins
     SET passwordHash = ?, passwordChangedAt = ?, resetTokenHash = NULL, resetTokenExpires = NULL
     WHERE id = ?`,
    [passwordHash, passwordChangedAt, id]
  );
}

async function createQuoteSubmission(payload) {
  const {
    fullName,
    company,
    phone,
    email,
    service,
    origin,
    destination,
    cargoType,
    cargoWeight,
    cargoVolume,
    shippingDate,
    preferredContact,
    message,
    status,
    adminNotes
  } = payload;

  return run(
    `INSERT INTO quote_submissions (
      createdAt,
      fullName,
      company,
      phone,
      email,
      service,
      origin,
      destination,
      cargoType,
      cargoWeight,
      cargoVolume,
      shippingDate,
      preferredContact,
      message,
      status,
      adminNotes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      new Date().toISOString(),
      fullName || "",
      company || "",
      phone || "",
      email || "",
      service || "",
      origin || "",
      destination || "",
      cargoType || "",
      cargoWeight || "",
      cargoVolume || "",
      shippingDate || "",
      preferredContact || "Email / Phone",
      message || "",
      status || "New",
      adminNotes || ""
    ]
  );
}

async function listQuoteSubmissions() {
  return all(`SELECT * FROM quote_submissions ORDER BY createdAt DESC`);
}

module.exports = {
  db,
  initializeDatabase,
  migrateLegacyAdmins,
  getAllAdmins,
  getAdminByEmail,
  getAdminById,
  getAdminByResetTokenHash,
  createAdmin,
  updatePasswordResetToken,
  clearPasswordResetToken,
  updatePassword,
  createQuoteSubmission,
  listQuoteSubmissions
};
