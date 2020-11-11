var help = require('./commands/help.js');
var emoji = require('./commands/emoji.js');
var count = require('./commands/count.js');
var emotes = require('./commands/emotes.js');
var ping = require('./commands/ping.js');
var reddit = require('./commands/reddit.js');
var score = require('./commands/score.js');
var quality = require('./commands/quality.js');
var syllables = require('./commands/syllables.js');
var top = require('./commands/top.js');
var uptime = require('./commands/uptime.js');
var word = require('./commands/word.js');

// the commands
var commands = {
   "help" : help,
   "emoji" : emoji,
   "count" : count,
   "emotes" : emotes,
   "ping" : ping,
   "reddit" : reddit,
   "score" : score,
   "quality" : quality,
   "syllables" : syllables,
   "top" : top,
   "uptime" : uptime,
   "word" : word,
}

module.exports = commands