import { OpenAI } from "openai";
import { sendMsgChunk } from "./discord-bot.js";

//NOT DONE
const client = new OpenAI({
  baseURL: "http://127.0.0.1:1234/v1",
  apiKey: "allahuakbar",
});

//SET CORRECT ENDPOINT HERE
export const sendToLocalStreamAPI = async (inputArray, inputObj) => {
  const params = {
    model: "deepseek/deepseek-r1-0528-qwen3-8b",
    messages: inputArray,
    stream: true,
    temperature: 0.5,
    top_p: 0.95,
    max_tokens: 4000,
  };

  try {
    const stream = await client.chat.completions.create(params);

    let fullMsg = "";
    for await (const chunk of stream) {
      const msg = chunk.choices[0]?.delta?.content || "";
      console.log("--------------------------------");
      console.log(msg);
      if (!msg) continue;
      //write this shit here
      await sendMsgChunk(msg, inputObj);
      fullMsg += msg;
    }

    // const messageLLM = res.choices[0].message.content;
    // console.log("AI MESSAGE");
    // console.log(aiMessage);

    return fullMsg;
  } catch (e) {
    console.error("OpenAI API Error:", e.message);
    if (e.status === 429) return "SAM ALTMAN WANT HIS MONEY (George didn't pay his API bill)";
    throw new Error("Failed to get response from OpenAI");
  }
};
