import axios from "axios";
import BASE_URL from "./apiConfig";
import ENDPOINTS from "../utils/endpoints";

const ChatService = {
  getChatHistory: async (userId) => {
    const res = await axios.get(`${BASE_URL}${ENDPOINTS.CHAT.HISTORY}`, {
      params: { userId: userId }, // Wrap in 'params'
    });
    return res.data;
  },

  getChatDetails: async (userId, title) => {
    const res = await axios.get(`${BASE_URL}${ENDPOINTS.CHAT.DETAILS}`, {
      params: {
        userId: userId,
        title: title,
      },
    });
    return res.data;
  },
  sendMessage: async (message, userId) => {
    const res = await axios.post(`${BASE_URL}${ENDPOINTS.CHAT.SEND_MESSAGE}`, {
      message,
      userid: userId,
    });
    return res.data;
  },
};

export default ChatService;
