# 🎵 Music Bot

**Music Bot** is a lightweight Discord bot built with [`discord.js`](https://discord.js.org/) and [`discord-player`](https://discord-player.js.org/), providing music playback in voice channels. It features slash commands, queue selection menus, and dynamic UI elements.

---

## 🚀 Features

- 🧠 Autocomplete search in `/play`
- ⏯️ Interactive **Pause**, **Resume**, **Skip**, and **Queue** buttons
- 📝 Slash command interface (`/play`, `/stop`)
- 📋 Queue interaction with dropdown menus

---

## 🛠 Requirements

- **Node.js v18+**
- A Discord bot token
- Spotify developer credentials
- FFmpeg (included via `ffmpeg-static`)

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/Mubioh/Music-Bot.git
cd Music-Bot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file in the root folder:

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_bot_client_id
MUSIC_CHANNEL_ID=your_default_text_channel_id

SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_MARKET=GB
```

---

## ▶️ Running the Bot

```bash
node index.js
```

Once online, use:

- `/play [song or link]` – search or link from Spotify/YouTube
- `/stop` – stop and clear the queue

The bot updates the **Now Playing** embed in your configured music text channel, and displays controls for interaction.

---

## 📁 Folder Structure

```
Music-Bot/
│
├── commands/
│   ├── play.js           # /play command
│   └── stop.js           # /stop command
│
├── config/
│   └── index.js          # Loads environment variables
│
├── core/
│   └── init.js           # Command/event registration and extractors
│
├── events/
│   └── interactionCreate.js  # Handles button & dropdown logic
│
├── utils/
│   └── MusicMessages.js  # Central UI/embed builder
│
├── node_modules/         # Installed dependencies (ignored)
├── .env                  # Environment variables (ignored)
├── index.js              # Main bot entrypoint
├── package.json
└── package-lock.json
```

---

## 🔒 Permissions Required

Ensure the bot has the following permissions in your Discord server:

- View Channels  
- Send Messages  
- Connect  
- Speak  
- Read Message History  
- Use Application Commands  

---

## ✅ Example Usage

```bash
/play Never Gonna Give You Up
```

```bash
/play https://open.spotify.com/playlist/xyz123
```
