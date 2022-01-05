// Import modules
const Commando = require('discord.js-commando');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;

// Import config file
const config = require('./config');

// Initialize
let db = new sqlite3.Database(path.join(__dirname, './db/links.db'), async err => {
  if (err) await fs.appendFile(path.join(__dirname, './logs/errors.txt'), err.message);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS blacklist (
    link VARCHAR(500) PRIMARY KEY
  )`);
});

db.close(async err => {
  if (err) await fs.appendFile(path.join(__dirname, './logs/errors.txt'), err.message);
});

const bot = new Commando.Client({
  owner: config.owner,
  commandPrefix: config.prefix
});

bot.registry
  // Custom command groups
  .registerGroups([
    ['config', 'Used for configuring the bot']
  ])
  // Registers all built-in groups, commands, and argument types
  .registerDefaults()
  // Register commands in the /commands directory
  .registerCommandsIn(path.join(__dirname, "commands"));

// Turn on bot
bot.on('ready', async () => {
  await fs.appendFile(path.join(__dirname, './logs/init.txt'), `Logged in as ${bot.user.tag}.`);
  console.log(`Logged in as ${bot.user.tag}.`);
  bot.user.setActivity(`On active duty!`, {type: 'CUSTOM_STATUS'});
});

// What to do
bot.on('message', msg => {
  message = msg.content;
  if (message.indexOf('%add') === -1 && message.indexOf('%addlink') === -1 && message.indexOf('http') !== -1) {
    let q = `SELECT link
           FROM blacklist
           WHERE link = ?`;

    let dbMessage = new sqlite3.Database(path.join(__dirname, './db/links.db'), err => {
      if (err) throw err.message;
    });

    dbMessage.get(q, [message], async (err, row) => {
      if (err) await fs.appendFile(path.join(__dirname, './logs/errors.txt'), err.message);
      else if (row.link) {
        msg.channel.send('Scam!!!');
        msg.delete();
      }
    });
  }
});

bot.login(config.token);
