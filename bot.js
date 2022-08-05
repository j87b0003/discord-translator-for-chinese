const dotenv = require('dotenv')
const Transcriber = require("discord-speech-to-text")
const { joinVoiceChannel } = require('@discordjs/voice')
const Discord = require('discord.js')
const client = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_VOICE_STATES"], partials: ["CHANNEL"] })

dotenv.config()
const _transcriber = new Transcriber(process.env.WITAIKEY_SERVER)
let _voiceConnection

let flag = true
client.on('ready', async (msg) => {
  console.log(`已啟動 ${client.user.tag}!`);
})

client.on('message', async (msg) => {
  if (msg.channel.type == 'GUILD_VOICE') {

    if (msg.content.trim().toLocaleLowerCase() == 'speech') {
      if (_voiceConnection) {
        //destroyConnection()
      }
      client.channels.fetch(msg.channel.id).then((channel) => {
        _voiceConnection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfDeaf: false,
          selfMute: false
        })

        startConnection(msg)
      })
    }

    if (msg.content.trim().toLocaleLowerCase() == 'mute') {
      destroyConnection()
    }
  }

})

function startConnection(msg) {

  _voiceConnection.receiver.speaking.on("start", (userId) => {
    _transcriber.listen(_voiceConnection.receiver, userId, client.users.cache.get(userId)).then((data) => {
      if (!data.transcript.text) return
      let text = data.transcript.text
      let user = data.user

        msg.guild.channels.cache.get('1004813343963500554').send(`\`\`\`diff\n ${user.username}\n ${text}\n\`\`\``)
        //msg.channel.send(`\`\`\`diff\n ${user.username}\n ${text}\n\`\`\``)

    })
  })

}

function destroyConnection() {
  if (_voiceConnection) {
    try {
      _voiceConnection.destroy(true)
    } catch (e) {
    }
  }
}

client.login(process.env.DISCORD)
