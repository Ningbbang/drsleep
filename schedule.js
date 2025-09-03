const cron = require("node-cron");
const dayjs = require("dayjs");

cron.schedule("0 0 * * *", async () => {
  const [users] = await db.query("SELECT * FROM users");
  for (const user of users) {
    const [messages] = await db.query(
      "SELECT * FROM messages WHERE user_id = ? AND status = 'pending'",
      [user.id]
    );

    for (const msg of messages) {
      const lastCheckin = dayjs(user.last_checkin);
      const now = dayjs();
      const daysSinceCheckin = now.diff(lastCheckin, "day");

      if (daysSinceCheckin >= msg.hold_days && now.isBefore(dayjs(msg.expiration_date))) {
        // Send via KakaoTalk or SMS API
        await sendMessage(msg.recipient, msg.title, msg.content);

        await db.query("UPDATE messages SET status = 'sent' WHERE id = ?", [msg.id]);
      }
    }
  }
});
