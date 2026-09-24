const { PermissionFlagsBits } = require("discord.js");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const content = message.content.trim();
    if (!content.startsWith(client.config.prefix)) return;

    const [name, ...args] = content.slice(client.config.prefix.length).split(/\s+/);
    const command = client.commands.get(name.toLowerCase());
    if (!command) return;

    if (command.permissions && !message.member.permissions.has(command.permissions)) {
      await message.reply("Bu komutu kullanmak için `Sunucuyu Yönet` yetkisi gerekir.");
      return;
    }

    await command.execute(message, args, client);
  }
};
