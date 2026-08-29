const { initializeDatabase, migrateLegacyAdmins, listQuoteSubmissions, getAllAdmins } = require("./database");

(async () => {
  try {
    await initializeDatabase();
    await migrateLegacyAdmins();

    const submissions = await listQuoteSubmissions();
    const admins = await getAllAdmins();

    console.log(JSON.stringify({
      db_ok: true,
      quote_count: submissions.length,
      admin_count: admins.length,
      database_path: "data/website.db"
    }));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
