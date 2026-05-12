const ENDPOINTS = {
  CHAT: {
    HISTORY: "/History/GetChatHistory",
    DETAILS: "/History/GetChatDetails",
    SEND_MESSAGE: "/Chat/SendMessage",
    DELETE_CHAT: "/History/DeleteChat", // make sure this matches your backend route
  },
  AUTH: {
    LOGIN: "/Auth/login",
    REGISTER: "/Auth/register",
    GOOGLE_LOGIN: "/Auth/GoogleLogin"
  },
};

export default ENDPOINTS;
