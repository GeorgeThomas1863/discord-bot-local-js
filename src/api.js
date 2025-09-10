import { OpenAI } from "openai";
import { sendMsgChunk } from "./discord-bot.js";

//NOT DONE
const client = new OpenAI({
  baseURL: "http://127.0.0.1:1234/v1",
  apiKey: "allahuakbar",
});

//SET CORRECT ENDPOINT HERE
export const sendToLocalAPI = async (inputArray) => {
  const params = {
    model: "deepseek/deepseek-r1-0528-qwen3-8b",
    messages: inputArray,
    temperature: 0.5,
    top_p: 0.95,
    max_tokens: 10000,
    stream: false, // no point in stream bc only 1 discord response
  };

  try {
    const res = await client.chat.completions.create(params);
    const msgLLM = res.choices[0].message.content;

    console.log("--------------------------------");
    console.log("BOT MESSAGE");
    console.log(msgLLM);

    return msgLLM;
  } catch (e) {
    console.error("OpenAI API Error:", e.message);
    if (e.status === 429) return "SAM ALTMAN WANT HIS MONEY (George didn't pay his API bill)";
    throw new Error("Failed to get response from OpenAI");
  }
};

export const defineSystemPrompt = async () => {
  const systemPrompt = [
    {
      role: "system",
      content:
        "You are a helpful, friendly, and clever assistant. Please provide a response to the following message or messages. Please review all of the content provided and respond with a detailed and CONCISE reply.",
    },
  ];

  return systemPrompt;
};
