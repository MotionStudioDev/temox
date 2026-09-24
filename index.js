require("dotenv").config();

const { Client, Collection, GatewayIntentBits } = require("discord.js");
const { loadCommands } = require("./utils/loaders");
const { loadEvents } = require("./utils/loaders");
const { loadTargets } = require("./services/targetStore");
const { startHttpServer } = require("./services/httpServer");
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

async function bootstrap() {
  await loadTargets();
  client.settings = await loadSettings();
  await loadCommands(client);
  await loadEvents(client);
  startHttpServer(client);
  startMonitor(client);
  await client.login(process.env.DISCORD_TOKEN);
}

bootstrap().catch((error) => {
  console.error("Bot başlatılamadı:", error);
  process.exitCode = 1;
});
