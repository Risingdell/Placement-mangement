import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { StudentProvider } from "./context/StudentContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <StudentProvider>
        <App />
      </StudentProvider>
    </AuthProvider>
  </React.StrictMode>
);
