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
        expect(body).toEqual(endpoints);
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
        expect(response.body.message).toBe("ID doesn't exist yet");
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
