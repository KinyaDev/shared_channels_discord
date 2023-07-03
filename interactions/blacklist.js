const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const db = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blacklist")
    .setDescription(
      "Block an outsider, and don't receive their messages in this server anymore"
    )
    .addStringOption((opt) =>
      opt
        .setName("username")
        .setDescription(
          "username without the @. If their username changes, it still does work."
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  run: async (interaction, client) => {
    let username = interaction.options.getString("username");
    let u = await db.getUserByUsername(username, client);

    if (u) {
      let b = db.blacklist(interaction.guild.id, u.id);
      interaction.editReply(`${u.user} is now ${b ? "un" : ""}blacklisted`);
    }
  },
};
