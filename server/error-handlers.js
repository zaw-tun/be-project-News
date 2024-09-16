exports.psqlErrorHandler = (err, req, res, next) => {
  if (["22P02", "23502", "23503", "42601", "42703"].includes(err.code)) {
    res.status(400).send({ message: "Invalid data type provided" });
  } else {
    next(err);
  }
};

exports.customErrorHandler = (err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    next(err);
  }
};

exports.serverErrorHandler = (err, req, res, next) => {
  console.log(err);

  response.status(500).send({ msg: "internal server error" });
};
