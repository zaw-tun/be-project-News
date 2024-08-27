const express = require("express");
const app = express();
const fs = require("fs/promises");
const {
  getTopics,
  getApis,
} = require("../controllers/topics.controller");
const {
  getArticleById,
} = require("../controllers/articles.controller");

const {
  psqlErrorHandler,
  customErrorHandler,
  serverErrorHandler,
} = require("../server/error-handlers");
app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getApis);

app.get("/api/articles/:article_id", getArticleById);

app.all("/*", (req, res) => {
  res.status(404).send({ message: "Route not found" });
});

app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(serverErrorHandler);

module.exports = app;
