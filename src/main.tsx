import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/index.css";
import App from "./App.tsx";
import { Toast } from "./Toast.tsx"
import { Spreadsheet } from "./Spreadsheet.tsx"
 
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toast />
    <Spreadsheet />
  </StrictMode>
);
