const express = require("express");
const {
  createGroupQuery,
  membersQuery,
  updateGroupQuery,
  deleteGroupQuery,
  checkGroupExistsQuery,
  groupListQuery,
} = require("../../query/groupQuery");
const { successHandler, errorHandler } = require("../../utils/responseHandler");
const getMessage = require("../../message");
require("dotenv").config();

/**
 * Creates a new group with the given group name and group members.
 *
 * @param {Object} req - The request object containing the group name and group members in the request body.
 * @param {Object} res - The response object for sending the response.
 * @return {Promise<Object>} A promise that resolves to the response data after creating the group.
 *   - If the group is successfully created, the response data will be an empty object.
 *   - If the group name is missing, the response data will contain an error message.
 *   - If the group creation fails, the response data will contain an error message.
 */
exports.createGroup = async (req, res) => {
  try {
    const { groupName, groupMembers } = req.body;
    if (!groupName) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M025"),
      });
    }
    const group = await createGroupQuery(groupName);
    if (group.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M025"),
      });
    }
    const groupId = group[0]?.groupId;
    const result = await membersQuery(groupId, groupMembers);
    if (result.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M025"),
      });
    }
    return successHandler({
      res,
      data: {},
      statusCode: 200,
      message: getMessage("M021"),
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
 * Updates a group with the provided group name and members.
 *
 * @param {Object} req - The request object containing the group ID, group name, and group members.
 * @param {Object} res - The response object for sending the response.
 * @return {Promise<Object>} A promise that resolves to the response data after updating the group.
 */
exports.updateGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const { groupName, groupMembers } = req.body;

    if (!groupName && (!groupMembers || groupMembers.length < 2)) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M014"),
      });
    }

    if (groupName) {
      const group = await updateGroupQuery(groupId, groupName);
      if (!group || group.length < 1) {
        return errorHandler({
          res,
          statusCode: 400,
          message: getMessage("M026"),
        });
      }
    }

    if (groupMembers && groupMembers.length >= 2) {
      const isGroupExists = await checkGroupExistsQuery(groupId);
      if (!isGroupExists || isGroupExists.length < 1) {
        return errorHandler({
          res,
          statusCode: 400,
          message: getMessage("M026"),
        });
      }
      const result = await membersQuery(groupId, groupMembers);
      if (!result || result.length < 1) {
        return errorHandler({
          res,
          statusCode: 400,
          message: getMessage("M026"),
        });
      }
    }

    return successHandler({
      res,
      data: {},
      statusCode: 200,
      message: getMessage("M022"),
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
 * Deletes a group with the given groupId.
 *
 * @param {Object} req - The request object containing the groupId in the params.
 * @param {Object} res - The response object for sending the response.
 * @return {Promise<Object>} A promise that resolves to the response data after deleting the group.
 *   - If the group is successfully deleted, the response data will be an empty object.
 *   - If the group does not exist, the response data will contain an error message.
 *   - If an error occurs during the deletion process, the response data will contain an error message.
 */
exports.deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const isGroupExists = await checkGroupExistsQuery(groupId);
    if (!isGroupExists || isGroupExists.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M027"),
      });
    }

    await deleteGroupQuery(groupId);
    return successHandler({
      res,
      data: {},
      statusCode: 200,
      message: getMessage("M023"),
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
 * Retrieves the list of groups for a given user.
 *
 * @param {Object} req - The request object containing the userId in the params.
 * @param {Object} res - The response object for sending the response.
 * @return {Promise<Object>} A promise that resolves to the response data after retrieving the group list.
 *   - If the group list is successfully retrieved, the response data will contain the list of groups.
 *   - If the user does not exist or no groups are found, the response data will contain an error message.
 *   - If an error occurs during the retrieval process, the response data will contain an error message.
 */
exports.groupList = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log("first", userId);
    const result = await groupListQuery(userId);
    if (result.length < 1) {
      return errorHandler({
        res,
        statusCode: 400,
        message: getMessage("M028"),
      });
    }
    return successHandler({
      res,
      data: result,
      statusCode: 200,
      message: getMessage("M024"),
    });
  } catch (error) {
    return errorHandler({
      res,
      statusCode: 500,
      message: error.message,
    });
  }
};
