const express = require("express");

function startHttpServer(client) {
  const app = express();
  const port = Number(process.env.PORT || 10000);
  const startedAt = new Date().toISOString();

  app.disable("x-powered-by");
  app.use((_request, response, next) => {
    response.setHeader("Cache-Control", "no-store");
    next();
  });

  app.get("/", (_request, response) => response.json({
    name: "Grave Uptime",
    status: "online",
    service: "uptime-monitor"
  }));

  app.get("/ping", (_request, response) => response.json({
    pong: true,
    timestamp: new Date().toISOString()
  }));

  app.get("/health", (_request, response) => response.status(200).json({
    status: "ok",
    service: "grave-uptime",
    startedAt,
    lastPing: client.lastPing || null,
    uptime: process.uptime()
  }));

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Express HTTP sunucusu 0.0.0.0:${port} üzerinde hazır.`);
    console.log(`Ping endpoint: /ping | Health endpoint: /health`);
  });

  server.on("error", (error) => {
    console.error("Express HTTP sunucusu başlatılamadı:", error);
    process.exitCode = 1;
  });

  return server;
}

module.exports = { startHttpServer };
