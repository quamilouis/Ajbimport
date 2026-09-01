const bcrypt = require("bcryptjs");

const password = process.argv[2] || "ChangeMe123!";

bcrypt.hash(password, 12, (err, hash) => {
  if (err) {
    console.error("Error generating hash:", err);
    process.exit(1);
  }

  console.log("\nPassword hash generated:\n");
  console.log(hash);
  console.log("\nAdd this to your .env file:");
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log("\nOr use the setup-admin.js script to create a default admin in the database.\n");
});
