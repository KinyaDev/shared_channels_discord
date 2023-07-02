const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Client,
} = require("discord.js");
const db = require("../db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("room")
    .setDescription("room command, see subcommands")
    .addSubcommand((sc) =>
      sc
        .setName("create")
        .setDescription("create an interserver room")
        .addStringOption((opt) =>
          opt
            .setName("public")
            .setChoices(
              { name: "public", value: "public" },
              { name: "private", value: "private" }
            )
            .setDescription(
              "If it is public or private. The public rooms will be shown in the /publics command"
            )
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("join")
        .setDescription("join an interserver room")
        .addStringOption((opt) =>
          opt
            .setName("code")
            .setDescription("The code of the room to sync to the channel")
            .setRequired(true)
        )
        .addChannelOption((opt) =>
          opt
            .setName("channel")
            .setDescription("The channel to be synced with the joined room.")
            .setRequired(true)
        )
    )
    .addSubcommand((sc) =>
      sc
        .setName("publics")
        .setDescription("get the list of all public interserver rooms.")
    )
    .addSubcommand((sc) =>
      sc
        .setName("list")
        .setDescription("get the list of all interserver rooms of this server.")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  // If you want to add one in your server: create a text channel and name it inter-[code of the room].

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  run: async (interaction, client) => {
    if (interaction.options.getSubcommand() === "create") {
      let code = db.createHost(
        interaction.options.getString("public") === "public" ? false : true,
        interaction.guild.id
      );
      interaction.editReply({
        content: `The room has been created with the code \`${code}\`. Now, to sync your channel to thing room use the \`/room join\` command, or you can create channel called \`inter-[code of the room]\``,
      });
    } else if (interaction.options.getSubcommand() === "join") {
      let ch = interaction.options.getChannel("channel");
      let code = interaction.options.getString("code");
      if (db.getRoom(code)) {
        db.createSync(code, ch.id);

        let num = `${db.getSync().map((s) => s.code === code).length}`;
        if (num.endsWith("1")) {
          num = num + "st";
        } else if (num.endsWith("2")) {
          num = num + "nd";
        } else if (num.endsWith("3")) {
          num = num + "rd";
        } else {
          num = num + "th";
        }

        interaction.editReply({ content: "The channel as been synced!" });
        ch.send(
          `Concratulation! This channel has been synced with a room. It is the ${num} to be synced to that room.`
        );
      } else {
        interaction.editReply(`This room doesn't exist.`);
      }
    } else if (interaction.options.getSubcommand() === "publics") {
      let fields = [];
      let hosts = db
        .getHost()
        .filter((h) => h.private === false || h.private === 0);

      hosts.forEach(async (h) => {
        try {
          let guild = await client.guilds.fetch(h.guild_id);
          let syncs = db.getByCode(h.code);
          if (syncs.length === 0) {
            db.delHost(guild.id);
          } else {
            fields.push({
              name: `${guild.name}`,
              value: `Code: ${h.code}`,
            });
          }
        } catch {
          db.delHost(h.guild_id);
        }
      });

      setTimeout(() => {
        interaction.editReply({
          embeds: [
            {
              title: `Shared Rooms`,
              fields: fields,
            },
          ],
        });
      }, 1000);
    } else if (interaction.options.getSubcommand() === "list") {
      let fields = [];
      let synceds2 = db.getSync();

      synceds2.forEach(async (s) => {
        try {
          let ch = await client.channels.fetch(s.channel_id);
          if (!ch) {
            db.unSync(s.channel_id);
          } else {
            if (ch && ch.guild.id === interaction.guild.id) {
              fields.push({
                name: `${fields.length + 1}. ${ch.name}`,
                value: `Code: ${s.code}`,
              });
            }
          }
        } catch {
          db.unSync(s.channel_id);
        }
      });

      setTimeout(() => {
        interaction.editReply({
          embeds: [
            {
              title: `Rooms of ${interaction.guild.name}`,
              fields: fields,
            },
          ],
        });
      }, 1000);
    }
  },
};
