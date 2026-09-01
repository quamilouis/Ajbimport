const bcrypt = require("bcryptjs");
const db = require("./database");

async function createDefaultAdmin() {
  const email = "admin@ajbimports.com";
  const password = "ChangeMe123!";

  const existing = await db.getAdminByEmail(email);

  if (existing) {
    console.log("Default admin already exists.");
    console.log("Email:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.createAdmin({
    id: "admin-001",
    fullName: "Administrator",
    email,
    passwordHash,
    role: "admin",
    createdAt: new Date().toISOString()
  });

  console.log("\n============================================");
  console.log("   DEFAULT ADMIN CREATED");
  console.log("============================================");
  console.log("Email:    ", email);
  console.log("Password: ", password);
  console.log("\nIMPORTANT: Change this password after logging in.");
  console.log("============================================\n");
}

createDefaultAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed to create admin:", err);
    process.exit(1);
  });
