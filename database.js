const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sqlite3 = require("sqlite3").verbose();
const mysql = require("mysql2/promise");

const useMysql = Boolean(process.env.DB_HOST && process.env.DB_NAME);

const dataDirectory =
  process.env.GOOGLE_DATA_DIR ||
  path.join(__dirname, "data");

const databasePath = path.join(dataDirectory, "website.db");
const legacyAdminsFile = path.join(dataDirectory, "admins.json");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

let mysqlPool = null;
let sqliteDb = null;

if (useMysql) {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  sqliteDb = new sqlite3.Database(databasePath, (error) => {
    if (error) {
      console.error("Database connection error:", error.message);
    }
  });
}

const db = useMysql ? mysqlPool : sqliteDb;

function run(sql, params = []) {
  if (useMysql) {
    return mysqlPool.execute(sql, params).then(([result]) => ({
      id: result.insertId,
      changes: result.affectedRows
    }));
  }

  return new Promise((resolve, reject) => {
    sqliteDb.run(sql, params, function onRun(error) {
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
  if (useMysql) {
    return mysqlPool.execute(sql, params).then(([rows]) => rows[0] || null);
  }

  return new Promise((resolve, reject) => {
    sqliteDb.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function all(sql, params = []) {
  if (useMysql) {
    return mysqlPool.execute(sql, params).then(([rows]) => rows);
  }

  return new Promise((resolve, reject) => {
    sqliteDb.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

async function initializeDatabase() {
  if (useMysql) {
    await run(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(255) PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        createdAt DATETIME NOT NULL,
        resetTokenHash TEXT,
        resetTokenExpires BIGINT,
        passwordChangedAt DATETIME NULL
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS quote_submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        createdAt DATETIME NOT NULL,
        fullName VARCHAR(255) NOT NULL,
        company VARCHAR(255) NULL,
        phone VARCHAR(50) NULL,
        email VARCHAR(255) NOT NULL,
        service VARCHAR(255) NULL,
        origin VARCHAR(255) NULL,
        destination VARCHAR(255) NULL,
        cargoType VARCHAR(255) NULL,
        cargoWeight VARCHAR(255) NULL,
        cargoVolume VARCHAR(255) NULL,
        shippingDate VARCHAR(255) NULL,
        preferredContact VARCHAR(255) DEFAULT 'Email / Phone',
        message TEXT,
        status VARCHAR(50) DEFAULT 'New',
        adminNotes TEXT DEFAULT ''
      )
    `);

    await run(`CREATE INDEX IF NOT EXISTS idx_admin_email ON admins(email)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_quote_email ON quote_submissions(email)`);

    await run(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        image TEXT,
        category VARCHAR(100) DEFAULT 'company',
        author VARCHAR(255) DEFAULT 'AJB Imports',
        featured TINYINT(1) DEFAULT 0,
        published TINYINT(1) DEFAULT 1,
        createdAt DATETIME NOT NULL,
        updatedAt DATETIME NOT NULL,
        publishedAt DATETIME NULL
      )
    `);

    await run(`CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published)`);
    return;
  }

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

  await run(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      image TEXT,
      category TEXT DEFAULT 'company',
      author TEXT DEFAULT 'AJB Imports',
      featured INTEGER DEFAULT 0,
      published INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      publishedAt TEXT
    )
  `);

  await run(`CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published)`);
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

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 120);
}

async function findBlogPostBySlug(slug, includeUnpublished = false) {
  const where = includeUnpublished
    ? "WHERE slug = ?"
    : "WHERE slug = ? AND published = 1";
  return get(`SELECT * FROM blog_posts ${where}`, [slug]);
}

async function findBlogPostById(id) {
  return get("SELECT * FROM blog_posts WHERE id = ?", [id]);
}

async function generateUniqueSlug(title, ignoreId = null) {
  let base = slugify(title) || "post-" + Date.now();
  let slug = base;
  let counter = 1;
  while (true) {
    const existing = await get(
      "SELECT id FROM blog_posts WHERE slug = ?",
      [slug]
    );
    if (!existing || (ignoreId && existing.id === ignoreId)) {
      return slug;
    }
    counter += 1;
    slug = `${base}-${counter}`;
  }
}

async function createBlogPost({
  title,
  excerpt,
  content,
  image,
  category,
  author,
  featured = 0,
  published = 1,
  slug
}) {
  const finalSlug = slug && slug.trim()
    ? await generateUniqueSlug(slug)
    : await generateUniqueSlug(title);
  const now = new Date().toISOString();
  const publishedAt = published ? now : null;

  const result = await run(
    `INSERT INTO blog_posts (
      slug, title, excerpt, content, image,
      category, author, featured, published,
      createdAt, updatedAt, publishedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      finalSlug,
      title || "Untitled",
      excerpt || "",
      content || "",
      image || "",
      category || "company",
      author || "AJB Imports",
      featured ? 1 : 0,
      published ? 1 : 0,
      now,
      now,
      publishedAt
    ]
  );

  return get("SELECT * FROM blog_posts WHERE id = ?", [result.id]);
}

async function updateBlogPost(id, updates) {
  const current = await findBlogPostById(id);
  if (!current) return null;

  const fields = {};
  const allowed = [
    "title",
    "excerpt",
    "content",
    "image",
    "category",
    "author",
    "featured",
    "published",
    "slug"
  ];

  for (const key of allowed) {
    if (key in updates) fields[key] = updates[key];
  }

  if (fields.slug !== undefined) {
    fields.slug = await generateUniqueSlug(fields.slug || current.title, id);
  } else if (fields.title !== undefined) {
    fields.slug = await generateUniqueSlug(fields.title, id);
  }

  if ("featured" in fields) fields.featured = fields.featured ? 1 : 0;
  if ("published" in fields) {
    const wasPublished = current.published;
    fields.published = fields.published ? 1 : 0;
    if (!wasPublished && fields.published) {
      fields.publishedAt = new Date().toISOString();
    }
  }

  fields.updatedAt = new Date().toISOString();

  const keys = Object.keys(fields);
  const setSql = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => fields[k]);
  values.push(id);

  await run(
    `UPDATE blog_posts SET ${setSql} WHERE id = ?`,
    values
  );

  return findBlogPostById(id);
}

async function deleteBlogPost(id) {
  return run("DELETE FROM blog_posts WHERE id = ?", [id]);
}

async function listBlogPosts({ includeUnpublished = false } = {}) {
  if (includeUnpublished) {
    return all(`SELECT * FROM blog_posts ORDER BY createdAt DESC`);
  }
  return all(
    `SELECT * FROM blog_posts WHERE published = 1 ORDER BY COALESCE(publishedAt, createdAt) DESC`
  );
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
  listQuoteSubmissions,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  listBlogPosts,
  findBlogPostBySlug,
  findBlogPostById,
  generateUniqueSlug,
  slugify
};
