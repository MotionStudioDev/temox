const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  MessageFlags,
  SeparatorBuilder,
  TextDisplayBuilder
} = require("discord.js");

function createManagementPanel(client) {
  const save = client.settings?.saveEnabled !== false;
  const bot = client.settings?.botEnabled !== false;
  const container = new ContainerBuilder()
    .setAccentColor(0xed4245)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent("# 🛠️ GraveUptime Yönetim Paneli\nYalnızca bot kurucusu kullanabilir.")
    )
    .addSeparatorComponents(new SeparatorBuilder())
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**Veri kaydetme:** ${save ? "🟢 Aktif" : "🔴 Durduruldu"}\n` +
        `**Üye proje ekleme:** ${bot ? "🟢 Aktif" : "🔴 Durduruldu"}\n` +
        "**Sistem:** 🟢 Çalışıyor"
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("management:restart").setLabel("Yeniden Başlat").setEmoji("🔄").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("management:delete").setLabel("Proje Sil").setEmoji("🗑️").setStyle(ButtonStyle.Secondary)
      )
    )
    .addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("management:save-toggle").setLabel(save ? "Veri Kaydetmeyi Durdur" : "Veri Kaydetmeyi Aktifleştir").setEmoji("💾").setStyle(save ? ButtonStyle.Danger : ButtonStyle.Success),
        new ButtonBuilder().setCustomId("management:bot-toggle").setLabel(bot ? "Botu Durdur" : "Botu Aktifleştir").setEmoji(bot ? "⏸️" : "▶️").setStyle(bot ? ButtonStyle.Danger : ButtonStyle.Success)
      )
    );
  return { components: [container], flags: MessageFlags.IsComponentsV2 };
}

module.exports = { createManagementPanel };
