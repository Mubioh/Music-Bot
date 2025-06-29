require("dotenv").config();

module.exports = {
  discordToken: process.env.DISCORD_TOKEN,
  clientId: process.env.DISCORD_CLIENT_ID,
  musicChannelId: process.env.MUSIC_CHANNEL_ID,
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    market: process.env.SPOTIFY_MARKET || "US",
  },
};
