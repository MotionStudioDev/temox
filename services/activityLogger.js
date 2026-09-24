const { EmbedBuilder } = require("discord.js");
const { getGuildTargets } = require("./targetStore");

const TURKEY_TIME = new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul",
  dateStyle: "short",
  timeStyle: "medium"
});

async function logTargetAction(client, interaction, action, url) {
  const channelId = client.config.uptimeLogChannelId;
  if (!channelId) return;

  const channel = await client.channels.fetch(channelId).catch((error) => {
    console.error(`Uptime log kanalı alınamadı (${channelId}):`, error.message);
    return null;
  });
  if (!channel?.isTextBased()) {
    console.error(`Uptime log kanalı yazılabilir değil: ${channelId}`);
    return;
  }

  const targets = await getGuildTargets(interaction.guildId);
  const userTargetCount = targets.filter((target) => target.added_by === interaction.user.id).length;
  const isAdd = action === "add";
  const embed = new EmbedBuilder()
    .setColor(isAdd ? 0x57f287 : 0xed4245)
    .setTitle(isAdd ? "📥 Yeni proje eklendi" : "🗑️ Proje silindi")
    .setDescription(`**${url}**`)
    .addFields(
      { name: "İşlemi yapan", value: `${interaction.user.tag} (<@${interaction.user.id}>)`, inline: false },
      { name: "Kullanıcı ID", value: interaction.user.id, inline: true },
      { name: "Sunucu", value: `${interaction.guild.name} (${interaction.guildId})`, inline: true },
      { name: "Toplam proje", value: `${targets.length} / 2`, inline: true },
      { name: "Bu kullanıcının eklediği", value: `${userTargetCount}`, inline: true },
      { name: "İşlem zamanı", value: `${TURKEY_TIME.format(new Date())} (Türkiye)`, inline: false }
    )
    .setFooter({ text: "GraveUptime • Uptime aktivite kaydı" })
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch((error) => {
    console.error("Uptime aktivite logu gönderilemedi:", error.message);
  });
}

module.exports = { logTargetAction };
