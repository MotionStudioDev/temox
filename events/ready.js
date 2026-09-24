module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`${client.user.tag} olarak giriş yapıldı.`);
    client.user.setPresence({
      activities: [{ name: "GraveUptime - GraveStudio x Moton", type: 0 }],
      status: "dnd"
    });

    if (!client.config.panelChannelId) return;
    const channel = await client.channels.fetch(client.config.panelChannelId).catch(() => null);
    if (!channel?.isTextBased()) {
      console.warn("PANEL_CHANNEL_ID için yazılabilir kanal bulunamadı.");
      return;
    }

    const { createPanel } = require("../handlers/panel");
    const panel = createPanel(client);
    const messages = await channel.messages.fetch({ limit: 50 }).catch(() => null);
    const existingPanel = messages?.find((message) =>
      message.author.id === client.user.id &&
      message.embeds.some((embed) => embed.title === "🟣 GraveUptime")
    );

    if (existingPanel) {
      await existingPanel.edit(panel);
      console.log(`Kalıcı uptime paneli güncellendi: ${existingPanel.id}`);
      return;
    }

    const sentPanel = await channel.send(panel);
    console.log(`Kalıcı uptime paneli oluşturuldu: ${sentPanel.id}`);
  }
};
