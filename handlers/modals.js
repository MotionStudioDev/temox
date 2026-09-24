const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

function createUrlModal(type) {
  const isAdd = type === "add";
  return new ModalBuilder()
    .setCustomId(`uptime:${type}-modal`)
    .setTitle(isAdd ? "Uptime URL Ekle" : "Uptime URL Sil")
    .addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("url")
          .setLabel(isAdd ? "Pinglenecek URL" : "Silinecek URL")
          .setPlaceholder("https://ornek-servis.onrender.com")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    );
}

module.exports = { createUrlModal };
