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

const app = express();

const PORT = process.env.PORT || 3000;


/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* =========================================================
   SESSION
========================================================= */

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "change-this-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure: false,
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
        path.join(__dirname, "public")
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
            "public",
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
                "public",
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

    }
);