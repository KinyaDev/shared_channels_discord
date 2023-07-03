const { Client, Webhook } = require("discord.js");
/**
 *
 * @param {Client} bot
 */
function webhooks(bot) {
  return {
    async get(channelId) {
      let channel = await bot.channels.fetch(channelId);

      if (channel.isTextBased()) {
        /**
         * @type {Webhook[]}
         */
        let whs = await channel.fetchWebhooks();
        return whs.find((w) => w.owner.id === bot.user.id);
      }
    },
    async edit(channelId, messageId, name, avatar, message) {
      const channel = bot.channels.cache.get(channelId);
      try {
        /**
         * @type {Webhook[]}
         */
        const webhooks = await channel.fetchWebhooks();
        let webhook = webhooks.find((wh) => wh.owner.id === bot.user.id);

        return await webhook.editMessage(messageId, {
          content: message,
          username: name,
          avatarURL: avatar,
        });
      } catch (error) {
        console.error("Error trying to send a message: ", error);
      }
    },
    async reply(args) {
      let { channel_id, name, avatar, message, files, ref_id } = args;
      const channel = bot.channels.cache.get(channel_id);
      try {
        let webhook = await this.get(channel_id);

        if (!webhook) {
          webhook = await channel.createWebhook({ name: name, avatar: avatar });
        }

        return await webhook.send({
          content: message,
          username: name,
          avatarURL: avatar,
          files: files,
        });
      } catch (error) {
        console.error("Error trying to send a message: ", error);
      }
    },
    async send(args) {
      let {
        channel_id,
        current_channel_id,
        name,
        avatar,
        message,
        files,
        ref_id,
      } = args;

      const channel = bot.channels.cache.get(channel_id);
      const channel_in = bot.channels.cache.get(current_channel_id);
      try {
        let webhook = await this.get(channel_id);

        if (!webhook) {
          webhook = await channel.createWebhook({ name: name, avatar: avatar });
        }

        let repliedTo = ref_id
          ? await channel_in.messages.fetch(ref_id)
          : undefined;

        return await webhook.send({
          content: message,
          username: name,
          avatarURL: avatar,
          files: files,
          embeds: repliedTo
            ? [
                {
                  title: "Reply",
                  author: {
                    name: repliedTo.author.username,
                    icon_url: repliedTo.author.displayAvatarURL(),
                  },
                  description: repliedTo.content,
                },
              ]
            : null,
        });
      } catch (error) {
        console.error("Error trying to send a message: ", error);
      }
    },
  };
}

module.exports = webhooks;
