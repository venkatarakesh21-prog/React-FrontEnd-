import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Avatar,
  Paper,
  CircularProgress,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
} from "@mui/material";

import {
  SendRounded,
  AddRounded,
  MoreVertRounded,
  LogoutRounded,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import ChatService from "../Services/ChatService";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] =
    useState(null);

  const [anchorEl, setAnchorEl] =
    useState(null);

  const [selectedIndex, setSelectedIndex] =
    useState(null);

  const [showDeletePopup, setShowDeletePopup] =
    useState(false);

  const [itemToDelete, setItemToDelete] =
    useState({
      title: "",
      index: null,
    });

  const chatEndRef = useRef(null);
  const typingIntervalRef = useRef(null);

  const navigate = useNavigate();

  const userId = sessionStorage.getItem("userId");

  const userName =
    sessionStorage.getItem("userName");

  // AUTO SCROLL
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat]);

  // LOAD HISTORY
  const loadHistory = useCallback(async () => {
    try {
      const data =
        await ChatService.getChatHistory(
          userId,
        );

      setHistory(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadHistory();
    }

    return () => {
      clearInterval(typingIntervalRef.current);
    };
  }, [userId, loadHistory]);

  // LOAD CHAT
  const handleHistoryClick = async (
    title,
    index,
  ) => {
    setActiveChat(index);

    try {
      const messages =
        await ChatService.getChatDetails(
          userId,
          title,
        );

      const formatted = messages.flatMap(
        (msg) => [
          {
            type: "user",
            text: msg.requestMessage,
          },
          {
            type: "ai",
            text: msg.responseMessage,
          },
        ],
      );

      setChat(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  // SEND MESSAGE
  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMsg = message;

    setMessage("");

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

      const updatedHistory =
        await ChatService.getChatHistory(
          userId,
        );

      setHistory(updatedHistory || []);
    } catch (err) {
      console.error(err);

      setLoading(false);
    }
  };

  // TYPING EFFECT
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
    }, 15);
  };

  // MENU
  const handleMenuOpen = (
    event,
    index,
  ) => {
    setAnchorEl(event.currentTarget);

    setSelectedIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);

    setSelectedIndex(null);
  };

  // DELETE
  const initiateDelete = (title, index) => {
    setItemToDelete({ title, index });

    setShowDeletePopup(true);

    handleMenuClose();
  };

  const confirmDelete = async () => {
    const { title, index } = itemToDelete;

    try {
      await ChatService.deleteChat(
        userId,
        title,
      );

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
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        bgcolor: "#f4f7fb",
        overflow: "hidden",
      }}
    >
      {/* SIDEBAR */}
      <Box
        sx={{
          width: 240,
          bgcolor: "#ffffff",
          borderRight:
            "1px solid #dbe4f0",
          display: "flex",
          flexDirection: "column",
          p: 1.5,
        }}
      >
        {/* PROFILE */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 2,
            border: "1px solid #e2e8f0",
          }}
        >
          <Avatar
            sx={{
              width: 42,
              height: 42,
              bgcolor: "#7c3aed",
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            {userName
              ?.charAt(0)
              .toUpperCase()}
          </Avatar>

          <Box>
            <Typography
              sx={{
                color: "#64748b",
                fontSize: 11,
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              sx={{
                color: "#111827",
                fontWeight: 700,
                fontSize: 15,
                lineHeight: 1.2,
              }}
            >
              {userName}
            </Typography>
          </Box>
        </Paper>

        {/* NEW CHAT */}
        <Button
          fullWidth
          startIcon={<AddRounded />}
          onClick={() => {
            setChat([]);
            setActiveChat(null);
          }}
          sx={{
            py: 1.2,
            borderRadius: 3,
            background:
              "linear-gradient(135deg,#7c3aed,#2563eb)",
            color: "#fff",
            textTransform: "none",
            fontWeight: 700,
            fontSize: 14,
            mb: 2,

            "&:hover": {
              opacity: 0.95,
            },
          }}
        >
          New Chat
        </Button>

        {/* HISTORY */}
        <Typography
          sx={{
            color: "#64748b",
            fontWeight: 700,
            mb: 1.5,
            fontSize: 14,
          }}
        >
          Recent Chats
        </Typography>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {history.map((item, i) => (
            <Paper
              key={i}
              elevation={0}
              onClick={() =>
                handleHistoryClick(
                  item.requestMessage,
                  i,
                )
              }
              sx={{
                p: 1.4,
                mb: 1,
                borderRadius: 3,
                cursor: "pointer",
                bgcolor:
                  activeChat === i
                    ? "#eef2ff"
                    : "#ffffff",

                border:
                  activeChat === i
                    ? "1px solid #2563eb"
                    : "1px solid #e2e8f0",

                "&:hover": {
                  bgcolor: "#f8fafc",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    color: "#111827",
                    overflow: "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace: "nowrap",
                    width: "80%",
                    fontWeight: 500,
                    fontSize: 14,
                  }}
                >
                  {item.requestMessage}
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();

                    handleMenuOpen(e, i);
                  }}
                  sx={{
                    color: "#64748b",
                  }}
                >
                  <MoreVertRounded fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>

        <Divider
          sx={{
            borderColor: "#e2e8f0",
            my: 1.5,
          }}
        />

        {/* LOGOUT */}
        <Button
          startIcon={<LogoutRounded />}
          onClick={() => {
            sessionStorage.clear();

            navigate("/");
          }}
          sx={{
            py: 1.1,
            borderRadius: 3,
            bgcolor: "#ef4444",
            color: "#fff",
            textTransform: "none",
            fontWeight: 700,
            fontSize: 14,

            "&:hover": {
              bgcolor: "#dc2626",
            },
          }}
        >
          Logout
        </Button>
      </Box>

      {/* CHAT AREA */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f4f7fb",
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            px: 3,
            py: 1.8,
            borderBottom:
              "1px solid #dbe4f0",
            bgcolor: "#ffffff",
          }}
        >
          <Typography
            sx={{
              color: "#111827",
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            Gemini AI
          </Typography>
        </Box>

        {/* MESSAGES */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            py: 2,
          }}
        >
          {chat.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Typography
                sx={{
                  color: "#111827",
                  fontSize: 28,
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                Hello, {userName}
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                Start chatting with Gemini
              </Typography>
            </Box>
          ) : (
            chat.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.type === "user"
                      ? "flex-end"
                      : "flex-start",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection:
                      msg.type === "user"
                        ? "row-reverse"
                        : "row",
                    alignItems: "flex-end",
                    gap: 1,
                    maxWidth: "55%",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      fontSize: 18,
                      bgcolor:
                        msg.type === "user"
                          ? "#2563eb"
                          : "#7c3aed",
                    }}
                  >
                    {msg.type === "user"
                      ? userName
                          ?.charAt(0)
                          .toUpperCase()
                      : "G"}
                  </Avatar>

                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.8,
                      py: 1.2,
                      borderRadius: 4,
                      bgcolor:
                        msg.type === "user"
                          ? "#2563eb"
                          : "#ffffff",

                      color:
                        msg.type === "user"
                          ? "#ffffff"
                          : "#111827",

                      fontSize: 14,
                      lineHeight: 1.6,

                      border:
                        "1px solid #e2e8f0",

                      wordBreak: "break-word",
                    }}
                  >
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </Paper>
                </Box>
              </Box>
            ))
          )}

          <div ref={chatEndRef} />
        </Box>

        {/* INPUT AREA */}
        <Box
          sx={{
            p: 2,
            borderTop:
              "1px solid #dbe4f0",
            bgcolor: "#ffffff",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) =>
                e.key === "Enter" &&
                handleSend()
              }
              variant="outlined"
              autoComplete="off"
              InputProps={{
                sx: {
                  backgroundColor:
                    "#ffffff",

                  borderRadius: "14px",

                  "& input": {
                    color: "#111827",
                    fontSize: "14px",
                    fontWeight: 500,
                    caretColor: "#111827",
                    padding: "12px",
                  },

                  "& input::placeholder": {
                    color: "#94a3b8",
                    opacity: 1,
                  },

                  "& fieldset": {
                    border:
                      "1px solid #dbe4f0",
                  },

                  "&:hover fieldset": {
                    border:
                      "1px solid #2563eb",
                  },

                  "&.Mui-focused fieldset":
                    {
                      border:
                        "1px solid #2563eb",
                    },
                },
              }}
            />

            <Button
              onClick={handleSend}
              disabled={loading}
              sx={{
                minWidth: 50,
                width: 50,
                height: 50,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg,#7c3aed,#2563eb)",
                color: "#fff",

                "&:hover": {
                  opacity: 0.95,
                },
              }}
            >
              {loading ? (
                <CircularProgress
                  size={20}
                  sx={{
                    color: "#fff",
                  }}
                />
              ) : (
                <SendRounded fontSize="small" />
              )}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const item =
              history[selectedIndex];

            initiateDelete(
              item.requestMessage,
              selectedIndex,
            );
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* DELETE DIALOG */}
      <Dialog
        open={showDeletePopup}
        onClose={() =>
          setShowDeletePopup(false)
        }
      >
        <DialogTitle>
          Delete Chat?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            This conversation will be
            permanently deleted.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setShowDeletePopup(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Chat;