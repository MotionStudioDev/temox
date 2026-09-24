const { EmbedBuilder } = require("discord.js");
const { createUrlModal } = require("./modals");
const { createManagementPanel } = require("./management");
const { setSetting } = require("../services/settings");
const { createPanel } = require("./panel");
const { logTargetAction } = require("../services/activityLogger");
const {
  addTarget,
  removeTarget,
  getGuildTargets,
  normalizeUrl
} = require("../services/targetStore");

async function handleInteraction(interaction, client) {
  if (!interaction.isButton() && !interaction.isModalSubmit()) return;
  if (interaction.isButton() && interaction.customId.startsWith("management:")) {
    if (interaction.user.id !== client.config.ownerId) {
      await interaction.reply({ content: "Bu paneli yalnızca bot kurucusu kullanabilir.", ephemeral: true });
      return;
    }
    const action = interaction.customId.split(":")[1];
    if (action === "restart") {
      await interaction.update({
        components: [],
        flags: 32768
      });
      setTimeout(() => process.exit(0), 1000);
      return;
    }
    if (action === "delete") return interaction.showModal(createUrlModal("remove"));
    if (action === "save-toggle") {
      await setSetting(client, "saveEnabled", client.settings.saveEnabled === false);
      await interaction.update(createManagementPanel(client));
      return;
    }
    if (action === "bot-toggle") {
      await setSetting(client, "botEnabled", client.settings.botEnabled === false);
      await interaction.update(createManagementPanel(client));
      await updatePublicPanel(client);
      return;
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === "uptime:remove-modal" && interaction.user.id === client.config.ownerId) {
    const url = normalizeUrl(interaction.fields.getTextInputValue("url").trim());
    if (!url) return interaction.reply({ content: "Geçerli bir http/https URL gir.", ephemeral: true });
    const removed = await removeTarget(interaction.guildId, url);
    if (removed) await logTargetAction(client, interaction, "remove", url);
    await interaction.reply({ content: removed ? `Proje silindi: ${url}` : "Bu proje bulunamadı.", ephemeral: true });
    return;
  }
  if (interaction.isButton() && interaction.customId.startsWith("restart:")) {
    const [, userId, action] = interaction.customId.split(":");
    if (interaction.user.id !== userId) {
      await interaction.reply({ content: "Bu onay panelini yalnızca komutu kullanan kişi kullanabilir.", ephemeral: true });
      return;
    }
    if (action === "cancel") {
      await interaction.update({ content: "Yeniden başlatma iptal edildi.", embeds: [], components: [] });
      return;
    }
    await interaction.update({ content: "🔄 Bot yeniden başlatılıyor...", embeds: [], components: [] });
    setTimeout(() => process.exit(0), 1000);
    return;
  }

  if (!interaction.guild) {
    await interaction.reply({ content: "Bu panel yalnızca sunucularda kullanılabilir.", ephemeral: true });
    return;
  }
  if (client.settings?.botEnabled === false) {
    await interaction.reply({ content: "Bot şu anda durdurulmuş durumda. Yönetim panelinden tekrar aktifleştirilmesini bekleyin.", ephemeral: true });
    return;
  }

  if (interaction.isButton()) {
    if (interaction.customId === "uptime:add") return interaction.showModal(createUrlModal("add"));
    if (interaction.customId === "uptime:remove") return interaction.showModal(createUrlModal("remove"));
    if (interaction.customId === "uptime:list") {
      const targets = await getGuildTargets(interaction.guildId);
      const online = targets.filter((target) => target.is_up).length;
      const text = targets.length
        ? targets.map((target, index) => {
          const status = target.is_up === true ? "🟢" : target.is_up === false ? "🔴" : "⚪";
          const response = target.last_response_ms ? ` • ${target.last_response_ms}ms` : "";
          return `${status} **${index + 1}.** ${target.url}${response}`;
        }).join("\n")
        : "Henüz izlenen bir servis yok.";
      const embed = new EmbedBuilder()
        .setColor(targets.length && online === targets.length ? 0x57f287 : 0xfee75c)
        .setTitle("📋 Uptime Servisleri")
        .setDescription(text)
        .addFields(
          { name: "Toplam", value: `${targets.length}`, inline: true },
          { name: "Çevrim içi", value: `${online}`, inline: true },
          { name: "Çevrim dışı", value: `${targets.filter((target) => target.is_up === false).length}`, inline: true }
        )
        .setFooter({ text: "⚪ Henüz kontrol edilmedi" })
        .setTimestamp();
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    return;
  }

  const url = normalizeUrl(interaction.fields.getTextInputValue("url").trim());
  if (!url) {
    await interaction.reply({ content: "Geçerli bir http/https URL gir.", ephemeral: true });
    return;
  }

  if (interaction.customId === "uptime:add-modal") {
    if (client.settings?.botEnabled === false) {
      await interaction.reply({ content: "Bot yönetim panelinden durduruldu; üyeler proje ekleyemez.", ephemeral: true });
      return;
    }
    if (client.settings?.saveEnabled === false) {
      await interaction.reply({ content: "Veri kaydetme geçici olarak durduruldu.", ephemeral: true });
      return;
    }
    const added = await addTarget({
      guildId: interaction.guildId,
      url,
      addedBy: interaction.user.id
    });
    if (added === true) await logTargetAction(client, interaction, "add", url);
    await interaction.reply({
      content: added === "limit"
        ? "Bu sunucuda en fazla **2 proje** eklenebilir. Yeni proje eklemek için önce mevcut projelerden birini sil."
        : added ? `URL eklendi: ${url}` : "Bu URL zaten kayıtlı.",
      ephemeral: true
    });
  }

  if (interaction.customId === "uptime:remove-modal") {
    const removed = await removeTarget(interaction.guildId, url);
    if (removed) await logTargetAction(client, interaction, "remove", url);
    await interaction.reply({
      content: removed ? `URL silindi: ${url}` : "Bu URL kayıtlı değil.",
      ephemeral: true
    });
  }
}

async function updatePublicPanel(client) {
  if (!client.config.panelChannelId) return;
  const channel = await client.channels.fetch(client.config.panelChannelId).catch(() => null);
  if (!channel?.isTextBased()) return;
  const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
  const panel = messages?.find((message) =>
    message.author.id === client.user.id &&
    message.embeds.some((embed) => embed.title === "🟣 GraveUptime")
  );
  if (panel) await panel.edit(createPanel(client));
}

module.exports = { handleInteraction };
