const openai = new OpenAI({
  apiKey: OPENAI_KEY,
});

export const sendToLocalAPI = async (inputArray) => {
  const params = {
    model: "gpt-4",
    messages: inputArray,
  };

  try {
    const res = await openai.chat.completions.create(params);
    const aiMessage = res.choices[0].message.content;
    // console.log("AI MESSAGE");
    // console.log(aiMessage);

    return aiMessage;
  } catch (e) {
    console.error("OpenAI API Error:", e.message);
    if (e.status === 429) return "SAM ALTMAN WANT HIS MONEY (George didn't pay his API bill)";
    throw new Error("Failed to get response from OpenAI");
  }
};
