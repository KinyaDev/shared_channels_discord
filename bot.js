const {
  Client,
  REST,
  GatewayIntentBits,
  Routes,
  Events,
  ActivityType,
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const db = require("./db");
const webhooks = require("./webhooks");

require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],
});

client.once(Events.ClientReady, async (c) => {
  console.log(
    `Ready! Logged in ${c.guilds.cache.size} servers as ${c.user.tag}`
  );

  client.user.setActivity({
    type: ActivityType.Listening,
    name: "Ping me for help or use /help",
  });
});

let wh = webhooks(client);

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.TOKEN);

client.commands = new Map();

let files = fs.readdirSync(path.join(__dirname, "interactions"), "utf-8");

files.forEach((f) => {
  if (f.endsWith(".js")) {
    let name = f.replace(".js", "");
    let req = require(path.join(__dirname, "interactions", f));

    if (req) {
      client.commands.set(req.data.name, req);
      if (req.data) {
        console.log(`Registered /${name} command.`);
      } else {
        console.log(`Failed to load ${f}.`);
      }
    } else {
      console.log(`Failed to load ${f}.`);
    }
  }
});
// and deploy your commands!
(async () => {
  try {
    let commands = [];
    client.commands.forEach((v, k) => {
      commands.push(v.data);
    });

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      {
        body: commands,
      }
    );

    console.log(
      `Successfully loaded ${commands.length} application (/) commands.`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();

function unSync() {
  let synceds2 = db.getSync();

  synceds2.forEach(async (s) => {
    try {
      let ch = await client.channels.fetch(s.channel_id);
      if (!ch) {
        db.unSync(s.channel_id);
      }
    } catch {
      db.unSync(s.channel_id);
    }
  });

  let hosts = db.getHost();
  hosts.forEach(async (h) => {
    try {
      let g = await client.guilds.fetch(h.guild_id);
      if (!g) {
        db.delHost(h.guild_id);
      }
    } catch {
      db.delHost(h.guild_id);
    }
  });
}

client.on(Events.InteractionCreate, async (interaction) => {
  unSync();

  if (interaction.isCommand() && interaction.isChatInputCommand()) {
    try {
      await interaction.deferReply({ fetchReply: true, ephemeral: true });
      await client.commands
        .get(interaction.commandName)
        .run(interaction, client);
    } catch (e) {
      console.error(e);
    }

    console.log(
      `${interaction.member.user.tag} just used ${interaction.commandName}`,
      interaction.options.data
    );
  }
});

client.on("channelDelete", (channel) => {
  if (channel.name.startsWith("inter-")) {
    db.unSync(channel.id);
  }
});

client.on("channelCreate", (channel) => {
  if (channel.name.startsWith("inter-")) {
    let code = channel.name.split("-")[1];
    if (db.getRoom(code)) {
      db.createSync(code, channel.id);

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

      channel.send(
        `Concratulation! This channel has been synced with a room. It is the ${num} to be synced to that room.`
      );
    } else {
      channel.send(`This room doesn't exist.`);
    }
  }
});

client.on("guildCreate", async (guild) => {
  console.log("I have been invited on the server: " + guild.name);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  let mention = message.mentions.users.first();
  if (mention && mention.id === client.user.id) {
    // require("./interactions/help").runMessage(client, message);
  }

  unSync();

  let sync = db.getSyncChannel(message.channelId);

  if (sync) {
    let ch = await client.channels.fetch(sync.channel_id);
    if (!ch.topic || !ch.topic.startsWith("🌎"))
      ch.setTopic("🌎 Shared Channel");

    let synceds = db
      .getSync()
      .filter((s) => s.code === sync.code)
      .filter((s) => s.channel_id !== sync.channel_id);
    synceds.forEach(async (l) => {
      let ch = await client.channels.fetch(l.channel_id);
      if (!ch.topic || !ch.topic.startsWith("🌎"))
        ch.setTopic("🌎 Shared Channel");
      wh.send({
        channel_id: l.channel_id,
        name: `@${message.author.username}${
          message.guild.id === ch.guildId ? "" : ` - ${message.guild.name}`
        }`,
        avatar: message.author.displayAvatarURL(),
        message: message.content,
        files: message.attachments.map((a) => a.url),
      });
    });
  }
});

client.login(process.env.TOKEN);
