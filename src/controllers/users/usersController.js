const express = require("express");
const {
  userAlreadyExistQuery,
  singnUpUserQuery,
  updateUserQuery,
  usersListQuery,
} = require("../../query/usersQuery");
const { successHandler, errorHandler } = require("../../utils/responseHandler");
const getMessage = require("../../message");
const { comparePassword } = require("../../utils/helpers");
require("dotenv").config();

/**
 * Handles user signup process by checking for existing users, creating a new user,
 * and returning success or error responses based on the outcome.
 *
 * @param {Object} req - The request object containing user details like firstName, lastName, email, mobileNo, and password.
 * @param {Object} res - The response object for sending the response.
 * @return {Promise<Object>} A promise that resolves to the response data after user signup.
 */
exports.singnUpUser = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNo, password } = req.body;

    const userAlreadyExist = await userAlreadyExistQuery(email, mobileNo);
    if (userAlreadyExist.length > 0) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M002"),
      });
    }

    const result = await singnUpUserQuery(
      firstName,
      lastName,
      email,
      mobileNo,
      password
    );
    if (!result || result.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M010"),
      });
    }
    return successHandler({
      res,
      data: result[0],
      statusCode: 200,
      message: getMessage("M003"),
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
 * Handles user login process by checking for existing user, validating password,
 * and returning success or error responses based on the outcome.
 *
 * @param {Object} req - The request object containing user details like email and password.
 * @param {Object} res - The response object for sending the response.
 * @return {Promise<Object>} A promise that resolves to the response data after user login.
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M001"),
      });
    }

    const user = await userAlreadyExistQuery(email);
    console.log("user", user);
    if (user.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M008"),
      });
    }
    const isPasswordMatch = comparePassword(password, user[0].password);
    if (!isPasswordMatch) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M009"),
      });
    }
    delete user[0].password;
    return successHandler({
      res,
      data: user[0],
      statusCode: 200,
      message: getMessage("M004"),
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
 * Updates a user's information.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.body - The request body containing the user's updated information.
 * @param {string} req.body.firstName - The updated first name of the user.
 * @param {string} req.body.lastName - The updated last name of the user.
 * @param {string} req.body.email - The updated email of the user.
 * @param {string} req.body.mobileNo - The updated mobile number of the user.
 * @param {string} req.body.password - The updated password of the user.
 * @param {string} req.params.userId - The ID of the user to be updated.
 * @param {Object} res - The response object.
 * @return {Promise} A promise that resolves to the updated user object or an error response.
 */
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNo, password } = req.body;
    if (!firstName && !lastName && !email && !mobileNo && !password) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M014"),
      });
    }
    const userId = req.params.userId;
    if (email || mobileNo) {
      const userAlreadyExist = await userAlreadyExistQuery(email, mobileNo);
      if (userAlreadyExist.length > 0) {
        return errorHandler({
          res,
          statusCode: 400,
          message: getMessage("M002"),
        });
      }
    }
    const result = await updateUserQuery(
      firstName,
      lastName,
      email,
      mobileNo,
      password,
      null,
      userId
    );
    if (!result || result.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: !result ? getMessage("M011") : getMessage("M008"),
      });
    }
    delete result[0].password;
    return successHandler({
      res,
      data: result[0],
      statusCode: 200,
      message: getMessage("M007"),
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
 * Deletes a user from the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} - A promise that resolves to an object containing the response data.
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const result = await updateUserQuery(
      null,
      null,
      null,
      null,
      null,
      true,
      userId
    );
    if (result.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M008"),
      });
    }
    return successHandler({
      res,
      data: {},
      statusCode: 200,
      message: getMessage("M012"),
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
 * Handles listing users based on provided criteria.
 *
 * @param {Object} req - The request object containing user details like firstName, email, mobileNo.
 * @param {Object} res - The response object for sending the response.
 * @return {Promise<Object>} A promise that resolves to the user data or an error response.
 */
exports.usersList = async (req, res) => {
  try {
    const { firstName, email, mobileNo } = req.body;
    const result = await usersListQuery(firstName, email, mobileNo);
    if (result.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M008"),
      });
    }
    return successHandler({
      res,
      data: result,
      statusCode: 200,
      message: getMessage("M013"),
    });
  } catch (error) {
    return errorHandler({
      res,
      statusCode: 500,
      message: error.message,
    });
  }
};
