const { PermissionFlagsBits } = require("discord.js");
const { createPanel } = require("../handlers/panel");

module.exports = {
  name: "panel",
  description: "Uptime yönetim panelini gönderir.",
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message) {
    await message.channel.send(createPanel(message.client));
  }
};
