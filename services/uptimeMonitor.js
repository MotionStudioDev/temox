const { getAllTargets, updateTargetStatus } = require("./targetStore");

async function pingTarget(target, client) {
  const started = Date.now();
  try {
    const response = await fetch(target.url, {
      signal: AbortSignal.timeout(15000),
      headers: { "User-Agent": "GraveUptime/1.0" }
    });
    target.ok = response.ok;
    target.lastStatus = response.status;
  } catch (error) {
    target.ok = false;
    target.lastStatus = null;
    target.lastError = error.message;
  }
  target.lastResponseMs = Date.now() - started;
  target.lastCheckedAt = new Date().toISOString();
  if (target.id && client.settings?.saveEnabled !== false) await updateTargetStatus(target);
}

async function pingAll(client) {
  const targets = getAllTargets();
  const publicUrl = client.config.publicUrl;
  const urls = targets.map((target) => target.url);
  if (publicUrl && !urls.includes(publicUrl)) await pingTarget({ url: publicUrl }, client);
  await Promise.all(targets.map((target) => pingTarget(target, client)));
  client.lastPing = new Date().toISOString();
}

function startMonitor(client) {
  pingAll(client).catch((error) => console.error("İlk ping başarısız:", error));
  setInterval(() => {
    pingAll(client).catch((error) => console.error("Ping döngüsü başarısız:", error));
  }, client.config.pingIntervalMinutes * 60000);
}

module.exports = { startMonitor };
