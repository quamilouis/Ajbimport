/* =========================================================
   AJB IMPORTS GHANA
   SECURE LOGISTICS WEBSITE SERVER
========================================================= */

require("dotenv").config();

const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("./database");
const sheets = require("./google-sheets");

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================================================
   MIDDLEWARE
======================================================== */

app.set(
    "trust proxy",
    1
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* =========================================================
   SESSION
======================================================== */

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "change-this-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure:
                process.env.NODE_ENV ===
                "production",
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 4
        }
    })
);


/* =========================================================
    DATA STORAGE
    SQLite database.
======================================================== */

let dbInitialized = false;

async function ensureDatabase() {
    if (dbInitialized) return;
    await db.initializeDatabase();
    await db.migrateLegacyAdmins();
    dbInitialized = true;
}


/* =========================================================
   ADMIN AUTHENTICATION MIDDLEWARE
========================================================= */

function requireAdmin(req, res, next) {

    if (
        req.session &&
        req.session.isAdmin === true
    ) {
        return next();
    }

    return res.status(401).json({
        success: false,
        message: "Authentication required."
    });

}


/* =========================================================
   PUBLIC WEBSITE
========================================================= */

app.use(
    express.static(
        path.join(__dirname)
    )
);


/* =========================================================
   ADMIN LOGIN PAGE
========================================================= */

app.get("/admin/login", (req, res) => {

    if (
        req.session &&
        req.session.isAdmin
    ) {

        return res.redirect(
            "/admin/dashboard"
        );

    }

    res.sendFile(
        path.join(
            __dirname,
            "admin-login.html"
        )
    );

});


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

app.get(
    "/admin/dashboard",
    requireAdmin,
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "admin.html"
            )
        );

    }
);


/* =========================================================
   ADMIN LOGIN API
========================================================= */

app.post(
    "/api/admin/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;


            if (!email || !password) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email and password are required."
                });

            }


            await ensureDatabase();


            let admin = await db.getAdminByEmail(
                email.trim().toLowerCase()
            );


            if (
                admin &&
                admin.passwordHash
            ) {

                const passwordMatches =
                    await bcrypt.compare(
                        password,
                        admin.passwordHash
                    );


                if (passwordMatches) {

                    req.session.isAdmin = true;

                    req.session.adminEmail =
                        admin.email;


                    return res.json({
                        success: true,
                        message:
                            "Login successful.",
                        redirect:
                            "/admin/dashboard"
                    });

                }


                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password."
                });

            }


            const adminEmail =
                process.env.ADMIN_EMAIL;


            const passwordHash =
                process.env.ADMIN_PASSWORD_HASH;


            if (
                !adminEmail ||
                !passwordHash
            ) {

                console.error(
                    "Admin credentials are not configured."
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Admin authentication is not configured."
                });

            }


            if (
                email.trim().toLowerCase() !==
                adminEmail.trim().toLowerCase()
            ) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password."
                });

            }


            const envPasswordMatches =
                await bcrypt.compare(
                    password,
                    passwordHash
                );


            if (!envPasswordMatches) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password."
                });

            }


            req.session.isAdmin = true;

            req.session.adminEmail =
                adminEmail;


            return res.json({
                success: true,
                message:
                    "Login successful.",
                redirect:
                    "/admin/dashboard"
            });

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to login."
            });

        }

    }
);


/* =========================================================
   ADMIN SESSION CHECK
========================================================= */

app.get(
    "/api/admin/me",
    requireAdmin,
    (req, res) => {

        res.json({
            success: true,
            admin: {
                email:
                    req.session.adminEmail
            }
        });

    }
);


/* =========================================================
   ADMIN LOGOUT
========================================================= */

app.post(
    "/api/admin/logout",
    (req, res) => {

        req.session.destroy(error => {

            if (error) {

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to logout."
                });

            }


            res.clearCookie(
                "connect.sid"
            );


            res.json({
                success: true,
                message:
                    "Logged out successfully."
            });

        });

    }
);


/* =========================================================
   QUOTE SUBMISSION
========================================================= */

app.post(
    "/api/quote",
    async (req, res) => {

        try {

            await ensureDatabase();


            const {
                fullName,
                company,
                email,
                phone,
                service,
                origin,
                destination,
                cargoType,
                cargoWeight,
                cargoVolume,
                shippingDate,
                message
            } = req.body;


            if (
                !fullName ||
                !email ||
                !phone ||
                !service ||
                !origin ||
                !destination ||
                !message
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please complete all required fields."
                });

            }


            const enquiry =
                await db.createQuoteSubmission({

                    fullName,

                    company,

                    email,

                    phone,

                    service,

                    origin,

                    destination,

                    cargoType,

                    cargoWeight,

                    cargoVolume,

                    shippingDate,

                    message

                });


            console.log(
                "New AJB quote:",
                enquiry
            );


            try {

                await sheets.appendQuoteSubmission({

                    createdAt:
                        new Date().toISOString(),

                    fullName,

                    company,

                    phone,

                    email,

                    service,

                    origin,

                    destination,

                    cargoType:

                        cargoType ||
                        "",

                    cargoWeight,

                    cargoVolume,

                    shippingDate,

                    preferredContact:
                        "Email / Phone",

                    message,

                    status: "New",

                    adminNotes: ""

                });

            } catch (sheetError) {

                console.error(
                    "Google Sheets sync error:",
                    sheetError.message
                );

            }


            res.status(201).json({

                success: true,

                message:
                    "Quote request received.",

                enquiry: {
                    id:
                        enquiry.lastID
                }

            });

        } catch (error) {

            console.error(
                "Quote error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to submit quote."
            });

        }

    }
);


/* =========================================================
   ADMIN - GET QUOTES
========================================================= */

app.get(
    "/api/admin/quotes",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            const quotes =
                await db.listQuoteSubmissions();


            res.json({

                success: true,

                quotes

            });

        } catch (error) {

            console.error(
                "Unable to load quotes:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load quotes."
            });

        }

    }
);


/* =========================================================
   ADMIN - UPDATE QUOTE STATUS
========================================================= */

app.patch(
    "/api/admin/quotes/:id",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            const {
                status
            } = req.body;


            const allowedStatuses = [
                "New",
                "Contacted",
                "Processing",
                "Completed",
                "Cancelled"
            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid status."
                });

            }


            const rows =
                await db.all(
                    `SELECT * FROM quote_submissions WHERE id = ?`,
                    [req.params.id]
                );

            const enquiry =
                rows[0];


            if (!enquiry) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Quote not found."
                });

            }


            await db.run(
                `UPDATE quote_submissions SET status = ? WHERE id = ?`,
                [status, req.params.id]
            );


            res.json({

                success: true,

                message:
                    "Status updated.",

                enquiry: {
                    ...enquiry,
                    status
                }

            });

        } catch (error) {

            console.error(
                "Status update error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update status."
            });

        }

    }
);


/* =========================================================
   ADMIN STATISTICS
========================================================= */

app.get(
    "/api/admin/stats",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            const quotes =
                await db.listQuoteSubmissions();


            const total =
                quotes.length;


            const newQuotes =
                quotes.filter(
                    item =>
                        item.status ===
                        "New"
                ).length;


            const contacted =
                quotes.filter(
                    item =>
                        item.status ===
                        "Contacted"
                ).length;


            const processing =
                quotes.filter(
                    item =>
                        item.status ===
                        "Processing"
                ).length;


            const completed =
                quotes.filter(
                    item =>
                        item.status ===
                        "Completed"
                ).length;


            res.json({

                success: true,

                stats: {

                    total,

                    new:
                        newQuotes,

                    contacted,

                    processing,

                    completed

                }

            });

        } catch (error) {

            console.error(
                "Stats error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load stats."
            });

        }

    }
);



/* =========================================================
   FORGOT PASSWORD
======================================================== */

const resetTokenCache = new Map();

app.post(
    "/api/admin/forgot-password",
    async (req, res) => {

        try {

            await ensureDatabase();

            const { email } = req.body;


            if (!email) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Email is required."
                });

            }


            const admin =
                await db.getAdminByEmail(
                    email.trim().toLowerCase()
                );


            const genericMessage =
                "If an administrator account exists with that email, you will receive a reset link.";


            if (!admin) {

                return res.json({
                    success: true,
                    message: genericMessage
                });

            }


            const token =
                crypto.randomBytes(32).toString("hex");

            const tokenHash =
                crypto
                    .createHash("sha256")
                    .update(token)
                    .digest("hex");

            const expires =
                Date.now() + 1000 * 60 * 60 * 2;


            await db.updatePasswordResetToken(
                admin.id,
                tokenHash,
                expires
            );


            resetTokenCache.set(tokenHash, {
                id: admin.id,
                expires
            });


            const transporter =
                nodemailer.createTransport({

                    host:
                        process.env.SMTP_HOST ||
                        "smtp.gmail.com",

                    port:
                        parseInt(
                            process.env.SMTP_PORT ||
                            "587"
                        ),

                    secure: false,

                    auth: {

                        user:
                            process.env.SMTP_USER,

                        pass:
                            process.env.SMTP_PASS

                    }

                });


            const resetUrl =
                `${req.protocol}://${req.get("host")}/reset-password.html?token=${token}`;


            await transporter.sendMail({

                from:
                    `"AJB Imports Admin" <${process.env.SMTP_USER}>`,

                to: admin.email,

                subject:
                    "AJB Imports - Password Reset",

                text:
                    `Click the following link to reset your password: ${resetUrl}\n\nThis link expires in 2 hours.`

            });


            return res.json({
                success: true,
                message: genericMessage
            });

        } catch (error) {

            console.error(
                "Forgot password error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to process request."
            });

        }

    }
);


/* =========================================================
   RESET PASSWORD
======================================================== */

app.post(
    "/api/admin/reset-password",
    async (req, res) => {

        try {

            await ensureDatabase();

            const {
                token,
                password
            } = req.body;


            if (!token || !password) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Token and password are required."
                });

            }


            const tokenHash =
                crypto
                    .createHash("sha256")
                    .update(token)
                    .digest("hex");


            const cached =
                resetTokenCache.get(tokenHash);


            let admin = null;


            if (cached && cached.expires > Date.now()) {

                admin = await db.getAdminById(cached.id);

            } else {

                admin = await db.getAdminByResetTokenHash(tokenHash);

            }


            if (!admin) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid or expired reset token."
                });

            }


            const passwordHash =
                await bcrypt.hash(password, 12);


            await db.updatePassword(
                admin.id,
                passwordHash,
                new Date().toISOString()
            );


            resetTokenCache.delete(tokenHash);

            await db.clearPasswordResetToken(admin.id);


            return res.json({
                success: true,
                message:
                    "Password reset successfully."
            });

        } catch (error) {

            console.error(
                "Reset password error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to reset password."
            });

        }

    }
);


/* =========================================================
   PUBLIC BLOG API
   ======================================================== */

const BLOG_CATEGORIES = {
  company: "Company News",
  logistics: "Logistics",
  import: "Import & Export",
  tips: "Shipping Tips"
};

function blogCategoryLabel(key) {
  return BLOG_CATEGORIES[key] || BLOG_CATEGORIES.company;
}

function shapeBlogPost(post) {
  if (!post) return null;
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    content: post.content || "",
    image: post.image || "",
    category: post.category || "company",
    categoryLabel: blogCategoryLabel(post.category),
    author: post.author || "AJB Imports",
    featured: post.featured === 1,
    published: post.published === 1,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    publishedAt: post.publishedAt || null,
    date: post.publishedAt || post.createdAt
  };
}

function slugifyBlogTitle(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 120);
}


app.get(
    "/api/blog",
    async (req, res) => {

        try {

            await ensureDatabase();

            const posts = await db.listBlogPosts();

            res.json(
                posts.map(shapeBlogPost)
            );

        } catch (error) {

            console.error(
                "Blog list error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load blog posts."
            });

        }

    }
);


app.get(
    "/api/blog/categories",
    (req, res) => {

        res.json(
            Object.entries(
                BLOG_CATEGORIES
            ).map(
                ([
                    key,
                    label
                ]) => ({
                    key,
                    label
                })
            )
        );

    }
);


app.get(
    "/api/blog/:slug",
    async (req, res) => {

        try {

            await ensureDatabase();

            const post =
                await db.findBlogPostBySlug(
                    req.params.slug
                );


            if (!post) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Article not found."
                });

            }


            res.json(
                shapeBlogPost(post)
            );

        } catch (error) {

            console.error(
                "Blog get error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load article."
            });

        }

    }
);


// =========================================================
//   ADMIN - BLOG MANAGEMENT
// ========================================================

app.get(
    "/api/admin/blog",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            const posts =
                await db.listBlogPosts({
                    includeUnpublished: true
                });


            res.json({
                success: true,
                posts: posts.map(shapeBlogPost)
            });

        } catch (error) {

            console.error(
                "Admin blog list error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load posts."
            });

        }

    }
);


app.get(
    "/api/admin/blog/:id",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            const post =
                await db.findBlogPostById(
                    req.params.id
                );


            if (!post) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Post not found."
                });

            }


            res.json({
                success: true,
                post: shapeBlogPost(post)
            });

        } catch (error) {

            console.error(
                "Admin blog get error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load post."
            });

        }

    }
);


app.post(
    "/api/admin/blog",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            const {
                title,
                excerpt,
                content,
                image,
                category,
                author,
                featured,
                published,
                slug
            } = req.body;


            if (
                !title ||
                !content
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Title and content are required."
                });

            }


            const post =
                await db.createBlogPost({

                    title: title.trim(),

                    excerpt: excerpt || "",

                    content,

                    image: image || "",

                    category:
                        category &&
                        BLOG_CATEGORIES[category]
                            ? category
                            : "company",

                    author:
                        author ||
                        "AJB Imports",

                    featured:
                        featured === true ||
                        featured === 1,

                    published:
                        published === undefined
                            ? true
                            : Boolean(
                                published
                            ),

                    slug:
                        slug
                            ? slugifyBlogTitle(slug)
                            : undefined

                });


            res.status(201).json({
                success: true,
                message:
                    "Post created.",
                post: shapeBlogPost(post)
            });

        } catch (error) {

            console.error(
                "Admin blog create error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to create post."
            });

        }

    }
);


app.put(
    "/api/admin/blog/:id",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            const existing =
                await db.findBlogPostById(
                    req.params.id
                );


            if (!existing) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Post not found."
                });

            }


            const updates = {};

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

                if (
                    key in
                    req.body
                ) {

                    updates[key] =
                        req.body[key];

                }

            }


            if (
                "category" in
                updates &&
                !BLOG_CATEGORIES[
                    updates.category
                ]
            ) {

                updates.category =
                    "company";

            }


            const post =
                await db.updateBlogPost(
                    req.params.id,
                    updates
                );


            res.json({
                success: true,
                message:
                    "Post updated.",
                post: shapeBlogPost(post)
            });

        } catch (error) {

            console.error(
                "Admin blog update error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update post."
            });

        }

    }
);


app.patch(
    "/api/admin/blog/:id",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            const existing =
                await db.findBlogPostById(
                    req.params.id
                );


            if (!existing) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Post not found."
                });

            }


            const updates = {};


            if (
                "published" in
                req.body
            ) {

                updates.published =
                    Boolean(
                        req.body.published
                    );

            }


            if (
                "featured" in
                req.body
            ) {

                updates.featured =
                    Boolean(
                        req.body.featured
                    );

            }


            const post =
                await db.updateBlogPost(
                    req.params.id,
                    updates
                );


            res.json({
                success: true,
                message:
                    "Post updated.",
                post: shapeBlogPost(post)
            });

        } catch (error) {

            console.error(
                "Admin blog patch error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update post."
            });

        }

    }
);


app.delete(
    "/api/admin/blog/:id",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            const existing =
                await db.findBlogPostById(
                    req.params.id
                );


            if (!existing) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Post not found."
                });

            }


            await db.deleteBlogPost(
                req.params.id
            );


            res.json({
                success: true,
                message:
                    "Post deleted."
            });

        } catch (error) {

            console.error(
                "Admin blog delete error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to delete post."
            });

        }

    }
);


/* =========================================================
    ADMIN - GOOGLE SHEETS MANAGEMENT
    ========================================================= */

app.get(
    "/api/admin/sheets/status",
    requireAdmin,
    async (req, res) => {

        try {

            await ensureDatabase();

            res.json({
                success: true,
                configured: sheets.isConfigured(),
                sheetId: sheets.extractSheetId(
                    process.env.GOOGLE_SHEET_ID || ""
                ),
                sheetTab:
                    process.env.GOOGLE_SHEET_TAB ||
                    "Quote Submissions"
            });

        } catch (error) {

            console.error(
                "Sheets status error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load sheets status."
            });

        }

    }
);


app.get(
    "/api/admin/sheets/submissions",
    requireAdmin,
    async (req, res) => {

        await ensureDatabase();

        try {

            const submissions =
                await sheets.getSubmissions();

            res.json({
                success: true,
                submissions
            });

        } catch (error) {

            console.error(
                "Sheets submissions error:",
                error
            );

            res.status(502).json({
                success: false,
                message: error.message ||
                    "Unable to load submissions from Google Sheets."
            });

        }

    }
);


app.post(
    "/api/admin/sheets/sync",
    requireAdmin,
    async (req, res) => {

        await ensureDatabase();

        try {

            const submissions =
                await sheets.getSubmissions();

            let synced = 0;
            let updated = 0;

            for (const sub of submissions) {

                const createdAt =
                    sub["Submission Date"] || "";

                const email =
                    sub["Email"] || "";

                const existing = await db.get(
                    `SELECT id FROM quote_submissions
                     WHERE email = ? AND createdAt = ?`,
                    [email, createdAt]
                );

                if (existing) {

                    await db.run(
                        `UPDATE quote_submissions
                         SET status = ?,
                             adminNotes = ?
                         WHERE id = ?`,
                        [
                            sub["Status"] || "New",
                            sub["Admin Notes"] || "",
                            existing.id
                        ]
                    );

                    updated++;

                } else {

                    await db.run(
                        `INSERT INTO quote_submissions
                         (createdAt, fullName, company, phone,
                          email, service, origin, destination,
                          cargoType, cargoWeight, cargoVolume,
                          shippingDate, preferredContact,
                          message, status, adminNotes)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            createdAt ||
                                new Date().toISOString(),
                            sub["Customer Name"] || "",
                            sub["Company"] || "",
                            sub["Phone"] || "",
                            email || "",
                            sub["Service Requested"] || "",
                            sub["Origin"] || "",
                            sub["Destination"] || "",
                            sub["Cargo / Package Details"] || "",
                            sub["Cargo Weight"] || "",
                            sub["Cargo Volume"] || "",
                            sub["Shipping Date"] || "",
                            sub["Preferred Contact"] ||
                                "Email / Phone",
                            sub["Message"] || "",
                            sub["Status"] || "New",
                            sub["Admin Notes"] || ""
                        ]
                    );

                    synced++;

                }

            }

            res.json({
                success: true,
                synced,
                updated,
                total: submissions.length
            });

        } catch (error) {

            console.error(
                "Sheets sync error:",
                error
            );

            res.status(502).json({
                success: false,
                message: error.message ||
                    "Unable to sync from Google Sheets."
            });

        }

    }
);


app.patch(
    "/api/admin/sheets/submissions/:rowNumber",
    requireAdmin,
    async (req, res) => {

        await ensureDatabase();

        try {

            const rowNumber =
                parseInt(req.params.rowNumber, 10);

            const { status, adminNotes } = req.body;

            await sheets.updateSubmission(
                rowNumber,
                { status, adminNotes }
            );

            res.json({
                success: true,
                message:
                    "Submission updated in Google Sheets."
            });

        } catch (error) {

            console.error(
                "Sheets update error:",
                error
            );

            res.status(502).json({
                success: false,
                message: error.message ||
                    "Unable to update submission in Google Sheets."
            });

        }

    }
);

/* =========================================================
    HEALTH CHECK
    ======================================================== */

app.get(
    "/api/status",
    (req, res) => {

        res.json({

            success: true,

            status: "ok",

            timestamp:
                new Date().toISOString()

        });

    }
);


/* =========================================================
   404
======================================================== */

app.use(
    (req, res) => {

        res.status(404).send(
            "Page not found."
        );

    }
);


/* =========================================================
   START SERVER
======================================================== */

app.listen(
    PORT,
    async () => {

        try {

            await ensureDatabase();

        } catch (error) {

            console.error(
                "Database initialization error:",
                error
            );

        }


        if (
            process.env.NODE_ENV !==
            "production"
        ) {

            try {

                const admins =
                    await db.getAllAdmins();


                if (
                    admins.length ===
                    0
                ) {

                    const defaultEmail =
                        "admin@ajbimports.com";

                    const defaultPassword =
                        "ChangeMe123!";

                    const passwordHash =
                        await bcrypt.hash(
                            defaultPassword,
                            12
                        );

                    await db.createAdmin({

                        id: "admin-001",

                        fullName: "Administrator",

                        email: defaultEmail,

                        passwordHash,

                        role: "admin",

                        createdAt: new Date().toISOString()

                    });


                    console.log(
                        "\n============================================"
                    );

                    console.log(
                        "   DEFAULT ADMIN CREATED"
                    );

                    console.log(
                        "============================================"
                    );

                    console.log(
                        "Email:    ",
                        defaultEmail
                    );

                    console.log(
                        "Password: ",
                        defaultPassword
                    );

                    console.log(
                        "\nIMPORTANT: Change this password after logging in."
                    );

                    console.log(
                        "============================================\n"
                    );

                }

            } catch (error) {

                console.error(
                    "Default admin creation error:",
                    error
                );

            }

        }


        console.log(
            `
============================================

   AJB IMPORTS GHANA
   LOGISTICS WEBSITE

   Server running on:
   http://localhost:${PORT}

   Admin Login:
   http://localhost:${PORT}/admin/login

============================================
`
        );


        if (sheets.isConfigured()) {

            console.log(
                "Google Sheets sync: enabled"
            );

            try {

                await sheets.testConnection();

                console.log(
                    "Google Sheets connection: OK"
                );

            } catch (error) {

                console.error(
                    "Google Sheets connection failed:",
                    error.message
                );

            }

        } else {

            console.log(
                "Google Sheets sync: disabled (set a valid GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_JSON with a service-account JSON containing client_email and private_key)"
            );

        }

    }
);