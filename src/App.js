import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Register from "./Components/Register";
import Login from "./Components/Login";
import Chat from "./Components/Chat";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
