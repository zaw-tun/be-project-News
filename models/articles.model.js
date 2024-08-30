const { patchArticleById } = require("../controllers/articles.controller");
const db = require("../db/connection");

function selectArticleById(article_id) {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "No such article_id exist yet",
        });
      }
      return data.rows[0];
    });
}

function selectArticles() {
  return db
    .query(
      `
        SELECT a.author, a.title, a.article_id, a.topic, a.created_at, a.votes, a.article_img_url, COUNT(c.comment_id) AS comment_count FROM articles AS a
        LEFT JOIN comments AS c USING (article_id)
        GROUP BY a.article_id ORDER BY a.created_at DESC;
        `
    )
    .then((result) => {
      return result.rows;
    });
}

function selectCommentsByArticleId(article_id) {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "No such article_id yet",
        });
      }
      return db
        .query(
          "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
          [article_id]
        )
        .then((data) => {
          return data.rows;
        });
    });
}

function insertCommentById(article_id, username, body) {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({
          status: 404,
          message: "No such article_id yet",
        });
      }
      return db
        .query(
          "INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *;",
          [body, article_id, username]
        )
        .then((data) => {
          return data.rows[0];
        });
    });
}

function incVotesById(article_id, inc_votes) {
  return selectArticleById(article_id).then((data) => {
    if (isNaN(inc_votes)) {
      return Promise.reject({
        status: 400,
        message: "Cannot update. Invalid data.",
      });
    }
    data.votes += inc_votes;
    return db
      .query(
        `UPDATE articles SET votes = $1 
        WHERE article_id = $2 RETURNING *;`,
        [data.votes, article_id]
      )
      .then((data) => {
        return data.rows[0];
      });
  });
}

module.exports = {
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertCommentById,
  incVotesById,
};
