import express from "express";
import bodyParser from "body-parser";
import { db } from "./db.js";
import cron from "node-cron";
import dayjs from "dayjs";
import expressLayouts from "express-ejs-layouts";


const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(expressLayouts);
app.set("layout", "layout"); // default layout file (views/layout.ejs)

// 🟢 Simulate login (replace with real auth later)
const currentUserId = 1;

// Home page
app.get("/", async (req, res) => {
  res.render("index");
});

// Create message page
app.get("/create", (req, res) => {
  res.render("create");
});

app.post("/create", async (req, res) => {
  const { recipient, title, content, hold_days, expiration_date } = req.body;
  await db.query(
    "INSERT INTO messages (user_id, recipient, title, content, hold_days, expiration_date) VALUES (?, ?, ?, ?, ?, ?)",
    [currentUserId, recipient, title, content, hold_days, expiration_date]
  );
  res.redirect("/messages");
});

// List messages
app.get("/messages", async (req, res) => {
  const [messages] = await db.query(
    "SELECT * FROM messages WHERE user_id = ? ORDER BY created_at DESC",
    [currentUserId]
  );
  res.render("messages", { messages });
});

// Check-in
app.post("/checkin", async (req, res) => {
  await db.query("UPDATE users SET last_checkin = NOW() WHERE id = ?", [
    currentUserId,
  ]);
  res.redirect("/");
});

// 🕑 Cron job: runs daily at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("🔍 Checking messages...");

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

      if (
        daysSinceCheckin >= msg.hold_days &&
        now.isBefore(dayjs(msg.expiration_date))
      ) {
        // 🟢 Replace with KakaoTalk or SMS API
        console.log(`📨 Sending to ${msg.recipient}: ${msg.title}`);

        await db.query("UPDATE messages SET status = 'sent' WHERE id = ?", [
          msg.id,
        ]);
      }
    }
  }
});

app.listen(3000, () => {
  console.log("🚀 Doctor Sleep running at http://localhost:3000");
});
