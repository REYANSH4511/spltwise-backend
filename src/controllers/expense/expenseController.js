const express = require("express");
const {
  addExpenseQuery,
  addSubExpenseQuery,
  getExpenseListQuery,
  addExpenseHistoryQuery,
  settleUpExpenseQuery,
  checkIsExpenseExistsQuery,
  deleteExpenseQuery,
  updateExpenseQuery,
  dashboardExpenseQuery,
} = require("../../query/expenseQuery");
const { successHandler, errorHandler } = require("../../utils/responseHandler");
const getMessage = require("../../message");
require("dotenv").config();

/**
 * Handles the addition of an expense.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The response data after adding the expense.
 */
exports.addExpense = async (req, res) => {
  try {
    const {
      payeeId,
      groupId,
      amount,
      description,
      splitType,
      sharedBy,
      expenseDate,
    } = req.body;

    const expenses = await addExpenseQuery(
      payeeId,
      groupId,
      amount,
      description,
      splitType,
      expenseDate
    );
    if (expenses.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    const expenseId = expenses[0].expenseId;
    const subExpense = await addSubExpenseQuery(expenseId, sharedBy);
    if (subExpense.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M015"),
      });
    }
    // const result = await addExpenseHistoryQuery(subExpense);
    // if (result.length < 1) {
    //     return errorHandler({
    //       res,
    //       statusCode: 400,
    //       message: getMessage("M015"),
    //     });
    //   }
    return successHandler({
      res,
      data: {},
      statusCode: 200,
      message: getMessage("M016"),
    });
  } catch (error) {
    return errorHandler({
      res,
      statusCode: 500,
      message: error.message,
    });
  }
};
/**
 * Handles getting the list of expenses for a specific group.
 *
 * @param {Object} req - The request object containing the group ID.
 * @param {Object} res - The response object for sending the response.
 * @return {Object} The response data with the list of expenses.
 */
exports.getExpenseList = async (req, res) => {
  try {
    const groupId = req.params.groupId;

    const result = await getExpenseListQuery(groupId);
    if (result.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M029"),
      });
    }
    return successHandler({
      res,
      data: result,
      statusCode: 200,
      message: getMessage("M017"),
    });
  } catch (error) {
    return errorHandler({
      res,
      statusCode: 500,
      message: error.message,
    });
  }
};

/**
 * Handles the settlement of an expense.
 *
 * @param {Object} req - The request object containing the following properties:
 *   - {string} payeeId - The ID of the payee.
 *   - {string} groupId - The ID of the group.
 *   - {number} amount - The amount of the expense.
 *   - {string} sharedBy - The ID of the person who shared the expense.
 *   - {string} expenseDate - The date of the expense.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} A promise that resolves to the response data after settling the expense.
 *   - If the settlement is successful, the response data will be an empty object.
 *   - If the settlement fails, the response data will contain an error message.
 * @throws {Error} If an error occurs during the settlement process.
 */
exports.settleUpExpense = async (req, res) => {
  try {
    const { payeeId, groupId, amount, sharedBy, expenseDate } = req.body;
    const settleUp = await settleUpExpenseQuery(
      payeeId,
      groupId,
      amount,
      expenseDate
    );
    if (settleUp.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M031"),
      });
    }
    const expenseId = settleUp[0].expenseId;
    const subExpense = await addSubExpenseQuery(expenseId, sharedBy);
    if (subExpense.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M031"),
      });
    }
    return successHandler({
      res,
      data: {},
      statusCode: 200,
      message: getMessage("M030"),
    });
  } catch (error) {
    return errorHandler({
      res,
      statusCode: 500,
      message: error.message,
    });
  }
};

/**
 * Deletes an expense with the given expenseId.
 *
 * @param {Object} req - The request object containing the expenseId in the params.
 * @param {Object} res - The response object for sending the response.
 * @return {Promise<Object>} A promise that resolves to the response data after deleting the expense.
 *   - If the expense is successfully deleted, the response data will be an empty object.
 *   - If the expense does not exist, the response data will contain an error message.
 *   - If an error occurs during the deletion process, the response data will contain an error message.
 */
exports.deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.expenseId;
    const checkIsExpenseExists = await checkIsExpenseExistsQuery(expenseId);
    if (!checkIsExpenseExists || checkIsExpenseExists.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M020"),
      });
    }
    await deleteExpenseQuery(expenseId);
    return successHandler({
      res,
      data: {},
      statusCode: 200,
      message: getMessage("M018"),
    });
  } catch (error) {
    return errorHandler({
      res,
      statusCode: 500,
      message: error.message,
    });
  }
};

/**
 * Handles the update of an expense based on the provided request.
 *
 * @param {Object} req - The request object containing expense details.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} A promise that resolves to the updated expense data.
 */

exports.updateExpense = async (req, res) => {
  try {
    const expenseId = req.params.expenseId;
    const checkIsExpenseExists = await checkIsExpenseExistsQuery(expenseId);
    if (!checkIsExpenseExists || checkIsExpenseExists.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M020"),
      });
    }

    const {
      payeeId,
      groupId,
      amount,
      description,
      splitType,
      sharedBy,
      expenseDate,
    } = req.body;
    const result = await updateExpenseQuery(
      payeeId,
      groupId,
      amount,
      description,
      splitType,
      expenseDate,
      expenseId
    );
    if (result.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M020"),
      });
    }
    if (sharedBy && sharedBy.length > 0) {
      const subExpense = await addSubExpenseQuery(expenseId, sharedBy);
      if (subExpense.length < 1) {
        return errorHandler({
          res,
          statusCode: 400,
          message: getMessage("M020"),
        });
      }
    }
    return successHandler({
      res,
      data: result[0],
      statusCode: 200,
      message: getMessage("M019"),
    });
  } catch (error) {
    return errorHandler({
      res,
      statusCode: 500,
      message: error.message,
    });
  }
};

/**
 * Calculates the expenses for a user's dashboard.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Object} The calculated expenses for the user's dashboard.
 */
exports.dashboardExpenses = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await dashboardExpenseQuery(userId);
    if (result.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M020"),
      });
    }
    const roundOff = (num) => {
      return Math.round(num * 100) / 100;
    };
    const calculateBalanceWithEachPerson = async (result, userId) => {
      let totalBalance = 0;
      const personBalances = {};

      await Promise.all(
        result.map(async (expense) => {
          if (expense.expenseType === "expense") {
            await Promise.all(
              expense.subExpenses.map(async (sub) => {
                if (expense.payee.payeeId == userId) {
                  if (sub.userId == userId) {
                    totalBalance -= sub.amount;
                  }
                  totalBalance += sub.amount;
                  personBalances[sub.userId] =
                    (personBalances[sub.userId] || 0) + sub.amount;
                } else {
                  if (sub.userId == userId) {
                    totalBalance -= sub.amount;
                    const payeeId = expense.payee.payeeId;
                    personBalances[payeeId] =
                      (personBalances[payeeId] || 0) - sub.amount;
                  }
                }
              })
            );
          } else if (expense.expenseType === "record") {
            await Promise.all(
              expense.subExpenses.map(async (sub) => {
                if (expense.payee.payeeId == userId) {
                  totalBalance += sub.amount;
                }
                if (sub.userId == userId) {
                  totalBalance -= sub.amount;
                  const payeeId = expense.payee.payeeId;
                  personBalances[payeeId] =
                    (personBalances[payeeId] || 0) - sub.amount;
                }
              })
            );
          }
        })
      );

      const finalBalances = [];
      await Promise.all(
        Object.keys(personBalances).map(async (key) => {
          if (key != userId) {
            const balance = roundOff(personBalances[key]);
            let details;

            for (const expense of result) {
              const subExpense = expense.subExpenses.find(
                (sub) => sub.userId == key
              );
              if (subExpense) {
                details = subExpense;
                break;
              }
            }

            if (details) {
              finalBalances.push({
                userId: key,
                firstName: details.firstName,
                lastName: details.lastName,
                balance,
              });
            }
          }
        })
      );

      return {
        totalBalance: roundOff(totalBalance),
        personBalances: finalBalances,
      };
    };
    const userBalance = await calculateBalanceWithEachPerson(result, userId);

    return successHandler({
      res,
      data: userBalance,
      statusCode: 200,
      message: getMessage("M032"),
    });
  } catch (error) {
    return errorHandler({
      res,
      statusCode: 500,
      message: error.message,
    });
  }
};
