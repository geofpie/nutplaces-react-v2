import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { I18nProvider } from "@react-aria/i18n";
import App from "./App.jsx";
import "./styles.css";

const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const syncThemeClass = (event) => {
  const prefersDark = event?.matches ?? mediaQuery.matches;
  document.documentElement.classList.toggle("dark", prefersDark);
};

syncThemeClass();
mediaQuery.addEventListener("change", syncThemeClass);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider locale="en-GB">
      <HeroUIProvider>
        <ToastProvider placement="bottom-center" toastOffset={96} />
        <BrowserRouter>
          <main className="min-h-screen bg-background text-foreground font-[Outfit]">
            <App />
          </main>
        </BrowserRouter>
      </HeroUIProvider>
    </I18nProvider>
  </React.StrictMode>
);
