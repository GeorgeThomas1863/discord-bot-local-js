import CONFIG from "../config/config.js";

export const fixUsername = async (username) => {
  return username.replace(/\s+/g, "_").replace(/[^\w\s]/gi, "");
};

export const startTyping = (channel) => {
  const { TYPING_INTERVAL } = CONFIG;

  channel.sendTyping();
  return setInterval(() => {
    channel.sendTyping();
  }, TYPING_INTERVAL);
};

export const stopTyping = (typingInterval) => {
  clearInterval(typingInterval);
};
