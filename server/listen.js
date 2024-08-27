const app = require("../server/app");

app.listen(8080, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("listening on 8080!");
  }
});
