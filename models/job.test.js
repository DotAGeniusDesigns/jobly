"use strict";

const db = require("../db");
const Job = require("./job");
const { NotFoundError, BadRequestError } = require("../expressError");

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

describe("create", function () {
  test("works", async function () {
    const job = await Job.create({
      title: "Test Job",
      salary: 50000,
      equity: "0.02",
      companyHandle: "c1",
    });

    expect(job).toEqual({
      id: expect.any(Number),
      title: "Test Job",
      salary: 50000,
      equity: "0.02",
      companyHandle: "c1",
    });
  });
});

describe("findAll", function () {
  test("works without filters", async function () {
    const jobs = await Job.findAll();
    expect(jobs.length).toBeGreaterThan(0);
  });

  test("works with filters", async function () {
    const jobs = await Job.findAll({ title: "Engineer", minSalary: 100000 });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "Software Engineer",
        salary: 120000,
        equity: "0.05",
        companyHandle: "c1",
      },
    ]);
  });

  test("works with hasEquity filter", async function () {
    const jobs = await Job.findAll({ hasEquity: true });
    expect(jobs.length).toEqual(2);
  });
});

describe("get", function () {
  test("works", async function () {
    const job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "Software Engineer",
      salary: 120000,
      equity: "0.05",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", function () {
  test("works", async function () {
    const job = await Job.update(1, { title: "Updated Title" });
    expect(job.title).toBe("Updated Title");
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query("SELECT * FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
