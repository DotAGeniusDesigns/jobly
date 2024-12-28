"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError, BadRequestError } = require("../expressError");

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * Data: { title, salary, equity, companyHandle }
   * Returns: { id, title, salary, equity, companyHandle }
   */
  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    return result.rows[0];
  }

  /** Find all jobs, optionally filtered by title, minSalary, or hasEquity. */
  static async findAll({ title, minSalary, hasEquity } = {}) {
    let whereParts = [];
    let values = [];

    if (title) {
      values.push(`%${title}%`);
      whereParts.push(`title ILIKE $${values.length}`);
    }
    if (minSalary !== undefined) {
      values.push(minSalary);
      whereParts.push(`salary >= $${values.length}`);
    }
    if (hasEquity === true) {
      whereParts.push(`equity > 0`);
    }

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(" AND ")}` : "";

    const jobs = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       ${whereClause}
       ORDER BY title`,
      values
    );
    return jobs.rows;
  }

  /** Get a job by ID. */
  static async get(id) {
    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle AS "companyHandle"
       FROM jobs
       WHERE id = $1`,
      [id]
    );

    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job with ID: ${id}`);
    return job;
  }

  /** Update job data with `data`. Excludes `id` and `companyHandle`. */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const querySql = `UPDATE jobs SET ${setCols} WHERE id = $${values.length + 1} RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job with ID: ${id}`);
    return job;
  }

  /** Delete a job by ID. */
  static async remove(id) {
    const result = await db.query(
      `DELETE FROM jobs WHERE id = $1 RETURNING id`,
      [id]
    );
    if (!result.rows.length) throw new NotFoundError(`No job with ID: ${id}`);
  }
}

module.exports = Job;
