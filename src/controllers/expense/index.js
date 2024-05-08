const express = require("express");
const router = express.Router();
const {
  addExpense,
  getExpenseList,
  settleUpExpense,
  deleteExpense,
  updateExpense,
  dashboardExpenses,
} = require("./expenseController");
const Validator = require("./validator");

router.route("/add").post(Validator("validExpenseSchema"), addExpense);
router.route("/get/:groupId").get(getExpenseList);
router
  .route("/settle-up")
  .post(Validator("validSettleUpSchema"), settleUpExpense);
router.route("/delete/:expenseId").delete(deleteExpense);
router
  .route("/update/:expenseId")
  .patch(Validator("validUpdateExpenseSchema"), updateExpense);
router
  .route("/dashboard/:userId")
  .get(dashboardExpenses);

module.exports = router;
