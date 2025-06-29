const { REST, Routes } = require("discord.js");
const { clientId, discordToken } = require("./config");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command?.data && command?.execute) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARN] Command at ${filePath} is missing "data" or "execute".`);
  }
}

const rest = new REST({ version: "10" }).setToken(discordToken);

(async () => {
  try {
    console.log(`Registering ${commands.length} global commands...`);
    const data = await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });
    console.log(`Successfully registered ${data.length} global commands.`);
  } catch (error) {
    console.error("Failed to register commands:", error);
  }
})();
