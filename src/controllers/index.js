const express = require("express");
const usersRouter = require("./users/index");
const groupRouter = require("./group/index");
const expensesRouter = require("./expense/index");

const app = express();

app.use("/users", usersRouter);
app.use("/expenses", expensesRouter);
app.use("/group", groupRouter);

module.exports = app;
