const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

module.exports = {
  name: "restart",
  description: "Botu onay alarak yeniden başlatır.",
  permissions: PermissionFlagsBits.ManageGuild,
  async execute(message) {
    const confirmationId = `restart:${message.author.id}`;
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${confirmationId}:confirm`)
        .setLabel("Yeniden Başlat")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`${confirmationId}:cancel`)
        .setLabel("İptal")
        .setEmoji("✖️")
        .setStyle(ButtonStyle.Secondary)
    );

    const confirmation = await message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xfee75c)
          .setTitle("⚠️ Yeniden başlatma onayı")
          .setDescription(
            "Bot yeniden başlatılacak ve kısa süreliğine çevrim dışı olacaktır.\n\n" +
            "Devam etmek istiyorsan **Yeniden Başlat** butonuna bas."
          )
          .setFooter({ text: "Bu onay 30 saniye geçerlidir." })
      ],
      components: [row]
    });

    setTimeout(async () => {
      await confirmation.edit({ content: "Onay süresi doldu.", embeds: [], components: [] }).catch(() => {});
    }, 30_000);
  }
};
