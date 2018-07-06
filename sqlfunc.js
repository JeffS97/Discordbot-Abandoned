const Discord = require('discord.js');
const client = new Discord.Client();
var sqlmethods = {}

const talkedRecentlyprof = new Set();//declaring global variables
const talkedRecentlylead = new Set();

const sql = require("sqlite");
sql.open("./score.sqlite");//end here

sqlmethods.score = function(message){
sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}" AND guildId = "${message.guild.id}"`).then(row => {
  if (!row) {
    sql.run("INSERT INTO scores (guildId, nickname, userId, points, level) VALUES (?, ?, ?, ?, ?)", [message.guild.id, message.author.username, message.author.id, 1, 0]);
  } else {
    let curLevel = Math.floor(0.1 * Math.sqrt(row.points));
    if (curLevel > row.level) {
       row.level = curLevel;
        sql.run(`UPDATE scores SET points = ${row.points + 3}, level = ${row.level} WHERE userId = ${message.author.id} AND guildId = ${message.guild.id}`);
        message.reply(`You've leveled up to level **${curLevel}**! Congratulations!`);
      }
      sql.run(`UPDATE scores SET points = ${row.points + 3} WHERE userId = ${message.author.id} AND guildId = ${message.guild.id}`);
    }
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (guildId TEXT, nickname TEXT, userId TEXT, points INTEGER, level INTEGER)").then(() => {
      sql.run("INSERT INTO scores (guildId, nickname, userId, points, level) VALUES (?, ?, ?, ?, ?)", [message.guild.id, message.author.username, message.author.id, 1, 0]);
    });
  });
  }

sqlmethods.profile=function(message, splitmsg){
    var level
    var points
    var nextlevel
    
    if (talkedRecentlyprof.has(message.author.id)) {
            message.channel.send("Wait 10 seconds before getting typing this again. - " + message.author);
    } 
    else {
      
      if(splitmsg[1] != message.mentions.users.first() || splitmsg[2]){
    message.reply("Incorrect use of command: t.profile @user, please mention 1 user")
    return
  }
      
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
        talkedRecentlyprof.add(message.author.id);
        setTimeout(() => {
          // Removes the user from the set after x amount of time
          talkedRecentlyprof.delete(message.author.id);
        }, 10000);
    }
}

sqlmethods.leaderboard = function(message, splitmsg){
  var counter = 1;
  var namelist = new Array()
  var pointlist = new Array()
  var i
  
  if (talkedRecentlylead.has(message.author.id)) {
            message.channel.send("Wait 10 seconds before getting typing this again. - " + message.author);
    } 
    else {
  sql.all(`SELECT nickname, points FROM scores WHERE guildId = ${message.guild.id} ORDER BY points DESC LIMIT 10`).then(rows => {
    rows.forEach(function (row){
      namelist.push(row.nickname.toString())
      pointlist.push(row.points.toString())
    })
    const embed = new Discord.RichEmbed()
		.setColor(0xf579f8)
    .setAuthor(`Top 10 in Server ${message.guild.name}`)
    .setDescription("============================")
    for(i=1;i<=namelist.length;i++){
      embed.addField(`${i}.${namelist[i-1]}`, `${pointlist[i-1]} points`)
    }
      message.channel.send({embed})
  })
      talkedRecentlylead.add(message.author.id);
        setTimeout(() => {
          // Removes the user from the set after x amount of time
          talkedRecentlylead.delete(message.author.id);
        }, 10000);
    }
}

module.exports = sqlmethods;