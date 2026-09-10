const { initializeDatabase, migrateLegacyAdmins, listQuoteSubmissions, listNewsletterSubscriptions, getAllAdmins } = require("./database");

(async () => {
  try {
    await initializeDatabase();
    await migrateLegacyAdmins();

    const submissions = await listQuoteSubmissions();
    const subscriptions = await listNewsletterSubscriptions({ includeUnsubscribed: true });
    const admins = await getAllAdmins();

    console.log(JSON.stringify({
      db_ok: true,
      quote_count: submissions.length,
      subscription_count: subscriptions.length,
      admin_count: admins.length,
      database_path: "data/website.db"
    }));
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
