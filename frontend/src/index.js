import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import InsuranceApp from "./InsuranceApp";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <InsuranceApp />
  </React.StrictMode>
);

reportWebVitals();
