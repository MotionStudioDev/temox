const { createManagementPanel } = require("../handlers/management");

module.exports = {
  name: "management",
  description: "Bot kurucusunun yönetim panelini açar.",
  async execute(message, _args, client) {
    if (!client.config.ownerId || message.author.id !== client.config.ownerId) {
      await message.reply("Bu paneli yalnızca bot kurucusu kullanabilir.");
      return;
    }
    await message.reply(createManagementPanel(client));
  }
};
