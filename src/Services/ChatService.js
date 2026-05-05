import axios from "axios";
import BASE_URL from "./apiConfig";
import ENDPOINTS from "../utils/endpoints";

const ChatService = {
  getChatHistory: async (userId) => {
    const res = await axios.get(`${BASE_URL}${ENDPOINTS.CHAT.HISTORY}`, {
      params: { userId },
      withCredentials: true,
    });
    return res.data;
  },

  getChatDetails: async (userId, title) => {
    const res = await axios.get(`${BASE_URL}${ENDPOINTS.CHAT.DETAILS}`, {
      params: { userId, title },
      withCredentials: true,
    });
    return res.data;
  },

  // UPDATED: Added 'title' parameter to keep messages in the same conversation
  sendMessage: async (message, userId, title = null) => {
    const res = await axios.post(
      `${BASE_URL}${ENDPOINTS.CHAT.SEND_MESSAGE}`,
      {
        message,
        userid: userId,
        title: title, // This tells the backend which chat to update
      },
      { withCredentials: true },
    );
    return res.data;
  },

  deleteChat: async (userId, title) => {
    const res = await axios.delete(`${BASE_URL}${ENDPOINTS.CHAT.DELETE_CHAT}`, {
      data: { userId, title },
      withCredentials: true,
    });
    return res.data;
  },

  updateChatTitle: async (userId, oldTitle, newTitle) => {
    const res = await axios.put(
      `${BASE_URL}${ENDPOINTS.CHAT.UPDATE_TITLE}`,
      { userId, oldTitle, newTitle },
      { withCredentials: true },
    );
    return res.data;
  },

  updateMessage: async (userId, chatTitle, messageIndex, newMessage) => {
    const res = await axios.put(
      `${BASE_URL}${ENDPOINTS.CHAT.UPDATE_MESSAGE}`,
      { userId, chatTitle, messageIndex, newMessage },
      { withCredentials: true },
    );
    return res.data;
  },
};

export default ChatService;
