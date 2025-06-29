const { MessageFlags } = require("discord.js");
const MusicMessages = require("../utils/MusicMessages");

module.exports = async (client, interaction) => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (cmd) {
      return client.player.context.provide({ guild: interaction.guild }, () =>
        cmd.execute(interaction)
      );
    }
  }

  const queue = client.player.nodes.get(interaction.guildId);

  if (interaction.isButton()) {
    const userChannel = interaction.member?.voice?.channel;
    const botChannel = interaction.guild.members.me.voice.channel;

    if (!userChannel || userChannel.id !== botChannel?.id) {
      return interaction.reply({
        embeds: [
          MusicMessages.error(
            "You must be in the same voice channel as the bot to use this."
          ),
        ],
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({
        embeds: [MusicMessages.error("There is no active playback right now.")],
        flags: MessageFlags.Ephemeral,
      });
    }

    switch (interaction.customId) {
      case "music_pause": {
        queue.node.pause();
        const track = queue.currentTrack;

        const payload = MusicMessages.nowPlayingMessage(
          track,
          track.requestedBy,
          { paused: true }
        );

        await interaction.update(payload);

        return interaction.followUp({
          embeds: [
            MusicMessages.update(
              `Paused **${track.author} - ${track.title}**.`
            ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      case "music_resume": {
        queue.node.resume();
        const track = queue.currentTrack;

        const payload = MusicMessages.nowPlayingMessage(
          track,
          track.requestedBy,
          { paused: false }
        );

        await interaction.update(payload);

        return interaction.followUp({
          embeds: [
            MusicMessages.update(
              `Resumed **${track.author} - ${track.title}**.`
            ),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      case "music_skip": {
        const skipped = queue.currentTrack;
        const ok = queue.node.skip();

        return interaction.reply({
          embeds: [
            ok
              ? MusicMessages.update(
                  `Skipped **${skipped.author} - ${skipped.title}**.`
                )
              : MusicMessages.error("You're already at the end of the queue."),
          ],
          flags: MessageFlags.Ephemeral,
        });
      }

      case "music_queue":
        return interaction.reply(MusicMessages.queueMessage(queue));
    }
  }

  if (
    interaction.isStringSelectMenu() &&
    interaction.customId === "queue_select"
  ) {
    const idx = parseInt(interaction.values[0].split("_")[1], 10);
    const track = queue?.tracks.at(idx);

    if (Number.isInteger(idx) && track) {
      const embed = MusicMessages.trackInfoEmbed(track, track.requestedBy);
      const menu = MusicMessages.queueSelectRow(queue);

      return interaction.update({
        embeds: [embed],
        components: menu ? [menu] : [],
      });
    }

    return interaction.update({
      embeds: [MusicMessages.error("Track information could not be loaded.")],
      components: [],
    });
  }

  if (interaction.isAutocomplete()) {
    const cmd = client.commands.get(interaction.commandName);
    if (cmd?.autocompleteRun) return cmd.autocompleteRun(interaction);
  }
};
