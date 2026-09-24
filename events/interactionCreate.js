const { handleInteraction } = require("../handlers/interaction");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    await handleInteraction(interaction, client);
  }
};
