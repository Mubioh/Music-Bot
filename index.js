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

  // Attempt to update the last message in each guild's #music channel
  for (const [guildId, guild] of client.guilds.cache) {
    const channel = guild.channels.cache.find(
      (c) => c.id === musicChannelId && c.isTextBased?.()
    );

    if (!channel) continue;

    try {
      const messages = await channel.messages.fetch({ limit: 1 });
      const last = messages.first();

      if (last?.author?.id === client.user.id) {
        await last.edit({
          embeds: [MusicMessages.noTrackEmbed()],
          components: [MusicMessages.controlRow({ disabled: true })],
        });
      }
    } catch (err) {
      console.warn(`Couldn’t update music embed in ${guild.name}:`, err.message);
    }
  }
});

  await client.login(discordToken);
})();
