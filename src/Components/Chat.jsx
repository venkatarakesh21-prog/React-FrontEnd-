import React, { useState, useEffect, useRef, useCallback } from "react";
import "./Chat.css";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ChatService from "../Services/ChatService";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([]);
  const [history, setHistory] = useState([]);

  const chatEndRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const navigate = useNavigate();

  // Get User Details
  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName");
  const emailId = sessionStorage.getItem("emailId");
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await ChatService.getChatHistory(userId);
      setHistory(data || []);
    } catch (err) {
      console.error("History error:", err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadHistory();
    return () => clearInterval(typingIntervalRef.current);
  }, [userId, loadHistory]);

  const handleHistoryClick = async (title) => {
    setLoading(true);
    try {
      const messages = await ChatService.getChatDetails(userId, title);
      const formatted = messages.flatMap((msg) => [
        { type: "user", text: msg.requestMessage },
        { type: "ai", text: msg.responseMessage },
      ]);
      setChat(formatted);
    } catch (err) {
      setError("Failed to load conversation");
    } finally {
      setLoading(false);
    }
  };

  const typeMessage = (text) => {
    let index = 0;
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);

    setChat((prev) => {
      const updated = [...prev];
      const last = updated.length - 1;
      if (updated[last]?.type === "ai") updated[last].text = "";
      return updated;
    });

    typingIntervalRef.current = setInterval(() => {
      setChat((prev) => {
        const updated = [...prev];
        const last = updated.length - 1;
        if (updated[last]?.type === "ai") {
          updated[last].text = text.substring(0, index + 1);
        }
        return updated;
      });
      index++;
      if (index >= text.length) {
        clearInterval(typingIntervalRef.current);
        setLoading(false);
      }
    }, 20);
  };

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    const userMsg = message;
    const isFirst = chat.length === 0;

    setMessage("");
    setChat((prev) => [
      ...prev,
      { type: "user", text: userMsg },
      { type: "ai", text: "" },
    ]);
    setLoading(true);

    try {
      const res = await ChatService.sendMessage(userMsg, userId);
      typeMessage(res.response);
      if (isFirst) loadHistory();
    } catch (err) {
      setError("Error getting response");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="chat-container">
      <aside className="sidebar">
        <div className="user-profile-card">
  <div className="avatar user-icon">
    {userName ? userName.charAt(0).toUpperCase() : "U"}
  </div>
  <div className="user-info">
    <span className="username" title={userName}>{userName}</span>
    <span className="user-email" title={emailId}>{emailId}</span>
    <span className="status">● Online</span>
  </div>
</div>

        <button className="new-chat-btn" onClick={() => setChat([])}>
          + New Chat
        </button>

        <div className="history-list">
          <p className="history-label">Recent</p>
          {history.map((item, i) => (
            <div
              key={i}
              className="history-item"
              onClick={() => handleHistoryClick(item.requestMessage)}
            >
              <span>💬</span> {item.requestMessage}
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="chat-interface">
        <div className="chat-window">
          <div className="message-list">
            {chat.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.type}`}>
                <div className={`avatar ${msg.type === "user" ? "user-icon" : ""}`}>
                  {msg.type === "user" ? userName.charAt(0) : "AI"}
                </div>
                <div className="message-content">
                  <div className="sender-name">
                    {msg.type === "user" ? userName : "Assistant"}
                  </div>
                  <div className="message-text">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && chat[chat.length - 1]?.text === "" && (
              <div className="message-wrapper ai">
                <div className="avatar">AI</div>
                <div className="message-content">
                  <div className="sender-name">Assistant</div>
                  <div className="message-text">Thinking...</div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="input-area">
          <div className="input-container">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send-btn" onClick={handleSend} disabled={!message.trim()}>
              ↑
            </button>
          </div>
          {error && <p style={{color: 'red', textAlign: 'center', marginTop: '8px'}}>{error}</p>}
        </div>
      </main>
    </div>
  );
};

export default Chat;