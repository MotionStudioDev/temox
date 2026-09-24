require("dotenv").config();

const express = require("express");
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { loadCommands } = require("./utils/loaders");
const { loadEvents } = require("./utils/loaders");
const { loadTargets } = require("./services/targetStore");
const { startMonitor } = require("./services/uptimeMonitor");
const { loadSettings } = require("./services/settings");

if (!process.env.DISCORD_TOKEN) {
  console.error("DISCORD_TOKEN eksik. .env dosyasına Discord bot token'ını gir.");
  process.exit(1);
}
if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SECRET_KEY)) {
  console.error("SUPABASE_URL ve SUPABASE_SECRET_KEY eksik.");
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();
client.config = {
  prefix: process.env.COMMAND_PREFIX || "!",
  panelChannelId: process.env.PANEL_CHANNEL_ID || null,
  uptimeLogChannelId: process.env.UPTIME_LOG_CHANNEL_ID || "1552643134683357274",
  ownerId: process.env.BOT_OWNER_ID || null,
  publicUrl: process.env.PUBLIC_URL || null,
  pingIntervalMinutes: Math.max(1, Number(process.env.PING_INTERVAL_MINUTES || 5))
};

const app = express();
const port = Number(process.env.PORT) || 3000;

app.get("/", (_request, response) => {
  response.status(200).send("GraveUptime bot aktif.");
});

app.get("/ping", (_request, response) => {
  response.status(200).json({
    pong: true,
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    lastPing: client.lastPing || null
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Express sunucusu ${port} portunda aktif.`);
});

async function bootstrap() {
  await loadTargets();
  client.settings = await loadSettings();
  await loadCommands(client);
  await loadEvents(client);
  startMonitor(client);
  await client.login(process.env.DISCORD_TOKEN);
}

bootstrap().catch((error) => {
  console.error("Bot başlatılamadı:", error);
  process.exitCode = 1;
});
