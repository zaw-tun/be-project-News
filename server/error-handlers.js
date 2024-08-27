exports.psqlErrorHandler = (err, req, res, next) => {
  if (err.code === "22P02") {
    response.status(400).send({ msg: "Invalid type" });
  } else {
    next(err);
  }
};

exports.customErrorHandler = (err, req, res, next) => {
  if (err.status && err.message) {
    response.status(err.status).send({ msg: err.message });
  } else {
    next(err);
  }
};

exports.serverErrorHandler = (err, req, res, next) => {
  console.log(err);

  response.status(500).send({ msg: "internal server error" });
};
