const db = require("../db/connection");

const fs = require("fs/promises");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.selectApis = () => {
  return fs
    .readFile(`${__dirname}/../endpoints.json`, "utf-8")
    .then((result) => {
      return JSON.parse(result);
    });
};
