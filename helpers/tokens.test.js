"use strict";

const jwt = require("jsonwebtoken");
const { createToken } = require("./tokens");
const { sqlForPartialUpdate } = require("./sql");
const { SECRET_KEY } = require("../config");
const { BadRequestError } = require("../expressError");

describe("createToken", function () {
  test("works: not admin", function () {
    const token = createToken({ username: "test", isAdmin: false });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });

  test("works: admin", function () {
    const token = createToken({ username: "test", isAdmin: true });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: true,
    });
  });

  test("works: default no admin", function () {
    // given the security risk if this didn't work, checking this specifically
    const token = createToken({ username: "test" });
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      iat: expect.any(Number),
      username: "test",
      isAdmin: false,
    });
  });
});

describe("sqlForPartialUpdate", function () {
  test("works: valid data", () => {
    const result = sqlForPartialUpdate(
      { firstName: "Aliya", age: 32 },
      { firstName: "first_name" }
    );
    expect(result).toEqual({
      setCols: `"first_name"=$1, "age"=$2`,
      values: ["Aliya", 32],
    });
  });

  test("works: no jsToSql mapping", () => {
    const result = sqlForPartialUpdate({ name: "Test", age: 25 }, {});
    expect(result).toEqual({
      setCols: `"name"=$1, "age"=$2`,
      values: ["Test", 25],
    });
  });

  test("fails: no dataToUpdate", () => {
    expect(() => sqlForPartialUpdate({}, {})).toThrow(BadRequestError);
  });
});
