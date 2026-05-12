// Chat.jsx

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
  const [message, setMessage] =
    useState("");

  const [chat, setChat] =
    useState([]);

  const [history, setHistory] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [activeChat, setActiveChat] =
    useState(null);

  const [anchorEl, setAnchorEl] =
    useState(null);

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [showDeletePopup, setShowDeletePopup] =
    useState(false);

  const [itemToDelete, setItemToDelete] =
    useState(null);

  const chatEndRef = useRef(null);

  const typingIntervalRef =
    useRef(null);

  const navigate = useNavigate();

  const userId =
    sessionStorage.getItem("userId");

  const userName =
    sessionStorage.getItem("userName");

  // AUTO SCROLL
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat]);

  // LOAD HISTORY
  const loadHistory = useCallback(
    async () => {
      try {
        const data =
          await ChatService.getChatHistory(
            userId,
          );

        setHistory(data || []);
      } catch (err) {
        console.error(err);

        const backendError =
          err?.response?.data?.message ||
          "Failed to load history";

        setError(backendError);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (userId) {
      loadHistory();
    }

    return () => {
      clearInterval(
        typingIntervalRef.current,
      );
    };
  }, [userId, loadHistory]);

  // LOAD CHAT DETAILS
  const handleHistoryClick =
    async (item) => {
      try {
        setError("");

        setActiveChat(item.chatId);

        const messages =
          await ChatService.getChatDetails(
            userId,
            item.chatId,
          );

        const formatted =
          messages.flatMap((msg) => [
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
          err?.response?.data?.message ||
          "Failed to load conversation";

        setError(backendError);
      }
    };

  // SEND MESSAGE
  const handleSend = async () => {
    if (!message.trim() || loading)
      return;

    const userMsg = message;

    setMessage("");
    setError("");

    const currentChatId =
      activeChat;

    console.log(
      "ACTIVE CHAT ID:",
      currentChatId,
    );

    // ADD USER MESSAGE
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
          currentChatId,
        );

      // SET NEW CHAT ID
      if (
        !currentChatId &&
        res.chatId
      ) {
        setActiveChat(res.chatId);
      }

      // TYPE AI RESPONSE
      typeMessage(res.response);

      // REFRESH HISTORY
      await loadHistory();
    } catch (err) {
      console.error(err);

      let backendError =
        err?.response?.data?.message ||
        err?.response?.data
          ?.response ||
        err?.message ||
        "Something went wrong";

      if (
        backendError.includes(
          "User location is not supported",
        )
      ) {
        backendError =
          "Service unavailable in your region.";
      }

      // REMOVE EMPTY AI MESSAGE
      setChat((prev) =>
        prev.slice(0, prev.length - 1),
      );

      setError(backendError);

      setLoading(false);
    }
  };

  // TYPING EFFECT
  const typeMessage = (text) => {
    let i = 0;

    clearInterval(
      typingIntervalRef.current,
    );

    typingIntervalRef.current =
      setInterval(() => {
        setChat((prev) => {
          const updated = [...prev];

          updated[
            updated.length - 1
          ].text = text.substring(
            0,
            i + 1,
          );

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
    item,
  ) => {
    setAnchorEl(event.currentTarget);

    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);

    setSelectedItem(null);
  };

  // DELETE
  const initiateDelete = (item) => {
    setItemToDelete(item);

    setShowDeletePopup(true);

    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      await ChatService.deleteChat(
        userId,
        itemToDelete.chatId,
      );

      const updated =
        history.filter(
          (chatItem) =>
            chatItem.chatId !==
            itemToDelete.chatId,
        );

      setHistory(updated);

      if (
        activeChat ===
        itemToDelete.chatId
      ) {
        setChat([]);

        setActiveChat(null);
      }

      setShowDeletePopup(false);
    } catch (err) {
      console.error(err);

      const backendError =
        err?.response?.data?.message ||
        "Delete failed";

      setError(backendError);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        bgcolor: "#edf2f7",
      }}
    >
      {/* SIDEBAR */}
      <Box
        sx={{
          width: 250,
          bgcolor: "#fff",
          borderRight:
            "1px solid #dbe4f0",
          display: "flex",
          flexDirection: "column",
          p: 2,
        }}
      >
        {/* PROFILE */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            bgcolor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 2,
          }}
        >
          <Avatar
            sx={{
              width: 52,
              height: 52,
              bgcolor: "#7c3aed",
            }}
          >
            {userName
              ?.charAt(0)
              .toUpperCase()}
          </Avatar>

          <Box>
            <Typography
              sx={{
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              sx={{
                fontWeight: 700,
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
            setError("");
          }}
          sx={{
            py: 1.4,
            borderRadius: 4,
            mb: 3,
            background:
              "linear-gradient(135deg,#7c3aed,#2563eb)",
            color: "#fff",
          }}
        >
          New Chat
        </Button>

        {/* HISTORY */}
        <Typography
          sx={{
            mb: 2,
            fontWeight: 700,
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
          {history.map((item) => (
            <Paper
              key={item.chatId}
              elevation={0}
              onClick={() =>
                handleHistoryClick(item)
              }
              sx={{
                p: 1.5,
                mb: 1,
                borderRadius: 3,
                cursor: "pointer",
                bgcolor:
                  activeChat ===
                  item.chatId
                    ? "#eef2ff"
                    : "#fff",
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
                    overflow: "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace: "nowrap",
                    width: "80%",
                  }}
                >
                  {item.requestMessage}
                </Typography>

                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();

                    handleMenuOpen(
                      e,
                      item,
                    );
                  }}
                >
                  <MoreVertRounded fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* LOGOUT */}
        <Button
          startIcon={<LogoutRounded />}
          onClick={() => {
            sessionStorage.clear();

            navigate("/");
          }}
          sx={{
            py: 1.2,
            borderRadius: 3,
            bgcolor: "#ef4444",
            color: "#fff",
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
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            px: 4,
            py: 2,
            bgcolor: "#fff",
            borderBottom:
              "1px solid #dbe4f0",
          }}
        >
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            Gemini AI
          </Typography>
        </Box>

        {/* CHAT BODY */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 4,
            py: 3,
          }}
        >
          {chat.length === 0 ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <Typography
                sx={{
                  fontSize: 32,
                  fontWeight: 800,
                }}
              >
                Hello, {userName}
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                }}
              >
                Start chatting...
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
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    maxWidth: "65%",
                    bgcolor:
                      msg.type === "user"
                        ? "#2563eb"
                        : "#fff",
                    color:
                      msg.type === "user"
                        ? "#fff"
                        : "#111827",
                  }}
                >
                  <ReactMarkdown>
                    {msg.text}
                  </ReactMarkdown>
                </Paper>
              </Box>
            ))
          )}

          <div ref={chatEndRef} />
        </Box>

        {/* INPUT */}
        <Box
          sx={{
            p: 2,
            bgcolor: "#fff",
            borderTop:
              "1px solid #dbe4f0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              placeholder="Type message..."
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value,
                )
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter"
                ) {
                  handleSend();
                }
              }}
            />

            <Button
              onClick={handleSend}
              disabled={loading}
              sx={{
                minWidth: 52,
                borderRadius: 3,
                background:
                  "linear-gradient(135deg,#7c3aed,#2563eb)",
                color: "#fff",
              }}
            >
              {loading ? (
                <CircularProgress
                  size={22}
                  sx={{
                    color: "#fff",
                  }}
                />
              ) : (
                <SendRounded />
              )}
            </Button>
          </Box>

          {error && (
            <Typography
              sx={{
                color: "red",
                mt: 1,
                fontSize: 13,
              }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </Box>

      {/* MENU */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() =>
            initiateDelete(
              selectedItem,
            )
          }
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