const { selectTopics, selectApis } = require("../models/topics.model");

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.getApis = (req, res, next) => {
  selectApis().then((apis) => {
    res.status(200).send(apis);
  });
};

