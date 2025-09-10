import CONFIG from "../config/config.js";
import { sendToLocalAPI, defineSystemPrompt } from "./api.js";
import { startTyping, stopTyping, fixUsername } from "./util.js";

export const handleMessage = async (inputObj, client) => {
  const { channel } = inputObj;

  console.log("INPUT OBJECT");
  console.log(inputObj);

  const msgIgnore = await checkMsgIgnore(inputObj, client);
  if (!msgIgnore) return null;

  const typingInterval = startTyping(channel);

  try {
    const convoArray = await buildConvoArray(channel, client);
    console.log("CONVO ARRAY");
    console.log(convoArray);

    const msgLLM = await sendToLocalAPI(convoArray);

    await sendMsgChunk(msgLLM, inputObj);
  } catch (error) {
    console.error("Error handling message:", error);
    await inputObj.reply("Sorry, I encountered an error processing your request.");
  } finally {
    stopTyping(typingInterval);
  }
};

//check if message should be ignored
export const checkMsgIgnore = async (inputObj, client) => {
  const { content, channelId, mentions } = inputObj;
  const { CHANNELS, PREFIX2 } = CONFIG;

  if (!CHANNELS.includes(channelId)) return null;
  // if (author.bot) return null;

  const firstChar = content.trim().charAt(0);
  const botMention = mentions.users.has(client.user.id) || null;
  if (firstChar !== PREFIX2 && !botMention) return null;

  //if all checks pass, return true
  return true;
};

export const buildConvoArray = async (channel, client) => {
  const { PREFIX2 } = CONFIG;

  //set system prompt as first msg in array
  const convoArray = await defineSystemPrompt();

  const prevMessages = await channel.messages.fetch({ limit: 10 });
  const messagesArray = Array.from(prevMessages.values()).reverse();

  for (let i = 0; i < messagesArray.length; i++) {
    const messageObj = messagesArray[i];
    const { author, content, createdTimestamp } = messageObj;

    //time check
    const timeCheck = Date.now() - 15 * 60 * 1000; // 15 min ago
    // const timeCheck = Date.now() - 1 * 60 * 1000; // 1 min ago
    if (createdTimestamp < timeCheck) continue;

    // console.log("MESSAGE OBJECT");
    // console.log(messageObj);

    //CHECK THIS IS RIGHT
    if (author.id !== client.user.id && !content.startsWith(PREFIX2)) continue;

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
export const sendMsgChunk = async (msg, inputObj) => {
  const { CHUNK_SIZE_LIMIT } = CONFIG;

  for (let i = 0; i < msg.length; i += CHUNK_SIZE_LIMIT) {
    const chunk = msg.substring(i, i + CHUNK_SIZE_LIMIT);
    await inputObj.reply("!" + chunk);
  }
};
