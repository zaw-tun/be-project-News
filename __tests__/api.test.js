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
