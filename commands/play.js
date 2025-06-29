const {
  SlashCommandBuilder,
  PermissionsBitField,
  MessageFlags,
} = require("discord.js");

const { useMainPlayer } = require("discord-player");
const { SpotifyExtractor } = require("discord-player-spotify");

const MusicMessages = require("../utils/MusicMessages");

const truncate = (str, max = 100) =>
  str.length > max ? str.slice(0, max - 1) + "…" : str;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Search for a song or paste a link")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    const player = useMainPlayer();
    const query = interaction.options.getString("song", true);
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({
        embeds: [
          MusicMessages.error("You must be in a voice channel to use this command."),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    const permissions = voiceChannel.permissionsFor(interaction.guild.members.me);
    if (
      !permissions.has(PermissionsBitField.Flags.Connect) ||
      !permissions.has(PermissionsBitField.Flags.Speak)
    ) {
      return interaction.reply({
        embeds: [
          MusicMessages.error("I need permission to connect and speak in your voice channel."),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const result = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: `ext:${SpotifyExtractor.identifier}`,
      });

      if (!result.hasTracks()) {
        return interaction.editReply({
          embeds: [MusicMessages.error("No supported track found from this link.")],
        });
      }

      const queue = player.nodes.create(interaction.guild, {
        metadata: interaction.channel,
      });

      if (!queue.connection) await queue.connect(voiceChannel);

      if (result.playlist && result.tracks.length > 1) {
        for (const track of result.tracks) {
          await queue.addTrack(track);
        }

        if (!queue.isPlaying()) {
          await queue.node.play();
        }

        return interaction.editReply({
          embeds: [
            MusicMessages.success(
              `Added **${result.playlist.title}** (${result.tracks.length} tracks) to the queue.`
            ),
          ],
        });
      } else {
        const track = result.tracks[0];
        await queue.addTrack(track);

        if (!queue.isPlaying()) {
          await queue.node.play();
        }

        return interaction.editReply({
          embeds: [
            MusicMessages.success(
              `Added **${track.author} - ${track.title}** to the queue.`
            ),
          ],
        });
      }
    } catch (err) {
      console.error("Play Error:", err);

      return interaction.editReply({
        embeds: [MusicMessages.error("No supported track found from this link.")],
      });
    }
  },

  async autocompleteRun(interaction) {
    const player = useMainPlayer();
    const rawQuery = interaction.options.getFocused()?.trim();
    const query = rawQuery || "a";

    try {
      const searchResult = await player.search(query, {
        requestedBy: interaction.user,
        searchEngine: `ext:${SpotifyExtractor.identifier}`,
      });

      if (!searchResult.hasTracks()) {
        return interaction.respond([
          { name: "No tracks found", value: "none" },
        ]);
      }

      if (searchResult.playlist && searchResult.tracks.length > 1) {
        return interaction.respond([
          {
            name: truncate(`${searchResult.playlist.title} (${searchResult.tracks.length} tracks)`),
            value: searchResult.url || searchResult.playlist?.url || searchResult.tracks[0].url,
          },
        ]);
      }

      const seen = new Set();
      const uniqueTracks = searchResult.tracks.filter((track) => {
        const key = `${track.author.toLowerCase()}-${track.title.toLowerCase()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const results = uniqueTracks.slice(0, 10).map((track) => ({
        name: truncate(`${track.author} - ${track.title} - ${track.duration}`),
        value: track.url,
      }));

      return interaction.respond(results);
    } catch (err) {
      console.error("Autocomplete error:", err);
      return interaction.respond([
        { name: "Could not search tracks", value: "none" },
      ]);
    }
  },
};
