import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { GOOGLE_CLIENT_ID } from "./Services/apiConfig";

import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
</GoogleOAuthProvider>
  </React.StrictMode>,
);
