const { Command } = require("discord.js-commando");
const fs = require("fs").promises;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const config = require('../../config');

module.exports = class AddLink extends Command {
  constructor(bot) {
    super(bot, {
      name: "addlinks",
      aliases: ["add", "addlink"],
      group: "config",
      memberName: "addlink",
      description: "Add 1 link to database"
    });
  }
  
	async run(msg) {
    if (msg.author.id === config.owner) {
      let message = msg.content;
      if (message.indexOf('http') === -1) msg.say("Please specify a link")
      else {
        message = message.substring(message.indexOf("http"));

        let db = new sqlite3.Database(path.join(__dirname, '../../db/links.db'), async err => {
          if (err) await fs.appendFile(path.join(__dirname, '../../logs/errors.txt'), err.message);
        });

        db.serialize(() => {
          db.get(`SELECT link FROM blacklist WHERE link = ?`, [message], async (err, row) => {
            if (err) await fs.appendFile(path.join(__dirname, '../../logs/errors.txt'), err.message);

            if (!row.link) {
              db.run(`INSERT INTO blacklist VALUES (?)`, [message]);

              db.close(async err => {
                  if (err) await fs.appendFile(path.join(__dirname, '../../logs/errors.txt'), err.message);
                  else msg.say(`Added ${message} to the blacklist`);
              });
            } else {
              db.close(async err => {
                  if (err) await fs.appendFile(path.join(__dirname, '../../logs/errors.txt'), err.message);
                  else msg.say(`This link is already in the blacklist`);
              });
            }
          });
        });
      }
    } else msg.say("You are not allowed to use this command");
  }
};