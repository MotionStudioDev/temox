const WebSocket = require("ws");
const { createClient } = require("@supabase/supabase-js");

if (!globalThis.WebSocket) globalThis.WebSocket = WebSocket;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: WebSocket }
  }
);

const defaults = { saveEnabled: true, botEnabled: true };

async function loadSettings() {
  const { data, error } = await supabase.from("bot_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(`Supabase ayarları okunamadı: ${error.message}`);
  return {
    saveEnabled: data?.save_enabled ?? defaults.saveEnabled,
    botEnabled: data?.bot_enabled ?? defaults.botEnabled
  };
}

async function setSetting(client, key, value) {
  const column = key === "saveEnabled" ? "save_enabled" : "bot_enabled";
  const { error } = await supabase.from("bot_settings").upsert({ id: 1, [column]: value });
  if (error) throw new Error(`Supabase ayarı güncellenemedi: ${error.message}`);
  client.settings[key] = value;
  return value;
}

module.exports = { loadSettings, setSetting };
