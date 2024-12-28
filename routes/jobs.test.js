"use strict";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

const { u1Token, adminToken } = require("./_testCommon");

beforeAll(async function () {
  await db.query("DELETE FROM jobs");
  await db.query(`
    INSERT INTO jobs (title, salary, equity, company_handle)
    VALUES ('Software Engineer', 120000, '0.05', 'c1'),
           ('Data Scientist', 110000, '0', 'c1'),
           ('Product Manager', 130000, '0.1', 'c2')`);
});

afterAll(async function () {
  await db.end();
});

describe("POST /jobs", function () {
  const newJob = { title: "Test Job", salary: 60000, equity: "0.02", companyHandle: "c1" };

  test("unauth for anon", async function () {
    const resp = await request(app).post("/jobs").send(newJob);
    expect(resp.statusCode).toEqual(401);
  });

  test("forbidden for non-admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
  });
});

describe("GET /jobs", function () {
  test("works: no filters", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body.jobs.length).toBeGreaterThan(0);
  });

  test("works: with filters", async function () {
    const resp = await request(app).get("/jobs").query({ title: "Engineer" });
    expect(resp.body.jobs.length).toBe(1);
  });
});

describe("PATCH /jobs/:id", function () {
  test("unauth for anon", async function () {
    const resp = await request(app).patch("/jobs/1").send({ title: "Updated Title" });
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .patch("/jobs/1")
      .send({ title: "Updated Title" })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
  });
});

describe("DELETE /jobs/:id", function () {
  test("unauth for anon", async function () {
    const resp = await request(app).delete("/jobs/1");
    expect(resp.statusCode).toEqual(401);
  });

  test("works for admin", async function () {
    const resp = await request(app).delete("/jobs/1").set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
  });
});
