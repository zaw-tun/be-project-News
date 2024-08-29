const db = require("../db/connection");

exports.selectArticleById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({ status: 404, message: "ID doesn't exist yet" });
      }
      return data.rows[0];
    });
};

exports.selectArticles = () => {
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
};

const checkArticleIdExists = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((data) => {
      return data.rows.length !== 0;
    });
};
exports.selectCommentsByArticleId = (article_id) => {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
      [article_id]
    )
    .then((data) => {
      if (data.rows.length === 0) {
        return checkArticleIdExists(article_id).then((idExists) => {
          if (idExists) {
            return data.rows;
          }
          return Promise.reject({
            status: 404,
            message: "No such article_id yet",
          });
        });
      }
      return data.rows;
    });
};
