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
const targets = new Map();
const MAX_TARGETS_PER_GUILD = 2;

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function key(guildId, url) {
  return `${guildId}:${url}`;
}

async function loadTargets() {
  const { data, error } = await supabase.from("uptime_targets").select("*");
  if (error) throw new Error(`Supabase hedefleri okunamadı: ${error.message}`);
  targets.clear();
  for (const target of data || []) targets.set(key(target.guild_id, target.url), target);
}

async function getGuildTargets(guildId) {
  return [...targets.values()].filter((target) => target.guild_id === guildId);
}

async function addTarget(target) {
  const url = normalizeUrl(target.url);
  if (!url) return false;
  const guildTargetCount = [...targets.values()]
    .filter((item) => item.guild_id === target.guildId).length;
  if (guildTargetCount >= MAX_TARGETS_PER_GUILD) return "limit";

  const { data, error } = await supabase
    .from("uptime_targets")
    .insert({ guild_id: target.guildId, url, added_by: target.addedBy })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") return false;
    throw new Error(`Supabase hedef eklenemedi: ${error.message}`);
  }
  targets.set(key(data.guild_id, data.url), data);
  return true;
}

async function removeTarget(guildId, url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return false;
  const { error, count } = await supabase
    .from("uptime_targets")
    .delete({ count: "exact" })
    .eq("guild_id", guildId)
    .eq("url", normalized);
  if (error) throw new Error(`Supabase hedef silinemedi: ${error.message}`);
  const removed = count > 0;
  if (removed) targets.delete(key(guildId, normalized));
  return removed;
}

function getAllTargets() {
  return [...targets.values()];
}

async function updateTargetStatus(target) {
  const { error } = await supabase
    .from("uptime_targets")
    .update({
      is_up: target.ok,
      last_status: target.lastStatus,
      last_response_ms: target.lastResponseMs,
      last_checked_at: target.lastCheckedAt
    })
    .eq("id", target.id);
  if (error) throw new Error(`Supabase hedef durumu güncellenemedi: ${error.message}`);
}

module.exports = {
  addTarget,
  getAllTargets,
  getGuildTargets,
  loadTargets,
  normalizeUrl,
  removeTarget,
  updateTargetStatus
};
