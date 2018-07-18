const Discord = require('discord.js');
const client = new Discord.Client();
var methods = {}
const talkedRecently = new Set();//declaring global variables

var fs = require('fs')
var Attachment = require('discord.js').Attachment
var adminID = process.env.ADMINID

  methods.help = function(message, splitmsg) {
    
  if(!splitmsg[1]){
	const embed = new Discord.RichEmbed()

  	.setAuthor("Help Menu")
  	.setColor(0xf579f8)
  	.setDescription("Prefix: ``t.``")
  	.setThumbnail("https://i.imgur.com/DjR4kkN.jpg")
  
    .addField("t.leaderboard", "Displays the top 10 users in the server.")
  
    .addField("t.profile", "Returns the user profile of yourself or a specified user.")

  	.addField("t.avatar", "Returns the avatar of yourself or a specified user.")
  
    .addField("t.invite", "Gives you an invite link for the bot.")
  
    .addField("t.uptime", "Shows how long the bot has been running. ")

  	.addField("t.listemoji", "Lists out all the emojis in the server.")
  
    .addField("t.lenny", "Returns a lenny face.")

  	.addField("t.ping", "Pings the bot and returns time in milliseconds.")

  	.addField("@ the bot", "gives you fun facts.")

  message.channel.send({embed});
  }
    
    if(splitmsg[1] === "admin" && message.author.id === adminID){
      const embed = new Discord.RichEmbed()

  	.setAuthor("Help Menu")
  	.setColor(0xf579f8)
  	.setDescription("Prefix: ``t.``")
  	.setThumbnail("https://i.imgur.com/DjR4kkN.jpg")
  
    .addField("t.reload", "Refreshes the code for updates.")

  	.addField("t.servers", "Check how many servers the bot is connected to.")
  
    .addField("t.serverinfo", "Shows you the details of the server at index.")
      
    .addField("t.sendlog", "DMs you the log file.")
  
  message.channel.send({embed});
    }
}
  
  methods.funfact = function(message){
  fs.readFile('./database/funfacts.txt', function(err, data){
    if(err) throw err;
    var lines = data.toString().split('\n');
    var message2 = lines[Math.floor(Math.random()*lines.length)];
    message.reply(message2)
 })
}
  
  methods.ping = async function(message, client){
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`)
  }
  
  methods.invite = function(message, client){
    const embed = new Discord.RichEmbed()
    
		.setColor(0xf579f8)
    .setAuthor(client.user.username)
    .setTitle("Click here to invite me to your server")
    .setURL("https://discordapp.com/oauth2/authorize?client_id=463644074528997376&scope=bot&permissions=8")
    .setThumbnail("https://i.imgur.com/DjR4kkN.jpg")
    message.channel.send({embed})
    }

  methods.uptime = function(message, client){
    message.channel.send(methods.msToTime(client.uptime))
}

methods.emojilist = function(message){
  const emojiList = message.guild.emojis.map(e=>e.toString()).join(" ");
  message.channel.send(emojiList);
}

methods.reload = async function(message){
    console.log('Refreshing Program.')
    const m = await message.reply("Refreshing Program.");
    process.exit(1)
}

methods.avatar = function(message, splitmsg){
  
  if (talkedRecently.has(message.author.id)) {
            message.channel.send("Wait 10 seconds before getting typing this again. - " + message.author);
    } 
    else {
      
  if(splitmsg[1] && !splitmsg[1].startsWith("<@") || splitmsg[2]){
      message.reply("Incorrect use of command: t.profile @user, please mention 1 user")
      return
  }
  
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
      talkedRecently.add(message.author.id);
        setTimeout(() => {
          // Removes the user from the set after x amount of time
          talkedRecently.delete(message.author.id);
        }, 10000);
    }
  }

methods.servers = function(message, client){
  message.channel.send(`Serving ${client.guilds.size} guilds with ${client.users.size} users`)
}

methods.serverinfo = async function(message, client, num){
  var gmap = client.guilds.map(g => g.name)
  if(num>=gmap.length){
    await message.channel.send("Invalid server number")
    return
  }
  else{
  message.channel.send(gmap[num])
  }
}

methods.addLog = function(message){
fs.appendFile('./database/log.txt', `${message.createdAt} | ${message.guild.name} | ${message.channel.name}: ${message.author.tag}: ${message}\n`, function (err) {
  if (err) {
      console.log(`Failed to write message ${message} by ${message.author.tag} to logs`)
  }
})
}

methods.autoLog = function(message){
  const stats = fs.statSync("./database/log.txt")
  const fileSizeInBytes = stats.size
  const fileSizeInKilobytes = fileSizeInBytes / 1000.0
  if(fileSizeInKilobytes > 700){
    methods.sendlog(message)
  }
}

methods.sendlog = async function(message){
  function pad(s) { return (s < 10) ? '0' + s : s; }
    
    let members = message.channel.members;
    let guildMember = members.find('id', adminID);
  
  var date = [pad(message.createdAt.getDate()), pad(message.createdAt.getMonth()+1), message.createdAt.getFullYear(), message.createdAt.getHours(), message.createdAt.getMinutes()].join('/');
  const m = await guildMember.send(`Logs`, {files: [new Attachment("./database/log.txt", `log ${date}.txt`)]})
  
  fs.truncate('./database/log.txt', 0, function(){console.log('logs cleared as sent')})
}

  methods.msToTime = function(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + "h, " + minutes + "m, " + seconds + "s, " + milliseconds + "ms";
}
  
 module.exports = methods;