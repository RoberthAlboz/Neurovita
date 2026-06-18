import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/global.css";

// Efeito de clique minimalista (Ripple)
document.addEventListener('mousedown', (e) => {
  const target = e.target as HTMLElement;
  const interactive = target.closest('button, a, .clickable');
  if (interactive) {
    const rect = interactive.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    (interactive as HTMLElement).style.setProperty('--ripple-x', `${x}px`);
    (interactive as HTMLElement).style.setProperty('--ripple-y', `${y}px`);
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
