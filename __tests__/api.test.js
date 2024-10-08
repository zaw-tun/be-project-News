const request = require("supertest");
const app = require("../server/app");
const db = require("../db/connection");
const fs = require("fs/promises");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data/index");
const {
  articleData,
  commentData,
  topicData,
  userData,
} = require("../db/data/test-data/index");
const endpoints = require("../endpoints.json");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("GET /api/topics", () => {
  it("status: 200, responds with topics data", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const { body } = response;
        expect(body.topics.length).toBe(3);
        body.topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
  it("status: 404, responds with an error for endpoint that does not exist", () => {
    return request(app)
      .get("/api/apple")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("Route not found");
      });
  });
});

describe("GET /api", () => {
  it("status: 200, responds with documentation detailing all available API endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const { body } = response;
        expect(body).not.toBe(null);
        expect(body).toHaveProperty("GET /api");
        expect(body).toHaveProperty("GET /api/topics");
        expect(body["GET /api"]).toHaveProperty("description");
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  it("status: 200, responds with an article object", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article.article_id).toBe(1);
        expect(article.title).toBe("Living in the shadow of a great man");
        expect(article.topic).toBe("mitch");
        expect(article.body).toBe("I find this existence challenging");
        expect(article.votes).toBe(100);
        expect(article.created_at).toBe("2020-07-09T20:11:00.000Z");
        expect(article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  it("status: 404, responds with an appropriate status and error message when given a valid but non-existent article_id", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("No such article_id exist yet");
      });
  });
  it("status: 400, responds with an appropriate status and error message when given an invalid id", () => {
    return request(app)
      .get("/api/articles/banana")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid data type provided");
      });
  });
});

describe("GET /api/articles", () => {
  it("status: 200, responds with all articles sorted by date in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const { body } = response;
        expect(body.articles.length).toBe(13);
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
        body.articles.forEach((article) => {
          expect(article).toHaveProperty("author");
          expect(article).toHaveProperty("title");
          expect(article).toHaveProperty("article_id");
          expect(article).toHaveProperty("topic");
          expect(article).toHaveProperty("created_at");
          expect(article).toHaveProperty("votes");
          expect(article).toHaveProperty("article_img_url");
          expect(article).toHaveProperty("comment_count");
          expect(article.body).toBe(undefined);
        });
      });
  });
  it("status: 200, responds with all articles sorted by author in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then((response) => {
        const { body } = response;
        expect(body.articles).toBeSortedBy("author", { descending: true });
      });
  });
  it("status: 200, responds with all articles sorted in created_at in ascending order", () => {
    return request(app)
      .get("/api/articles?order=ASC")
      .expect(200)
      .then((response) => {
        const { body } = response;
        expect(body.articles).toBeSortedBy("created_at", { descending: false });
      });
  });
  it("status: 200, responds with all articles sorted by votes in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&order=ASC")
      .expect(200)
      .then((response) => {
        const { body } = response;
        expect(body.articles).toBeSortedBy("votes", { descending: false });
      });
  });
  it("status: 400, responds with an appropriate status and error message when sort_by value is not valid/accepted", () => {
    return request(app)
      .get("/api/articles?sort_by=words")
      .expect(400)
      .then((response) => {
        const { body } = response;
        expect(body.message).toBe("Invalid sort column.");
      });
  });
  it("status: 400, responds with an appropriate status and error message when order value is not valid/accepted", () => {
    return request(app)
      .get("/api/articles?order=ASCENDING")
      .expect(400)
      .then((response) => {
        const { body } = response;
        expect(body.message).toBe(
          "Invalid Order value. Please choose from {ASC: ascending, DESC: descending}"
        );
      });
  });
  it("status: 200, responds with all articles under the specified topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then((response) => {
        const { body } = response;
        body.articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  it("status: 200, responds with all comments received for the given article_id", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: comments }) => {
        expect(comments).toHaveLength(11);
        comments.forEach((comment) => {
          expect(comment).toHaveProperty("comment_id");
          expect(comment).toHaveProperty("votes");
          expect(comment).toHaveProperty("created_at");
          expect(comment).toHaveProperty("author");
          expect(comment).toHaveProperty("body");
          expect(comment).toHaveProperty("article_id");
        });
        expect(comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  it("status: 200, responds with empty array when article_id exists but has no related comments, responds with empty array", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: comments }) => {
        expect(comments).toHaveLength(0);
        expect(Array.isArray(comments)).toBe(true);
      });
  });
  it("status: 404, responds with an appropriate status and error when given a valid but non-exisitant article_id", () => {
    return request(app)
      .get("/api/articles/199/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("No such article_id yet");
      });
  });
  it("status:400, responds with an appropriate status and error when given an invalid id", () => {
    return request(app)
      .get("/api/articles/apple/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid data type provided");
      });
  });
});

describe("/POST /api/articles/:article_id/comments", () => {
  const newComment = {
    username: "rogersop",
    body: "This is a 1st test article",
  };
  it("status:201, adds a comment with username and body to the given article and responds with posted comment", () => {
    return request(app)
      .post("/api/articles/10/comments")
      .send(newComment)
      .expect(201)
      .then((response) => {
        expect(response.body.comment.article_id).toBe(10);
      });
  });

  it("status:201, adds a comment with another username and body to the given article and responds with posted comment", () => {
    return request(app)
      .post("/api/articles/10/comments")
      .send({
        username: "lurker",
        body: "This is a 2nd test article",
      })
      .expect(201)
      .then((response) => {
        expect(response.body.comment.article_id).toBe(10);
      });
  });

  it("status:400, responds with an appropriate status and error message when provided with a comment without a username)", () => {
    return request(app)
      .post("/api/articles/10/comments")
      .send({ body: "This is a 3rd test article" })
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid data type provided");
      });
  });
  it("status:400, responds with an appropriate status and error message when provided with a comment with a strange (non-existant) username", () => {
    return request(app)
      .post("/api/articles/10/comments")
      .send({ username: "zaw", body: "This is a 4th test article" })
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid data type provided");
      });
  });
  it("status:404, responds with an appropriate status and error message when provided with an invalid article_id", () => {
    return request(app)
      .post("/api/articles/200/comments")
      .send(newComment)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("No such article_id yet");
      });
  });
});

describe("/PATCH /api/articles/:article_id", () => {
  it("status:200, responds with updated article", () => {
    const updateVotes = {
      inc_votes: 10,
    };
    return request(app)
      .patch("/api/articles/5")
      .send(updateVotes)
      .expect(200)
      .then((response) => {
        expect(response.body.article.article_id).toBe(5);
        expect(response.body.article.votes).toBe(10);
      });
  });
  it("status:200, responds with updated article", () => {
    const updateVotes = {
      inc_votes: -100,
    };
    return request(app)
      .patch("/api/articles/10")
      .send(updateVotes)
      .expect(200)
      .then((response) => {
        expect(response.body.article.article_id).toBe(10);
        expect(response.body.article.votes).toBe(-100);
      });
  });
  it("status: 404, responds with an appropriate status and error when given a valid but non-exisitant article_id", () => {
    const updateVotes = {
      inc_votes: 10,
    };
    return request(app)
      .patch("/api/articles/104")
      .send(updateVotes)
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe("No such article_id exist yet");
      });
  });
  it("status: 400, responds with an appropriate status and error when given invalid datatype for votes", () => {
    const falseVote = { inc_votes: "" };
    return request(app)
      .patch("/api/articles/5")
      .send(falseVote)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Cannot update. Invalid data.");
      });
  });
  it("status: 400, responds with an appropriate status and error when given invalid datatype for votes", () => {
    const falseVote = { inc_votes: "not-a-num" };
    return request(app)
      .patch("/api/articles/5")
      .send(falseVote)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Cannot update. Invalid data.");
      });
  });
});

describe("/DELETE /api/comments/:comment_id", () => {
  it("status:204, responds with no content", () => {
    return request(app)
      .delete("/api/comments/13")
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
  it("status:404, responds with no content", () => {
    return request(app)
      .delete("/api/comments/100")
      .expect(404)
      .then((response) => {
        expect(response.body.message).toBe(
          "No comment with specified comment_id."
        );
      });
  });
  it("status:400, responds with an appropriate status and error when given an invalid id", () => {
    return request(app)
      .delete("/api/comments/banana")
      .expect(400)
      .then((response) => {
        expect(response.body.message).toBe("Invalid data type provided");
      });
  });
});

describe("GET /api/users", () => {
  it("status: 200, responds with users data", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const { body } = response;
        expect(body.users.length).toBe(4);
        body.users.forEach((user) => {
          expect(user).toHaveProperty("username");
          expect(user).toHaveProperty("name");
          expect(user).toHaveProperty("avatar_url");
        });
      });
  });
});
