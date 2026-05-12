// ChatService.js

import axios from "axios";

import BASE_URL from "./apiConfig";

import ENDPOINTS from "../utils/endpoints";

const ChatService = {
  // GET HISTORY
  getChatHistory: async (
    userId,
  ) => {
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

  // GET CHAT DETAILS
  getChatDetails: async (
    userId,
    chatId,
  ) => {
    try {
      const res = await axios.get(
        `${BASE_URL}${ENDPOINTS.CHAT.DETAILS}`,
        {
          params: {
            userId,
            chatId,
          },
          withCredentials: true,
        },
      );

      return res.data;
    } catch (err) {
      throw err;
    }
  },

  // SEND MESSAGE
  sendMessage: async (
    message,
    userId,
    chatId = null,
  ) => {
    try {
      const res = await axios.post(
        `${BASE_URL}${ENDPOINTS.CHAT.SEND_MESSAGE}`,
        {
          message,
          userId,
          chatId,
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

  // DELETE CHAT
  deleteChat: async (
    userId,
    chatId,
  ) => {
    try {
      const res = await axios.delete(
        `${BASE_URL}${ENDPOINTS.CHAT.DELETE_CHAT}`,
        {
          data: {
            userId,
            chatId,
          },
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