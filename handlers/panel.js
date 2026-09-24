const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

function createPanel(client) {
  const enabled = client.settings?.botEnabled !== false;
  return {
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({ name: "GraveStudio x Moton" })
        .setTitle("🟣 GraveUptime")
        .setDescription(
          "Render servislerini tek panelden yönet ve canlı tut.\n\n" +
          "Aşağıdaki butonlarla izlenecek servisleri ekleyebilir, " +
          "kayıtlı servisleri görüntüleyebilir veya kaldırabilirsin."
        )
        .addFields(
          { name: "⚡ Kontrol aralığı", value: `Her **${client.config.pingIntervalMinutes} dakikada**`, inline: true },
          { name: "📦 Proje limiti", value: "**2 proje / sunucu**", inline: true },
          { name: "🌐 İzleme türü", value: "HTTP uptime", inline: true },
          { name: "🔐 Yetki", value: "Sunucuyu Yönet", inline: true }
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: `${client.config.prefix}panel • GraveUptime aktif`, iconURL: client.user.displayAvatarURL() })
        .setTimestamp()
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("uptime:add").setLabel("URL Ekle").setEmoji("➕").setStyle(ButtonStyle.Success).setDisabled(!enabled),
        new ButtonBuilder().setCustomId("uptime:list").setLabel("URL Listesi").setEmoji("📋").setStyle(ButtonStyle.Primary).setDisabled(!enabled),
        new ButtonBuilder().setCustomId("uptime:remove").setLabel("URL Sil").setEmoji("🗑️").setStyle(ButtonStyle.Danger).setDisabled(!enabled)
      )
    ]
  };
}

module.exports = { createPanel };
