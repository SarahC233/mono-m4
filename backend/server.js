
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes/routes");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const port = process.env.PORT || 3001;

console.log("GOOGLE_GEMINI_API_KEY:", process.env.GOOGLE_GEMINI_API_KEY);

const corsOptions = {
  origin: "http://localhost:80",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// API routes
app.use("/api", routes);

// Proxy requests for static files to the frontend service
app.use(
  "/",
  createProxyMiddleware({
    target: "http://frontend:80", // name of frontend service
    changeOrigin: true,
    pathRewrite: {
      "^/": "",
    },
  })
);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
