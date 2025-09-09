import { OpenAI } from "openai";
import { OPENAI_KEY } from "../config/bot.js";

//NOT DONE
const openai = new OpenAI({
  baseURL: "http://127.0.0.1:1234",
  apiKey: OPENAI_KEY,
});

//SET CORRECT ENDPOINT HERE
export const sendToLocalAPI = async (inputArray) => {
  const params = {
    model: "gpt-4",
    messages: inputArray,
  };

  try {
    const res = await openai.chat.completions.create(params);
    const messageLLM = res.choices[0].message.content;
    // console.log("AI MESSAGE");
    // console.log(aiMessage);

    return messageLLM;
  } catch (e) {
    console.error("OpenAI API Error:", e.message);
    if (e.status === 429) return "SAM ALTMAN WANT HIS MONEY (George didn't pay his API bill)";
    throw new Error("Failed to get response from OpenAI");
  }
};
