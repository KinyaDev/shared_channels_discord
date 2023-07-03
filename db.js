const { Client } = require("discord.js");

const db = require("better-sqlite3")("interchannels.db", {
  fileMustExist: false,
});

db.prepare(
  "CREATE TABLE IF NOT EXISTS host (private BOOLEAN, code VARCHAR(7), guild_id VARCHAR(18))"
).run();
db.prepare(
  "CREATE TABLE IF NOT EXISTS joined (code VARCHAR(7), channel_id VARCHAR(18), status_id VARCHAR(18))"
).run();

module.exports = {
  sqlite: db,
  /**
   *
   * @param {string} channel_id
   */
  getSyncChannel(channel_id) {
    return this.getSync().find((c) => c.channel_id === channel_id);
  },
  getByCode(code) {
    let g = db.prepare("SELECT * FROM joined WHERE code = ?").all(code);
    return g instanceof Array ? g : [];
  },
  /**
   *
   * @param {boolean} private
   */
  createHost(private, guildId) {
    let code = this.genCode();
    db.prepare(
      "INSERT INTO host (code, private, guild_id) VALUES (?, ?, ?)"
    ).run(code, private ? 1 : 0, guildId);

    return code;
  },
  createSync(code, channel_id, status_id) {
    db.prepare("INSERT INTO joined (code, channel_id) VALUES (?, ?)").run(
      code,
      channel_id
    );
  },
  getRoom(code) {
    return db.prepare("SELECT * FROM host WHERE code = ?").get(code);
  },
  unSync(channel_id) {
    db.prepare("DELETE FROM joined WHERE channel_id = ?").run(channel_id);
  },
  delHost(guild_id) {
    db.prepare("DELETE FROM host WHERE guild_id = ?").run(guild_id);
  },
  getSync() {
    let g = db.prepare("SELECT * FROM joined").all();
    return g instanceof Array ? g : [g];
  },

  getHost() {
    let g = db.prepare("SELECT * FROM host").all();
    return g instanceof Array ? g : [g];
  },

  genCode() {
    let chars = "abcdefghijklmnopqrstuvwxyz1234567890";
    let res = "";
    for (let i = 0; i <= 7; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }

    return res;
  },
};
