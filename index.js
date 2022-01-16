const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`${port}`));


// Definitions
const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();

// Utils & config requiring

const utils = require("./utils/utils")
const config = require("./utils/config.json");

// Handlers

fs.readdir("./src/events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        let eventFunction = require(`./src/events/${file}`);
        let eventStart = eventFunction.run.bind(null, client);
        let eventName = file.split(".")[0];
        client.events.set(eventName, eventStart)
        client.on(eventName, (...args) => eventFunction.run(client, utils, ...args));
    });
});

fs.readdir('./src/commands/', (err, files) => {
    if (err) console.error(err);
    files.forEach(f => {
        let props = require(`./src/commands/${ f }`);
        props.fileName = f;
        client.commands.set(props.help.name, props);
        props.help.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});

// Message Event (here because something could happen with event handler.)

client.on("message", async message => {

  if(message.author.id === client.user.id) return;
  var ServerJSON = JSON.parse(fs.readFileSync('./db/num.json'));


    if(message.channel.name === 'binary_counting'){

      ServerJSON[message.guild.id].dnum += 1;
      
      fs.writeFileSync('./db/num.json', JSON.stringify(ServerJSON));
      const dnum = ServerJSON[message.guild.id].dnum
      var binary = message.content.split(" ").join("");
      var digit = parseInt(binary, 2);
      console.log(digit);
      const lastplayer = ServerJSON[message.guild.id].lastnum

      if(lastplayer === message.author.id){
        message.delete()
        message.reply(' You cannot put 2 numbers in a row')
        .then(msg => {
                msg.delete({ timeout: 10000 /*time unitl delete in milliseconds*/});
            })
        ServerJSON[message.guild.id].dnum -= 1;
        fs.writeFileSync('./db/num.json', JSON.stringify(ServerJSON));

      }else{

        if(digit === dnum){
        message.react('✅')
        ServerJSON[message.guild.id].lastnum = message.author.id;
        fs.writeFileSync('./db/num.json', JSON.stringify(ServerJSON));
      }else{
        message.delete()
        message.reply('That number was wrong try again!')
          .then(msg => {
                msg.delete({ timeout: 10000 /*time unitl delete in milliseconds*/});
            })
           .catch((err) => console.log(err));
        ServerJSON[message.guild.id].dnum -= 1;
        fs.writeFileSync('./db/num.json', JSON.stringify(ServerJSON));
      }

      }
    }   
});


client.login(config.token /* If your token is stored in envorniment values use "process.env.TOKEN" */ );