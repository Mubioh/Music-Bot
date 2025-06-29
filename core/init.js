const fs = require("fs");
const path = require("path");

const {
  REST,
  Routes,
  ChannelType,
} = require("discord.js");

const { YoutubeiExtractor } = require("discord-player-youtubei");
const { SpotifyExtractor } = require("discord-player-spotify");

const { discordToken, clientId, spotify, musicChannelId } = require("../config");
const MusicMessages = require("../utils/MusicMessages");

async function registerExtractors(player) {
  await player.extractors.register(YoutubeiExtractor, {
    streamOptions: { useClient: "WEB_EMBEDDED" },
  });

  await player.extractors.register(SpotifyExtractor, {
    clientId: spotify.clientId,
    clientSecret: spotify.clientSecret,
    market: spotify.market,
  });
}

function loadEvents(client) {
  const eventsPath = path.join(__dirname, "../events");

  fs.readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"))
    .forEach((file) => {
      const event = require(path.join(eventsPath, file));
      const eventName = file.replace(".js", "");
      client.on(eventName, (...args) => event(client, ...args));
    });
}

async function registerCommands(client) {
  const rest = new REST({ version: "10" }).setToken(discordToken);
  await rest.put(Routes.applicationCommands(clientId), {
    body: client.commands.map((cmd) => cmd.data.toJSON()),
  });
}

function registerPlayerEvents(player) {
  const getMusicChannel = async (guild) =>
    guild.channels.cache.find(
      (c) => c.id === musicChannelId && c.type === ChannelType.GuildText
    );

  const updateMusicMessage = async (guild, embed, components) => {
    const channel = await getMusicChannel(guild);
    if (!channel) return;

    const messages = await channel.messages.fetch({ limit: 1 });
    const lastMsg = messages.first();

    if (lastMsg?.author?.bot) {
      await lastMsg.edit({ embeds: [embed], components: [components] }).catch(() => {});
    } else {
      await channel.send({ embeds: [embed], components: [components] });
    }
  };

  player.events.on("playerStart", async (queue, track) => {
    const payload = MusicMessages.nowPlayingMessage(track, track.requestedBy);
    await updateMusicMessage(queue.guild, payload.embeds[0], payload.components[0]);
  });

  const clearEmbed = async (queue) => {
    const embed = MusicMessages.noTrackEmbed();
    const row = MusicMessages.controlRow({ disabled: true });
    await updateMusicMessage(queue.guild, embed, row);
  };

  player.events.on("emptyQueue", clearEmbed);
  player.events.on("disconnect", clearEmbed);
  player.events.on("emptyChannel", clearEmbed);


  player.events.on("error", (q, err) => console.log("Queue error:", err));
  player.events.on("playerError", (q, err) => console.log("Playback error:", err));
}

module.exports = {
  registerExtractors,
  loadEvents,
  registerCommands,
  registerPlayerEvents,
};
