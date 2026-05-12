import React from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Register from "./Components/Register";
import Login from "./Components/Login";
import Chat from "./Components/Chat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* REGISTER */}
        <Route
          path="/"
          element={<Register />}
        />

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* CHAT */}
        <Route
          path="/chat"
          element={<Chat />}
        />

        {/* CHAT WITH CHAT ID */}
        <Route
          path="/chat/:chatId"
          element={<Chat />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;