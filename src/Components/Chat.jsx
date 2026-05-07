import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

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
  const [activeChat, setActiveChat] = useState(null);

  // Menu & Edit States
  const [menuOpen, setMenuOpen] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editText, setEditText] = useState("");

  // Delete Popup
  const [showDeletePopup, setShowDeletePopup] =
    useState(false);

  const [itemToDelete, setItemToDelete] = useState({
    title: "",
    index: null,
  });

  const chatEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const navigate = useNavigate();

  const userId = sessionStorage.getItem("userId");
  const userName = sessionStorage.getItem("userName");

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat]);

  // Load history
  const loadHistory = useCallback(async () => {
    try {
      const data =
        await ChatService.getChatHistory(userId);

      setHistory(data || []);
    } catch (err) {
      console.error(err);

      const backendError =
        err?.response?.data?.response ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load history";

      setError(backendError);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadHistory();
    }

    const handleClickOutside = () => {
      setMenuOpen(null);
    };

    window.addEventListener(
      "click",
      handleClickOutside,
    );

    return () => {
      clearInterval(typingIntervalRef.current);

      window.removeEventListener(
        "click",
        handleClickOutside,
      );
    };
  }, [userId, loadHistory]);

  // Load selected chat
  const handleHistoryClick = async (
    title,
    index,
  ) => {
    setActiveChat(index);
    setLoading(true);
    setError("");

    try {
      const messages =
        await ChatService.getChatDetails(
          userId,
          title,
        );

      const formatted = messages.flatMap((msg) => [
        {
          type: "user",
          text: msg.requestMessage,
        },
        {
          type: "ai",
          text: msg.responseMessage,
        },
      ]);

      setChat(formatted);
    } catch (err) {
      console.error(err);

      const backendError =
        err?.response?.data?.response ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load conversation";

      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  // Delete popup
  const initiateDelete = (title, index) => {
    setItemToDelete({ title, index });
    setShowDeletePopup(true);
    setMenuOpen(null);
  };

  // Confirm delete
  const confirmDelete = async () => {
    const { title, index } = itemToDelete;

    try {
      await ChatService.deleteChat(userId, title);

      const updated = history.filter(
        (_, i) => i !== index,
      );

      setHistory(updated);

      if (activeChat === index) {
        setChat([]);
        setActiveChat(null);
      }

      setShowDeletePopup(false);
    } catch (err) {
      console.error(err);

      const backendError =
        err?.response?.data?.response ||
        err?.response?.data?.message ||
        err?.message ||
        "Delete failed";

      setError(backendError);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message;

    setMessage("");
    setError("");

    let currentChatTitle = null;

    if (
      activeChat !== null &&
      history[activeChat]
    ) {
      currentChatTitle =
        history[activeChat].requestMessage;
    } else if (chat.length > 0) {
      currentChatTitle = chat[0].text;
    }

    // Show user message immediately
    setChat((prev) => [
      ...prev,
      {
        type: "user",
        text: userMsg,
      },
      {
        type: "ai",
        text: "",
      },
    ]);

    setLoading(true);

    try {
      const res =
        await ChatService.sendMessage(
          userMsg,
          userId,
          currentChatTitle,
        );

      typeMessage(res.response);

      // Refresh history
      const updatedHistory =
        await ChatService.getChatHistory(userId);

      setHistory(updatedHistory || []);

      // Activate new chat
      if (activeChat === null) {
        const newIndex =
          updatedHistory.findIndex(
            (h) =>
              h.requestMessage ===
              (currentChatTitle || userMsg),
          );

        if (newIndex !== -1) {
          setActiveChat(newIndex);
        }
      }
    } catch (err) {
      console.error("Backend Error:", err);

      const backendError =
        err?.response?.data?.response ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";

      // Remove empty AI message
      setChat((prev) => prev.slice(0, -1));

      // Show backend error in chat
      setChat((prev) => [
        ...prev,
        {
          type: "ai",
          text: `❌ ${backendError}`,
        },
      ]);

      setError(backendError);

      setLoading(false);
    }
  };

  // Typing effect
  const typeMessage = (text) => {
    let i = 0;

    clearInterval(typingIntervalRef.current);

    typingIntervalRef.current = setInterval(() => {
      setChat((prev) => {
        const updated = [...prev];

        updated[updated.length - 1].text =
          text.substring(0, i + 1);

        return updated;
      });

      i++;

      if (i >= text.length) {
        clearInterval(
          typingIntervalRef.current,
        );

        setLoading(false);
      }
    }, 20);
  };

  return (
    <div className="chat-container">
      {showDeletePopup && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowDeletePopup(false)
          }
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h3>Delete chat?</h3>

            <p>
              This will delete
              <b>
                {" "}
                "{itemToDelete.title}"
              </b>
              . This action cannot be undone.
            </p>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() =>
                  setShowDeletePopup(false)
                }
              >
                Cancel
              </button>

              <button
                className="danger-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="sidebar">
        <div className="user-profile">
          <div className="user-avatar">
            {userName
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <span className="username-text">
            {userName}
          </span>
        </div>

        <button
          className="new-chat-btn"
          onClick={() => {
            setChat([]);
            setActiveChat(null);
          }}
        >
          + New Chat
        </button>

        <div className="history-list">
          <p className="history-label">
            Recent Chats
          </p>

          {history.map((item, i) => (
            <div
              key={i}
              className={`history-item ${
                activeChat === i
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                handleHistoryClick(
                  item.requestMessage,
                  i,
                )
              }
            >
              <div className="history-text">
                {editIndex === i ? (
                  <input
                    className="edit-input"
                    value={editText}
                    onChange={(e) =>
                      setEditText(
                        e.target.value,
                      )
                    }
                    onBlur={() =>
                      setEditIndex(null)
                    }
                    autoFocus
                  />
                ) : (
                  <span>
                    {item.requestMessage}
                  </span>
                )}
              </div>

              <div className="menu-container">
                <button
                  className="three-dots"
                  onClick={(e) => {
                    e.stopPropagation();

                    setMenuOpen(
                      menuOpen === i
                        ? null
                        : i,
                    );
                  }}
                >
                  ⋮
                </button>

                {menuOpen === i && (
                  <div className="popup-menu">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        setEditIndex(i);

                        setEditText(
                          item.requestMessage,
                        );

                        setMenuOpen(null);
                      }}
                    >
                      Rename
                    </button>

                    <button
                      className="delete-opt"
                      onClick={(e) => {
                        e.stopPropagation();

                        initiateDelete(
                          item.requestMessage,
                          i,
                        );
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            sessionStorage.clear();
            navigate("/");
          }}
        >
          Logout
        </button>
      </aside>

      <main className="chat-interface">
        <div className="chat-window">
          <div className="message-list">
            {chat.length === 0 && (
              <div className="empty-chat">
                <h2>
                  How can I help you today,
                  {userName}?
                </h2>
              </div>
            )}

            {chat.map((msg, i) => (
              <div
                key={i}
                className={`message-wrapper ${msg.type}`}
              >
                <div
                  className={`avatar ${
                    msg.type === "user"
                      ? "user-icon"
                      : "ai-icon"
                  }`}
                >
                  {msg.type === "user"
                    ? userName
                        ?.charAt(0)
                        .toUpperCase()
                    : "G"}
                </div>

                <div className="message-content">
                  <p className="sender-name">
                    {msg.type === "user"
                      ? userName
                      : "Gemini"}
                  </p>

                  <div className="message-text">
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            <div ref={chatEndRef} />
          </div>
        </div>

        <footer className="input-area">
          <div className="input-container">
            <input
              placeholder="Message Gemini..."
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value,
                )
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleSend()
              }
            />

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={loading}
            >
              ↑
            </button>
          </div>

          {error && (
            <p className="error-text">
              {error}
            </p>
          )}
        </footer>
      </main>
    </div>
  );
};

export default Chat;