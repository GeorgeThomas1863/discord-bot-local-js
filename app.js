import { Client } from "discord.js";
import { DISCORD_TOKEN2 } from "./config/bot.js";
import { handleMessage } from "./src/discord-bot.js";

const client = new Client({
  intents: ["Guilds", "GuildMembers", "GuildMessages", "MessageContent"],
});

client.on("ready", () => {
  console.log(`${client.user.tag} is now online!`);
});

client.on("messageCreate", (message) => handleMessage(message, client));

client.login(DISCORD_TOKEN2);
