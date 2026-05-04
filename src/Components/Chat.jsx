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

  const userId = sessionStorage.getItem("userId");

  // =============================
  // Auto scroll to bottom
  // =============================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // =============================
  // Load history (FIXED ESLINT WARNING)
  // =============================
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

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [userId, loadHistory]);

  // =============================
  // Load chat from history
  // =============================
  const handleHistoryClick = async (title) => {
    setLoading(true);
    setError("");

    try {
      const messages = await ChatService.getChatDetails(userId, title);

      const formatted = messages.flatMap((msg) => [
        { type: "user", text: msg.requestMessage },
        { type: "ai", text: msg.responseMessage },
      ]);

      setChat(formatted);
    } catch (err) {
      setError("Failed to load chat details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =============================
  // FIXED typing animation (NO missing letters)
  // =============================
  const typeMessage = (text) => {
    let index = 0;

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    // reset AI message first
    setChat((prev) => {
      const updated = [...prev];
      const last = updated.length - 1;

      if (updated[last]?.type === "ai") {
        updated[last] = { ...updated[last], text: "" };
      }

      return updated;
    });

    typingIntervalRef.current = setInterval(() => {
      setChat((prev) => {
        const updated = [...prev];
        const last = updated.length - 1;

        if (updated[last]?.type === "ai") {
          updated[last] = {
            ...updated[last],
            text: text.substring(0, index + 1), // ✅ FIXED (no missing chars)
          };
        }

        return updated;
      });

      index++;

      if (index >= text.length) {
        clearInterval(typingIntervalRef.current);
        setLoading(false);
      }
    }, 15);
  };

  // =============================
  // Send message
  // =============================
  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message;
    const isFirst = chat.length === 0;

    setMessage("");
    setError("");

    setChat((prev) => [
      ...prev,
      { type: "user", text: userMessage },
      { type: "ai", text: "" },
    ]);

    setLoading(true);

    try {
      const res = await ChatService.sendMessage(userMessage, userId);

      typeMessage(res.response);

      if (isFirst) {
        loadHistory();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to get response");
      setLoading(false);
    }
  };

  // =============================
  // New chat
  // =============================
  const handleNewChat = () => {
    setChat([]);
    setError("");
  };

  // =============================
  // Logout
  // =============================
  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="chat-container">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={handleNewChat}>
          + New Chat
        </button>

        <div className="history-list">
          <p className="history-label">Recent</p>

          {history.map((item, i) => (
            <div
              key={item.id || i}
              className="history-item"
              onClick={() => handleHistoryClick(item.requestMessage)}
            >
              💬 {item.requestMessage}
            </div>
          ))}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      {/* CHAT AREA */}
      <main className="chat-interface">
        <div className="chat-window">
          <div className="message-list">
            {chat.map((msg, i) => (
              <div key={i} className={`message-wrapper ${msg.type}`}>
                <div className="avatar">{msg.type === "user" ? "U" : "AI"}</div>

                <div className="message-content">
                  <div className="sender-name">
                    {msg.type === "user" ? "You" : "Assistant"}
                  </div>

                  <div className="message-text">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && chat[chat.length - 1]?.text === "" && (
              <div className="message-wrapper ai">
                <div className="avatar">AI</div>
                <div className="message-content">
                  <div className="typing">Typing...</div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="input-area">
          <div className="input-container">
            <input
              type="text"
              placeholder="Message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={loading || !message.trim()}
            >
              ↑
            </button>
          </div>

          <p className="disclaimer">
            AI can make mistakes. Verify important info.
          </p>

          {error && <p className="error-text">{error}</p>}
        </div>
      </main>
    </div>
  );
};
// {}
export default Chat;
