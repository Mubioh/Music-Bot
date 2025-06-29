const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  Colors,
  MessageFlags,
} = require("discord.js");

class MusicMessages {
  static COLOUR_DEFAULT = 0x242429;
  static COLOUR_UPDATE = 0xFFB30F;
  static COLOUR_ERROR   = 0xFD151B;
  static COLOUR_SUCCESS = 0x6AB547;

  static error(message) {
    return new EmbedBuilder()
      .setColor(this.COLOUR_ERROR)
      .setDescription(message);
  }

  static update(message) {
    return new EmbedBuilder()
      .setColor(this.COLOUR_UPDATE)
      .setDescription(message);
  }

  static success(message, thumbnail = null) {
    const e = new EmbedBuilder()
      .setColor(this.COLOUR_SUCCESS)
      .setDescription(message);
    if (thumbnail) e.setThumbnail(thumbnail);
    return e;
  }

  static controlRow({ paused = false, disabled = false } = {}) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("music_pause")
      .setLabel("Pause")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || paused),

    new ButtonBuilder()
      .setCustomId("music_resume")
      .setLabel("Resume")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled || !paused),

    new ButtonBuilder()
      .setCustomId("music_skip")
      .setLabel("Skip")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(disabled),

    new ButtonBuilder()
      .setCustomId("music_queue")
      .setLabel("Queue")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled)
  );
}

  static nowPlayingEmbed(track, user, { paused = false } = {}) {
    return new EmbedBuilder()
      .setTitle(paused ? "Now Paused!" : "Now Playing!")
      .setDescription(`**[${track.author} - ${track.title}](${track.url})**`)
      .addFields(
        { name: "Song Duration", value: track.duration, inline: true },
        { name: "Requested by", value: user?.toString() ?? "Unknown", inline: true },
      )
      .setThumbnail(track.thumbnail)
      .setColor(this.COLOUR_DEFAULT);
  }

  static noTrackEmbed() {
    return new EmbedBuilder()
      .setTitle("No Songs in Queue")
      .setDescription("Use `/play [song or link]` to start listening to music.")
      .setColor(this.COLOUR_DEFAULT);
  }

  static trackInfoEmbed(track, user) {
    return new EmbedBuilder()
      .setTitle(`${track.author} - ${track.title}`)
      .setURL(track.url)
      .addFields(
        { name: "Song Duration", value: track.duration, inline: true },
        { name: "Requested by", value: user.toString(), inline: true },
      )
      .setThumbnail(track.thumbnail)
      .setColor(this.COLOUR_SUCCESS);
  }

  static queueSelectRow(queue) {
    if (!queue) return null;

    const trackList = Array.isArray(queue.tracks)
      ? queue.tracks
      : queue.tracks?.toArray?.() ?? [];

    if (!trackList.length) return null;

    const options = trackList.slice(0, 25).map((track, i) => ({
      label: `${track.author} - ${track.title}`.slice(0, 100),
      description: track.duration,
      value: `queue_${i}`,
    }));

    return new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("queue_select")
        .setPlaceholder("Select a track for info")
        .addOptions(options)
    );
  }

  static nowPlayingMessage(track, user, { paused = false } = {}) {
    return {
      embeds: [this.nowPlayingEmbed(track, user, { paused })],
      components: [this.controlRow({ paused })],
    };
  }

  static queueMessage(queue) {
    const row = this.queueSelectRow(queue);
    return row
      ? { components: [row], flags: MessageFlags.Ephemeral }
      : { embeds: [this.error("The queue is currently empty.")], flags: MessageFlags.Ephemeral };
  }
}

module.exports = MusicMessages;
