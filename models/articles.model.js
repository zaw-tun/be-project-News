const db = require("../db/connection");

exports.selectArticle = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1;", [article_id])
    .then((data) => {
      if (data.rows.length === 0) {
        return Promise.reject({ status: 404, message: "ID doesn't exist yet" });
      }
      return data.rows[0];
    });
};
