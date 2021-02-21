const config = require('./config.json');
const Discord = require('discord.js');
const moment = require('moment');
const weather = require('weather-js');
const ms = require('ms');
require('moment-duration-format');
const superagent = require('superagent');


const client = new Discord.Client({disableEveryone: true});

client.on("ready", () => {
    console.log(`Bot is online and running in ${client.guilds.cache.size} servers!`)
    client.user.setActivity('Looking Samu_!#0001')
})


client.on("message", async message => {
    if (message.author.bot) return;
    if (message.channel.type == "dm") return;

    let prefix = config.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    

client.on('messageUpdate', async(oldMessage, newMessage) => {
    if(oldMessage.content === newMessage.content){
        return;
    }

    let logEmbed = new Discord.MessageEmbed()
    .setColor('BLUE')
    .setDescription('<a:yobro:805079750707773480> Un messaggio è stato editato ed è stato rilevato')
    .addField('<a:warzone:805165583678439454> Autore messaggio', oldMessage.author.tag)
    .addField('<a:warzone:805165583678439454> Prima', oldMessage.content, true)
    .addField('<a:warzone:805165583678439454> Dopo', newMessage.content, true)
    .addField(`<a:warzone:805165583678439454> Nome chat`, message.channel.name)
    .addField('<a:warzone:805165583678439454> ID chat', message.channel.id)
    .setThumbnail('https://cdn.discordapp.com/avatars/795722899016122398/a_b1766b4f96c07f261ff4869e525d0eaf.gif?size=128')
    .setTimestamp()

    let loggingchannel = newMessage.guild.channels.cache.find(ch => ch.name === "log_prova")
    if(!loggingchannel) return;

    loggingchannel.send(logEmbed)
})


if (cmd == `${prefix}invito`){
    var uses = args[0];
	var age = args[1];

	if (!uses) {
		return message.reply('Specifica quanti inviti deve avere il link');
	}
	if (!age) {
		message.reply('As you forgot to include the max age of the invite it will not expire');
		age = await 0;
	}

	uses = await uses.toString(); // Have to convert to string for indexOf(...) below

	if (uses.indexOf('.') !== -1) {
		return message.reply('How can you invite only a part of a person? :confused:'); // There will always be those people
	}

	age = await age.toString();

	if (age.indexOf('s') !== -1) { // Seconds
		age = await age.replace(/s.*/, '');
	} else if (age.indexOf('m') !== -1) { // Minutes
		var agemin = await age.replace(/m.*/, '');
		age = await agemin * 60;
	} else if (age.indexOf('h') !== -1) { // Hours
		var agehour = await age.replace(/h.*/, '');
		age = await agehour * 60 * 60;
	} else if (age.indexOf('d') !== -1) { // Days
		var ageday = await age.replace(/d.*/, '');
		age = await ageday * 60 * 60 * 24;
	} else {
		if (age.indexOf('.') !== -1) {
			return message.reply('Nope, seconds must be whole numbers.'); // For people who want to do this
		}
		age = await age; // No value letter can be found. This is seconds
	}

	message.channel.createInvite({ maxUses: uses, maxAge: age }).then((invite) => {
		//console.log(invite);
		message.channel.send(`Your invite \`${invite}\` with settings \`maxUses: ${uses}, maxAge: ${age}\``);
	});
};


if (cmd == `${prefix}lockdown`){
    if (!client.lockit) client.lockit = [];
    const time = args.join(' ');
    const validUnlocks = ['release', 'unlock'];
    if (!time) return message.reply('You must set a duration for the lockdown in either hours, minutes or seconds');
  
    if (validUnlocks.includes(time)) {
      message.channel.overwritePermissions(message.guild.id, {
        SEND_MESSAGES: null
      }).then(() => {
        message.channel.send('Lockdown lifted.');
        clearTimeout(client.lockit[message.channel.id]);
        delete client.lockit[message.channel.id];
      }).catch(error => {
        console.log(error);
      });
    } else {
      message.channel.overwritePermissions(message.guild.id, {
        SEND_MESSAGES: false
      }).then(() => {
        message.channel.send(`Channel locked down for ${ms(ms(time), { long:true })}`).then(() => {
  
          client.lockit[message.channel.id] = setTimeout(() => {
            message.channel.overwritePermissions(message.guild.id, {
              SEND_MESSAGES: null
            }).then(message.channel.send('Lockdown lifted.')).catch(console.error);
            delete client.lockit[message.channel.id];
          }, ms(time));
  
        }).catch(error => {
          console.log(error);
        });
      });
    }
 };
  

if (cmd == `${prefix}lock`){
  if (!client.lockit) client.lockit = [];

  message.channel.createOverwrite(message.guild.id, {
      SEND_MESSAGES: false
    })
      message.channel.send(`Damnn, **${message.author.username}** just locked the channel down. Don't worry, Admins will soon open the chat again so be patient.`);
};


if (cmd == `${prefix}clear`){
   //if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("❌**Error:** You don't have the **Manage Messages** permission!");
   if(!args[0]) return message.reply('Usage: purge all|bots|user|author|images <amount>')
   if(args[0] === 'all') {
     if(!args[1]) return message.channel.send("You need to specify an amount");
     if(isNaN(args[1])) return message.channel.send("You need to specify a valid amount");
     if(parseInt(args[1]) > 100) return message.channel.send("I can only delete max 100 messages at a time :wink:")
 
     let messagecount = parseInt(args[1]) + 1;
     message.channel.messages.fetch({
       limit: 100
     }).then(messages => message.channel.bulkDelete(messagecount))
     .catch(e => {
       if(e) return message.channel.send("Error: ", e)
     })
   }
   else if(args[0] === 'bots') {
     if(!args[1]) return message.channel.send("You need to specify an amount");
     if(isNaN(args[1])) return message.channel.send("You need to specify a valid amount");
     if(parseInt(args[1]) > 100) return message.channel.send("I can only delete max 100 messages at a time :wink:")
 
     message.channel.messages.fetch({
       limit: args[1] + 1
     }).then(messages => {
       const userMessages = messages.filter(message => message.author.bot) 
       message.channel.bulkDelete(userMessages)
     }).catch(e => {
       if(e) return message.channel.send("Error: ", e)
     })
   }
   else if(args[0] === 'user') {
     if(!args[1]) return message.channel.send("You need to specify an amount");
     if(isNaN(args[1])) return message.channel.send("You need to specify a valid amount");
     if(parseInt(args[1]) > 100) return message.channel.send("I can only delete max 100 messages at a time :wink:")
 
     message.channel.messages.fetch({
       limit: args[1] + 1
     }).then(messages => {
       const userMessages = messages.filter(message => !message.author.bot) 
       message.channel.bulkDelete(userMessages)
     }).catch(e => {
       if(e) return message.channel.send(`Errore, non sono presenti messaggi su questa chat`, e)
     })
   }
   else if(args[0] === 'author'){
     if(!message.mention || message.mentions.users.size < 1) return message.channel.send("Ping someone to delete their message!")
     if(!args[2]) return message.channel.send("You need to specify an amount");
     if(isNaN(args[2])) return message.channel.send("You need to specify a valid amount");
     if(parseInt(args[2]) > 100) return message.channel.send("I can only delete max 100 messages at a time :wink:")
 
     message.channel.messages.fetch({
       limit: parseInt(args[2]) + 1
     }).then(messages => {
       const userMessages = messages.filter(message => message.mentions.users.first() || message.author) 
       message.channel.bulkDelete(userMessages)
     }).catch(e => {
       if(e) return message.channel.send("Error: ", e)
     })
   }
   else if(args[0] === 'image') {
     message.reply("Upcoming feature :wink:")
   }
   else {
     message.reply('Usage: purge all|bots|user|author <amount>')
   }
 };


if (cmd == `${prefix}ricarica`){
  if (message.author.id !== '795722899016122398') return message.reply('You do not have the permission to use this command!');
  let command;
  if (!client.commands.has(args[0])) {
    command = args[0];
  } else if (client.aliases.has(args[0])) {
    command = client.aliases.get(args[0]);
  }
  if (!command) {
    return message.channel.send(`I cannot find the command: ${args[0]}`);
  } else {
    message.channel.send(`Reloading: ${command}`)
      .then(m => {
        client.reload(command)
          .then(() => {
            m.edit(`Successfully reloaded: ${command}`);
          })
          .catch(e => {
            m.edit(`Command reload failed: ${command}\n\`\`\`${e.stack}\`\`\``);
          });
      });
  }
};


if (cmd == `${prefix}wallpaper`){
    const { body } = await superagent
    .get("https://nekos.life/api/v2/img/wallpaper");
    if(!message.channel.nsfw) return message.reply("NSFW is not enabled in this channel");
    
    const embed = new Discord.MessageEmbed()
    .setColor("#ff9900")
    .setImage(body.url) 
    message.channel.send({embed})
  
};

if (cmd == `${prefix}stats`){
    const version = 1.0
    var time = Date.now();
	const duration = moment.duration(client.uptime).format(' D [days], H [hrs], m [mins], s [secs]');
	const embed = new Discord.MessageEmbed()
		.setColor('RED')
		.setAuthor(client.user.username, client.user.displayAvatarURL)
		.setTitle('BOT STATS')
		.addField(`Memory Usage`, `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, true)
		.addField(`Uptime`, `${duration}`, true)
		.addField(`Commands`, `${client.commandsNumber}`, true)
		.addField(`Users`, `${client.users.cache.filter(u => u.id !== '1').size.toLocaleString()}`, true)
		//.addField(`Servers`, `${client.guilds.size.toLocaleString()}`, true)
		//.addField(`Channels`, `${client.channels.size.toLocaleString()}`, true)
		.addField(`Discord.js`, `v${version}`, true)
		.addField(`Node`, `${process.version}`, true)
		.addField(`Bot Version`, `${client.version}`, true)
		.setFooter(`Time taken: ${Date.now() - time}ms`);
	message.channel.send({ embed });
}


if (cmd == `${prefix}votekick`){

    const agree    = "✅";
    const disagree = "❎";

    if (message.mentions.users.size === 0){
        return message.reply(":x: " + "| Please Mention A User To Kick Next Time");
      }
    
      let kickmember = message.guild.member(message.mentions.users.first());
      if(!kickmember){
        message.reply(":x: " + "| That User Does Not Seem Valid!");
      }
    
      if(!message.guild.member(client.user).hasPermission("KICK_MEMBERS")){
        return message.reply(":x: " + "| i need the \"KICK_MEMBERS\" permission!").catch(console.error);
      }
    
      const embedvote = new Discord.MessageEmbed()
      .setDescription('<a:yobro:805079750707773480> È iniziata una votazione corri! (hai 10 secondi)')
      .setTimestamp()
      let msg = await message.channel.send(embedvote);
      await msg.react(agree);
      await msg.react(disagree);
    
      const reactions = await msg.awaitReactions(reaction => reaction.emoji.name === agree || reaction.emoji.name === disagree, {time: 10000});
      msg.delete();
    
      var NO_Count = reactions.get(disagree).count;
      var YES_Count = reactions.get(agree).count;
    
      if(YES_Count == undefined){
        var YES_Count = 1;
      }else{
        var YES_Count = reactions.get(agree).count;
      }
    
      var sumsum = new Discord.MessageEmbed()
      
                .addField("<a:yobro:805079750707773480> Votazione terminata:", "----------------------------------------\n" +
                                              "<a:warzone:805165583678439454> Voti totali sul No: " + `${NO_Count-1}\n` +
                                              "<a:warzone:805165583678439454> Voti totali sul SI: " + `${YES_Count-1}\n` +
                                              "----------------------------------------\n" +
                                              "<a:warzone:805165583678439454> Nota bene: per kikkare servono almeno 3+ voti\n" +
                                              "----------------------------------------", true)
    
                .setColor("0x#FF0000")
    
      await message.channel.send({embed: sumsum});
    
      if(YES_Count >= 1 && YES_Count > NO_Count){
    
        kickmember.kick().then(member => {
          message.reply(`${member.user.username} was succesfully kicked`)
        })
      }else{
    
        message.channel.send("\n" + "SAFE..... FOR NOW");
      }
    }  


if(cmd == `${prefix}shut`){
    let isBotOwner = message.author.id == '795722899016122398';
    if (!isBotOwner)
    return;

    let embedrestart = new Discord.MessageEmbed()
    .setTitle(`<a:yobro:805079750707773480> **Avviso di sistema:**`)
    .setDescription('<a:warzone:805165583678439454> Bot offline per manutenzione, fra poche ore tornerà online')
    .setThumbnail('https://cdn.discordapp.com/avatars/533024013069451287/a_1a58b6f30df4a0c7d6264e51a287218b.gif?size=128')
    .setTimestamp();

    message.channel.send(embedrestart).then(m => {
        client.destroy();
    });
}


if(cmd == `${prefix}restart`){
    let isBotOwner = message.author.id == '795722899016122398';
    if (!isBotOwner)
    return;

    let Annchannel = message.guild.channels.cache.find(c => c.name === "annunci")
    if(!Annchannel) return;

    let embedtimeout = new Discord.MessageEmbed()
    .setTitle(`<a:yobro:805079750707773480> **Avviso di sistema:**`)
    .setDescription('<a:warzone:805165583678439454> Restart avvenuto con successo, tutti i servizi sono operativi')
    .setThumbnail('https://cdn.discordapp.com/avatars/533024013069451287/a_1a58b6f30df4a0c7d6264e51a287218b.gif?size=128')
    .setTimestamp();

    let embedrestart = new Discord.MessageEmbed()
    .setTitle(`<a:yobro:805079750707773480> **Avviso di sistema:**`)
    .setDescription('<a:warzone:805165583678439454> Bot in fase di riavvio, tornerà presto disponibile')
    .setThumbnail('https://cdn.discordapp.com/avatars/533024013069451287/a_1a58b6f30df4a0c7d6264e51a287218b.gif?size=128')
    .setTimestamp();

    message.channel.send(embedrestart).then(m => {
        client.destroy();
        client.login(config.token);
    
    setTimeout(() => {
        Annchannel.send(embedtimeout)
        client.user.setActivity('Looking samu_!#0001')
    }, 20000)

    });
}


if (cmd == `${prefix}tempo`){
    if(args.length === 0){
        let errorembed = new Discord.MessageEmbed()
        .setTitle("Problema riscontrato")
        .setDescription("Inserisci una località valida!")
        .setColor("FF5757")
        .setTimestamp()
      return message.channel.send(errorembed);
    }
    
    weather.find({search: args.join(" "), degreeType: 'C'}, function(err, result) {
      
    if(result.length === 0){
        let errorembed = new Discord.MessageEmbed()
        .setTitle("Error :cry:")
        .setDescription("Please enter a vaild location!")
        .setColor("FF5757")
        .setTimestamp()
      return message.channel.send(errorembed);
    }
    
      var current = result[0].current;
      var location = result[0].location;
        if (err) {
        let errorembed = new Discord.MessageEmbed()
        .setTitle("Error :cry:")
        .setDescription("Please enter a vaild location!")
        .setColor("FF5757")
        .setTimestamp()
      return message.channel.send(errorembed);
        }
    
        
        let embed = new Discord.MessageEmbed()
        .setAuthor(`Informazioni del tempo per ${current.observationpoint}`)
        .setThumbnail(current.imageUrl)
        .setColor(0x00AE86)
        .addField('Fuso orario', `UTC${location.timezone}`, true)
        .addField('Temperatura', `${current.temperature} Gradi`, true)
        .addField('Vento', current.winddisplay, true)
        .addField('Umidità', `${current.humidity}%`, true)
        .setTimestamp()
        message.channel.send(embed)
    });
}

    if (cmd == `${prefix}orario`) {
        var today = new Date()
        const Days = {
            Monday: 'Lunedì',
            Tuesday: 'Martedì',
            Wednesday: 'Mercoledì',
            Thursday: 'Giovedì',
            Friday: 'Venerdì',
            Saturday: 'Sabato',
            Sunday: 'Domenica',
        }
        const Months = {
            Jan: 'Gennaio',
            Feb: 'Fabbraio',
        }
        let Day = today.toString().split(" ")[0].concat("day");
        let Month = today.toString().split(" ")[1]
        let Year = today.toString().split(" ")[3]
        const embed = new Discord.MessageEmbed()
        .setColor("RANDOM")
        .addField("Oggi è :", `${Days[Day]}` + ", " + `${Months[Month]}` + ", " + `${Year}`)
        .addField("Orario attuale:", `${today.toString().split(" ")[4]}`)
        message.channel.send({ embed })
    }



if (cmd == `${prefix}serverinfo`){

        const verificationLevel = {
            NONE: 'Nessuna sicurezza attiva',
            LOW: 'Sicurezza bassa',
            MEDIUM: 'Sicurezza media',
            HIGHT: 'Sicurezza elevata',
            VERY_HIGHT: 'Sicurezza molto elevata'
        }
        const regions = {
            europe: 'Server europeo',
            brazil: 'Server brasiliano'
        }

        const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position).map(role => role.toString());
        const members = message.guild.members.cache;
        const channels = message.guild.channels.cache;
        const emojis = message.guild.emojis.cache; 


         let embedtest2 = new Discord.MessageEmbed()
            .setDescription(`<a:yobro:805079750707773480> **Informazioni per il server** ***__${message.guild.name}__***`)
            .setColor('BLUE')
            .setThumbnail(message.guild.iconURL({ dynamic: true}))
            .addField('<:yesman:805166424670470175> Generali', [
                `<a:warzone:805165583678439454> **Nome del server:** ${message.guild.name}`,
                `<a:warzone:805165583678439454> ** ID del server:** ${message.guild.id}`,
                `<a:warzone:805165583678439454> ** Owner del server:** ${message.guild.owner.user.tag} (${message.guild.ownerID})`,
                `<a:warzone:805165583678439454> ** Regione del server:** ${regions[message.guild.region]} con ${Math.round(client.ws.ping)} di ping`,
                `<a:warzone:805165583678439454> ** Livello boost server:** ${message.guild.premiumTier ? `Livello ${message.guild.premiumTier}` : `Il server non ha ancora nessun boost`}`,
                `<a:warzone:805165583678439454> ** Livello sicurezza del server:** ${verificationLevel[message.guild.verificationLevel]}`,
                '\u200b'

                ])

                .addField('<:yesman:805166424670470175> Statistiche', [
                    `<a:warzone:805165583678439454> ** Ruoli totali:** ${roles.length}`,
                    `<a:warzone:805165583678439454> ** Emoji totali:** ${emojis.length}`,
                    `<a:warzone:805165583678439454> ** Emoji - non animate:** ${emojis.filter(emoji => !emoji.animated).size}`,
                    `<a:warzone:805165583678439454> ** Utenti totali:** ${message.guild.memberCount}`,
                    `<a:warzone:805165583678439454> ** Utenti:** ${members.filter(member => member.user.bot).size}`,
                    `<a:warzone:805165583678439454> ** Bot:** ${members.filter(member => member.user.bot).size}`,
                    `<a:warzone:805165583678439454> ** Canali testuali:** ${channels.filter(channel => channel.type === 'text').size}`,
                    `<a:warzone:805165583678439454> ** Canali vocali:** ${channels.filter(channel => channel.type === 'voice').size}`,
                    `<a:warzone:805165583678439454> ** Numeri di boost:** ${message.guild.premiumSubscriptionCount || '0'}`, 
                    '\u200b'

                ])

                .addField('<:yesman:805166424670470175> Stato utenti (`in fase di sviluppo`)', [
                    `<a:warzone:805165583678439454> ** Online:** ${members.filter(member => member.presence.status === "offline").size}`,
                    `<a:warzone:805165583678439454> ** Inattivi:** ${members.filter(member => member.presence.status === "idle").size}`,
                    `<a:warzone:805165583678439454> ** Non disturbare:** ${members.filter(member => member.presence.status === "dnd").size}`,
                    `<a:warzone:805165583678439454> ** Offline:** ${members.filter(member => member.presence.status === "online").size}`,
                    '\u200b'
                ])

                .addField(`<:yesman:805166424670470175> Ruoli [${roles.length -1}]`, roles.length <10 ? roles.join(', ') : roles.length > 10 ? this.client.utils.trimArray() : 'Nessun ruolo disponibile')
                .setThumbnail('https://cdn.discordapp.com/avatars/533024013069451287/a_1a58b6f30df4a0c7d6264e51a287218b.gif?size=128')
                .setTimestamp();

            return message.channel.send(embedtest2)
    }


    if (cmd == `${prefix}roleinfo`){
      const roleName = args.join(" ");
      const role = message.guild.roles.cache.find(r => r.name.toLowerCase() == roleName.toLowerCase());
      if (!role) return message.reply("That doesn't seem to be a role");
      let haveRole = message.guild.members.cache.filter(m => m.roles.cache.get(role.id)).size;
      const embed = new Discord.MessageEmbed()
      .setColor(role.hexColor)
      .setTitle('<a:yobro:805079750707773480> Informazioni per il ruolo: '+ role.name)
      .addField("<a:warzone:805165583678439454> Nome", role.name , true)
      .addField("<a:warzone:805165583678439454> ID ruolo", role.id, true)
      .addField("<a:warzone:805165583678439454> Colore ruolo (Hex)", role.hexColor, true)
      .addField("<a:warzone:805165583678439454> Posizione", role.position, true)
      .addField("<a:warzone:805165583678439454> Creato il giorno:", new Date(role.createdAt).toISOString().slice(0, 19).replace(/-/g, "/").replace(/T/g, " "), true)
      .addField("<a:warzone:805165583678439454> Utenti che hanno il ruolo", `${haveRole} utenti/e che hanno questo ruolo.`, true)
      message.channel.send(embed)
    }


  if (cmd == `${prefix}search`){
    const requiredPermissions = [
      "ADD_REACTIONS",
      "MANAGE_MESSAGES",
      "EMBED_LINKS" ];
      const page = (punishments, message, user) => {
        let pg = message.page;
        const embed = new Discord.MessageEmbed()
        .setTitle(`Page ${message.page} of punishment history for ${user.tag}`)
        .setColor("#9669FE")
        for (let i = 1; i <= 5; i++) {
            const current = punishments[(5 * (pg - 1)) + i]
            if (!current) break;
            embed.addField(
                current.id,
                `**${current.type.toProperCase()}**\n**Reason**: ${current.reason}\n**Made at**: ${current.time}\n`,
                true
            );
        };
    
        if (embed.fields.length === 0) embed.setDescription("No punishments on this page");
        if (embed.fields.length === 0 && message.page === 1) embed.setDescription(`<@${user.id}> has no punishments`);
        return embed;
    };
        for (const permission in requiredPermissions) {  
            if (permission === "random") continue;
            if (!message.channel.permissionsFor(message.guild.me).has(requiredPermissions[permission])) {
                return await message.channel.send(`I am missing the required \`${requiredPermissions[permission]}\` permission to use this command`)
                .catch(err => {})
                .then(msg => msg.delete(10000).catch(err => {}));
            };
        };
        let user = args[0] ? await client.fetchUser(args[0].replace(/\D/g, ""), false).catch(e => {}) : message.author;
        user = user ? user : message.author; // If the args[0] user is null or undefined, default to the message author
    
        const punishments = await client.db.r.table("punishments").run()
        .filter(punishment => punishment.offender === `${message.guild.id}-${user.id}`);
        const msg = await message.channel.send("Loading...")
        const collector = await new ReactionCollector(msg, (a,b) => true);//(reaction, user) => user.id === message.author.id);
        message.page = 1
        await msg.react("⬅");
        await msg.react("➡");
        await msg.react("❌");
        const emojis = ["⬅", "➡"]
        await msg.edit(page(punishments, message, user));
        collector.on("collect", async reaction => {
            if (message.author.id !== reaction.users.last().id) return;
            if (msg.deleted) return collector.stop();
            await reaction.remove(reaction.users.last());
            
            if (reaction.emoji.name ==="❌") return collector.stop();
            if (emojis.includes(reaction.emoji.name)) {
                message.page = reaction.emoji.name == "➡" ? message.page + 1 : message.page - 1;
                message.page = message.page < 1 ? 1 : message.page;
                message.page = punishments.length < 5 * (message.page - 1) + 1 ? message.page - 1 : message.page 
                await msg.edit(page(punishments, message, user));
                
            };
        });
        collector.on("end", async (collected, reason) => {
            if (!msg.deleted) await msg.delete();
        })
    };

    if (cmd == `${prefix}ann`){
        const embed11 = new Discord.MessageEmbed()
	    .setTitle('<:yesman:805166424670470175> Changelog')
        .setColor('#0099ff')
        .setDescription('<a:warzone:805165583678439454> **in fase di sviluppo sistema soldi**\n<a:warzone:805165583678439454> **Meno lag per i messaggii**\n<a:warzone:805165583678439454> **In arrivo sistema antiraid**\n<a:warzone:805165583678439454> **Tolta possibilità di spammare**')
        .setTimestamp();
        const webhookChannelID = "805171791940812820";
        const channel = message.guild.channels.cache.get(webhookChannelID)

        const webhooks = await channel.fetchWebhooks();
        const webhook = webhooks.first();
        if(webhooks.array().length == 0){
            webhook = await channel.createWebhook('Example Webhook');
        }

        webhook.send( {
        username: 'Announci bot',
        avatarURL: 'https://cdn.discordapp.com/avatars/533024013069451287/a_1a58b6f30df4a0c7d6264e51a287218b.gif?size=128',
        embeds: [embed11],
    });

}



    if (cmd ==  `${prefix}userinfo`){
        const member = message.mentions.members.first() || message.member;
        const roles = member.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, -1);
        const flags = {
            HOUSE_BALANCE: 'Squad Balance <:yesyes:805186472192901152>'
        }
        const userFlags = member.user.flags.toArray();
        const embed22 = new Discord.MessageEmbed()
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 128}))
        .setDescription(`**Informazioni per l'utente: **` + member.user.username + "#" + member.user.discriminator)
        .setColor("#fffff")
        .addField('<:yesman:805166424670470175> Informazioni generali', [
            `<a:warzone:805165583678439454> **Nome utente:** ${member.user.username}#${member.user.discriminator}`,
            `<a:warzone:805165583678439454> **ID:** ${member.id}`,
            `<a:warzone:805165583678439454> **Stato:** ${member.user.presence.status}`,
            `<a:warzone:805165583678439454> **Badge account:** ${userFlags.length ? userFlags.map(flag => flags[flag]).join(', ') : 'Nessun badge'}`,
            `<a:warzone:805165583678439454> **Registrato su discord:** ${moment(member.user.createdTimestamp).format('LT')} ${moment(member.user.createdTimestamp).format('LL')} ${moment(member.user.createdTimestamp).fromNow()}`,
            `<a:warzone:805165583678439454> **Entrato nel server il :** ${moment(member.joinedAt).format('LL LTS')}`,
            `<a:warzone:805165583678439454> **Attività:** ${member.user.presence.clientStatus || 'Non sta giocando a nulla'}`,

        ])

        .addField(`<:yesman:805166424670470175> Ruoli Account (${roles.length})`, [
            `<a:warzone:805165583678439454> **Ruolo massimo:** ${member.roles.highest.id === message.guild.id ? 'Non hai ruoli' : member.roles.highest}`,
            `${roles.length < 10 ? roles.join(', ') : roles.length > 10 ? trimArray(roles) : 'Non hai nessun ruolo'}`,
            
        ])
        .setTimestamp()

        return message.channel.send(embed22)
    }


    if (cmd == `${prefix}botinfo`){

        let embedtest = new Discord.MessageEmbed()
        .setDescription('<a:gg:805082561600159765> Informazioni riguardanti il bot <a:gg:805082561600159765>')
        .setColor("#15f153")
        .addField('Nome del Bot', client.user.username)
        .addField("Creato il giorno", client.user.createdAt)
          

        return message.channel.send(embedtest);
    }


  if (cmd == `${prefix}channel` ){
    let haveRole = message.guild.members.cache.filter(m => m.roles.cache.get(role.id)).size;
    message.guild.channels.create(`I membri totali sono: ${message.guild.memberCount}`, { //Create a channel
      type: 'voice', //Make sure the channel is a text channel
      permissionOverwrites: [{ //Set permission overwrites
          id: message.guild.id,
          allow: ['VIEW_CHANNEL'],
           }]
        });
    }
});

client.login(config.token);