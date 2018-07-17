const Discord = require('discord.js');//all requirements
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;

const func = require('./functions/func')
const sqlfunc = require('./functions/sqlfunc')

const http = require('http');//this is just to make sure the glitch.com app doesnt go to sleep
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);//end here

client.on('ready', () => {//on bot start
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Serving ${client.guilds.size} guilds`);
  console.log(client.guilds.map(g => g.name).join(" , "))
  client.user.setPresence({ status: 'online', game: { name: 't.help for commands' } });
});//end here

const adminID = "122343952933191680"
var commandlist = ['t.help', 't.ping', 't.lenny', 't.avatar', 't.listemoji', 't.invite', 't.profile', 't.uptime']// list of commands the bot can execute
var e = new Date()
var i//end here

client.on('message', async message => {
  if (message.channel.type === "dm") return;
  if(message.author.bot) return;
  
var splitmsg = message.content.split(" ")//splits the message at spaces
var command = splitmsg[0]//takes the first word as the command

for(i = 0; i < commandlist.length; i++){//checks if first word exists in command list for logging purposes
	if(command === (commandlist[i])){
	console.log(message.author.username, message.content);
	}
}

func.autoLog(message)//automatically sends the log to admin if filesize exceeds 700kb
func.addLog(message)
sqlfunc.score(message)//for leveling/score related
  
switch(command){
  case 't.help':func.help(message, splitmsg);break;
  case 't.uptime':func.uptime(message, client);break;
  case 't.invite':func.invite(message,client);break;
  case 't.lenny':message.channel.send("( ͡° ͜ʖ ͡°)");break;
  case 't.listemoji':func.emojilist(message);break;
  case '<@463644074528997376>':func.funfact(message);break;
  case 't.profile':sqlfunc.profile(message, splitmsg);break;
  case 't.avatar':func.avatar(message, splitmsg);break;
  case 't.ping':func.ping(message, client);break;
  case 't.leaderboard':sqlfunc.leaderboard(message, splitmsg);break;
    //admin commands
  case 't.reload':if(message.author.id === adminID){func.reload(message)} else{message.reply("YOU'RE NOT TIGER!!")};break;
  case 't.servers':if(message.author.id === adminID){func.servers(message, client)} else{message.reply("YOU'RE NOT TIGER!!")};break;
  case 't.serverinfo':if(message.author.id === adminID){func.serverinfo(message, client, (parseInt(splitmsg[1])-1))}else{message.reply("YOU'RE NOT TIGER!!")};break;
  case 't.sendlog':if(message.author.id === adminID){func.sendlog(message)} else{ message.reply("YOU'RE NOT TIGER!!")};break;
  default:
              }
});

client.on("guildCreate", guild => {//on server join
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  //client.user.setActivity(`in ${client.guilds.size} servers`);
});//end here


client.on("guildDelete", guild => {//on server leave
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  //client.user.setActivity(`Serving ${client.guilds.size} servers`);
});//end here

client.login(TOKEN);
