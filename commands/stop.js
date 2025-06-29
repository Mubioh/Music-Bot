const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { useQueue } = require("discord-player");
const MusicMessages = require("../utils/MusicMessages");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback and clear the queue"),

  async execute(interaction) {
    const queue = useQueue(interaction.guildId);

    if (!queue || !queue.isPlaying()) {
      return interaction.reply({
        embeds: [MusicMessages.error("There is no music playing right now.")],
        flags: MessageFlags.Ephemeral,
      });
    }

    const textChannel = queue.metadata;
    if (textChannel?.send) {
      try {
        const messages = await textChannel.messages.fetch({ limit: 1 });
        const last = messages.first();

        if (last?.author?.id === interaction.client.user.id) {
          await last.edit({
            embeds: [MusicMessages.noTrackEmbed()],
            components: [MusicMessages.controlRow({ disabled: true })],
          });
        }
      } catch (err) {
        console.warn("⚠️ Could not update now-playing message:", err.message);
      }
    }

    queue.delete();

    return interaction.reply({
      embeds: [MusicMessages.success("Playback stopped and the queue was cleared.")],
      flags: MessageFlags.Ephemeral,
    });
  }
};
