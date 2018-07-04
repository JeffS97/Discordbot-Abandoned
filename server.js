const Discord = require('discord.js');//all requirements
const client = new Discord.Client();
const TOKEN = process.env.TOKEN;
const func = require('./func')
const sql = require("sqlite");
sql.open("./score.sqlite");//end here

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

const talkedRecently = new Set();//declaring global variables
var e = new Date()
var i//end here

client.on('ready', () => {//on bot start
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(`Serving ${client.guilds.size} guilds`);
  console.log(client.guilds.map(g => g.name).join(" , "))
  client.user.setPresence({ status: 'online', game: { name: 't.help for commands' } });
});//end here


client.on("guildCreate", guild => {//on server join
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  client.user.setActivity(`in ${client.guilds.size} servers`);
});//end here


client.on("guildDelete", guild => {//on server leave
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  client.user.setActivity(`Serving ${client.guilds.size} servers`);
});//end here

var commandlist = ['t.help', 't.ping', 't.lenny', 't.avatar', 't.listemoji', 't.invite', 't.profile', 't.uptime']// list of commands the bot can execute

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
  
score()//for leveling/score related
  
switch(command){
  case 't.help':func.help(message);break;
  case 't.uptime':func.uptime(message, client);break;
  case 't.invite':func.invite(message,client);break;
  case 't.lenny':message.channel.send("( ͡° ͜ʖ ͡°)");break;
  case 't.listemoji':func.emojilist(message);break;
  case '<@463644074528997376>':message.reply(func.funfact(message));break;
  case 't.profile':profile();break;
  case 't.avatar':avatar();break;
  case 't.ping':const m = await message.channel.send("Ping?");
                m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);break;
  default:
              }
  
//all functions that are unable to be in func.js go here
  
function avatar(){
	if(message.mentions.users.first()){
		const embed = new Discord.RichEmbed()
    
    .setColor(0xf579f8)
		.setAuthor(message.mentions.users.first().tag)
		.setTitle("Avatar URL Link")
		.setURL(message.mentions.users.first().avatarURL)
		.setImage(message.mentions.users.first().avatarURL)
		 message.channel.send({embed})
	}
	
	else{
	const embed = new Discord.RichEmbed()
	  
    .setColor(0xf579f8)
		.setAuthor(message.author.tag)
		.setTitle("Avatar URL Link")
		.setURL(message.author.avatarURL)
		.setImage(message.author.avatarURL)
		message.channel.send({embed})
}
  }
  
function score(){
sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
  if (!row) {
    sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
  } else {
    let curLevel = Math.floor(0.1 * Math.sqrt(row.points));
    if (curLevel > row.level) {
       row.level = curLevel;
        sql.run(`UPDATE scores SET points = ${row.points + 3}, level = ${row.level} WHERE userId = ${message.author.id}`);
        message.reply(`You've leveled up to level **${curLevel}**! Congratulations!`);
      }
      sql.run(`UPDATE scores SET points = ${row.points + 3} WHERE userId = ${message.author.id}`);
    }
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    });
  });
  }

function profile(){
    var level
    var points
    var nextlevel
    
    if (talkedRecently.has(message.author.id)) {
            message.channel.send("Wait 10 seconds before getting typing this again. - " + message.author);
    } 
    else {
      if(message.mentions.users.first()){
      sql.get(`SELECT * FROM scores WHERE userId ="${message.mentions.users.first().id}"`).then(row => {
      if (!row) {
        level = 0
        points = 0
        nextlevel = 100
      }
      else{
      level = row.level
      points = row.points
      nextlevel = Math.pow(((level + 1)*10), 2)
      }
		const embed = new Discord.RichEmbed()
		.setColor(0xf579f8)
		
		.setAuthor(message.mentions.users.first().tag + ' profile')
		.setImage(message.mentions.users.first().avatarURL , 200 , 200)
    .addField("Level", level.toString())
    .addField("Points", `${points} / ${nextlevel}`)
    
		 message.channel.send({embed})
    });
    
  }
    else{
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) {
        level = 0
        points = 0
        nextlevel = 100
      }
      else{
      level = row.level
      points = row.points
      nextlevel = Math.pow(((level + 1)*10), 2)
      }
      const embed = new Discord.RichEmbed()
	    
      .setColor(0xf579f8)
		  .setAuthor(message.author.tag + ' profile')
		  .setImage(message.author.avatarURL)
      .addField("Level", `${level}`)
      .addField("Points", `${points} / ${nextlevel}`)
  
		  message.channel.send({embed})
      
    });
    }
        // Adds the user to the set so that they can't talk for x amount of time
        talkedRecently.add(message.author.id);
        setTimeout(() => {
          // Removes the user from the set after x amount of time
          talkedRecently.delete(message.author.id);
        }, 10000);
    }
}
});
client.login(TOKEN);