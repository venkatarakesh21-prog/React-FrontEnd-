import axios from "axios";
import BASE_URL from "./apiConfig";
import ENDPOINTS from "../utils/endpoints";

const ChatService = {
  getChatHistory: async (userId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}${ENDPOINTS.CHAT.HISTORY}`,
        {
          params: { userId },
          withCredentials: true,
        },
      );

      return res.data;
    } catch (err) {
      throw err;
    }
  },

  getChatDetails: async (userId, title) => {
    try {
      const res = await axios.get(
        `${BASE_URL}${ENDPOINTS.CHAT.DETAILS}`,
        {
          params: { userId, title },
          withCredentials: true,
        },
      );

      return res.data;
    } catch (err) {
      throw err;
    }
  },

  sendMessage: async (message, userId, title = null) => {
    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.CHAT.SEND_MESSAGE}`,
        {
          message,
          userId,
          title,
        },
        {
          withCredentials: true,
        },
      );

      return res.data;
    } catch (err) {
      throw err;
    }
  },

  deleteChat: async (userId, title) => {
    try {
      const res = await axios.delete(
        `${BASE_URL}${ENDPOINTS.CHAT.DELETE_CHAT}`,
        {
          data: { userId, title },
          withCredentials: true,
        },
      );

      return res.data;
    } catch (err) {
      throw err;
    }
  },

  updateChatTitle: async (userId, oldTitle, newTitle) => {
    try {
      const res = await axios.put(
        `${BASE_URL}${ENDPOINTS.CHAT.UPDATE_TITLE}`,
        {
          userId,
          oldTitle,
          newTitle,
        },
        {
          withCredentials: true,
        },
      );

      return res.data;
    } catch (err) {
      throw err;
    }
  },

  updateMessage: async (
    userId,
    chatTitle,
    messageIndex,
    newMessage,
  ) => {
    try {
      const res = await axios.put(
        `${BASE_URL}${ENDPOINTS.CHAT.UPDATE_MESSAGE}`,
        {
          userId,
          chatTitle,
          messageIndex,
          newMessage,
        },
        {
          withCredentials: true,
        },
      );

      return res.data;
    } catch (err) {
      throw err;
    }
  },
};

export default ChatService;