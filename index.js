const dotenv = require('dotenv')
const Transcriber = require("discord-speech-to-text")
const { joinVoiceChannel } = require('@discordjs/voice')
const Discord = require('discord.js')
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_VOICE_STATES"], partials: ["CHANNEL"] })

dotenv.config()
const transcriber = new Transcriber(process.env.WITAIKEY_SERVER)
let voiceConnection

let flag = true
client.on('ready', async (msg) => {
  console.log(`已啟動 ${client.user.tag}!`);
})

client.on('message', async (msg) => {
  if (msg.channel.type == 'GUILD_VOICE') {

    if (msg.content.trim().toLocaleLowerCase() == 'speech') {
      if (voiceConnection) {
        voiceConnection.disconnect()
      }
      client.channels.fetch(msg.channel.id).then((channel) => {
        voiceConnection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfDeaf: false,
          selfMute: false
        })


        voiceConnection.receiver.speaking.on("start", (userId) => {
          let temp = ''
          transcriber.listen(voiceConnection.receiver, userId, client.users.cache.get(userId)).then((data) => {
            if (!data.transcript.text) return
            let text = data.transcript.text
            let user = data.user

            if (temp !== text) {
              temp = text
              msg.channel.send(`\`\`\`diff\n ${user.username}\n ${text}\n\`\`\``)
            }
          });
        });
      })
    }
    if (msg.content.trim().toLocaleLowerCase() == 'mute') {
      if (voiceConnection) {
        voiceConnection.disconnect()
      }
    }
  }

})

client.login(process.env.DISCORD);