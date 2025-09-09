import CONFIG from "../config/config.js";
import { sendToLocalAPI } from "./api.js";
import { startTyping, stopTyping, fixUsername } from "./util.js";

export const handleMessage = async (inputObj, client) => {
  const { author, content, channelId, channel, mentions } = inputObj;
  const { CHANNELS, PREFIX } = CONFIG;

  if (!CHANNELS.includes(channelId)) return null;
  if (author.bot) return null;

  const firstChar = content.trim().charAt(0);
  const botMention = mentions.users.has(client.user.id) || null;
  if (firstChar !== PREFIX && !botMention) return null;

  const typingInterval = startTyping(channel);

  try {
    const convoArray = await buildConvoArray(channel, client);
    // console.log("CONVO ARRAY");
    // console.log(convoArray);
    const messageLLM = await sendToLocalAPI(convoArray);

    // console.log("AI MESSAGE");
    // console.log(aiMessage);

    await sendChunkMessage(messageLLM, inputObj);
  } catch (error) {
    console.error("Error handling message:", error);
    await msgObj.reply("Sorry, I encountered an error processing your request.");
  } finally {
    stopTyping(typingInterval);
  }
};

export const buildConvoArray = async (channel, client) => {
  const { PREFIX, SYSTEM_PROMPT } = CONFIG;

  //set system prompt as first msg in array
  const convoArray = [SYSTEM_PROMPT];

  const prevMessages = await channel.messages.fetch({ limit: 10 });
  const messagesArray = Array.from(prevMessages.values()).reverse();

  for (let i = 0; i < messagesArray.length; i++) {
    const messageObj = messagesArray[i];
    const { author, content } = messageObj;

    if (author.id !== client.user.id && !content.startsWith(PREFIX)) continue;

    const username = await fixUsername(author.username);

    //FIX THIS HERE
    const role = author.id === client.user.id ? "assistant" : "user";
    const convoObj = {
      role: role,
      name: username,
      content: content,
    };

    convoArray.push(convoObj);
  }

  return convoArray;
};

//chunks the message into 2000 character chunks
export const sendChunkMessage = async (messageLLM, inputObj) => {
  const { CHUNK_SIZE_LIMIT } = CONFIG;

  for (let i = 0; i < messageLLM.length; i += CHUNK_SIZE_LIMIT) {
    const chunk = messageLLM.substring(i, i + CHUNK_SIZE_LIMIT);
    await inputObj.reply(chunk);
  }
};
