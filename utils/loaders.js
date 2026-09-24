const fs = require("node:fs/promises");
const path = require("node:path");

async function getJavaScriptFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => path.join(directory, entry.name));
}

async function loadCommands(client) {
  const files = await getJavaScriptFiles(path.join(__dirname, "..", "commands"));
  for (const file of files) {
    const command = require(file);
    if (!command.name || typeof command.execute !== "function") continue;
    client.commands.set(command.name, command);
  }
}

async function loadEvents(client) {
  const files = await getJavaScriptFiles(path.join(__dirname, "..", "events"));
  for (const file of files) {
    const event = require(file);
    if (!event.name || typeof event.execute !== "function") continue;
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

module.exports = { loadCommands, loadEvents };
