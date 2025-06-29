const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require('discord-player');

const { discordToken, musicChannelId } = require('./config');

const MusicMessages = require("./utils/MusicMessages");

const playCommand = require('./commands/play');
const stopCommand = require("./commands/stop");

const {
  registerExtractors,
  loadEvents,
  registerCommands,
  registerPlayerEvents,
} = require('./core/init');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
client.player   = new Player(client);

client.commands.set(playCommand.data.name, playCommand);


(async () => {
  await registerExtractors(client.player);

  registerPlayerEvents(client.player);

  loadEvents(client);

  
client.once("ready", async () => {
  await registerCommands(client);
  console.log(`✅ Logged in as ${client.user.tag}`);

  for (const [guildId, guild] of client.guilds.cache) {
    const channel = guild.channels.cache.find(
      (c) => c.id === musicChannelId && c.isTextBased?.()
    );

    if (!channel) continue;

    try {
      const messages = await channel.messages.fetch({ limit: 1 });
      const last = messages.first();

      const embed = MusicMessages.noTrackEmbed();
      const row = MusicMessages.controlRow({ disabled: true });

      if (last?.author?.id === client.user.id) {
        await last.edit({ embeds: [embed], components: [row] });
      } else {
        await channel.send({ embeds: [embed], components: [row] });
      }
    } catch (err) {
      console.warn(`Couldn’t update or send music embed in ${guild.name}:`, err.message);
    }
  }
});


  await client.login(discordToken);
})();
