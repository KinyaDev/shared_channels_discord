const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const db = require("../db");

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("To get help"),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  run: (interaction, client) => {
    interaction.editReply({
      embeds: [
        {
          title: "room",
          description:
            "Create a room, join a room, view the public rooms and view the rooms of this server.",
          fields: [
            {
              name: "room create",
              value:
                "With `/room create [public/private]`, you can create a room and you'll have a code.",
            },
            {
              name: "room join",
              value:
                "With `/room join [code] [#channel]`, you sync a channel to a room thanks to the code. There is an alternative: create a channel called `inter-[code of the room].`",
            },
            {
              name: "room leave",
              value:
                "With `/room leave [#channel]`, your channel leaves the room.",
            },
            {
              name: "room list",
              value:
                "`/room list` shows the list of rooms created within the server.",
            },
            {
              name: "room publics",
              value:
                "`room publics` shows the list of public rooms created within multiple servers.",
            },
          ],
        },
      ],
    });
  },
};
