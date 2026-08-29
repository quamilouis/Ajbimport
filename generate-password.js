const bcrypt = require("bcryptjs");

const password = "ChangeMe123!";

bcrypt.hash(password, 12, (err, hash) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log("\nYour password hash:\n");
    console.log(hash);
    console.log("\n");
});
