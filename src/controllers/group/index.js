const express = require("express");
const router = express.Router();
const {
  createGroup,
  updateGroup,
  deleteGroup,
  groupList,
} = require("./groupController");
const Validator = require("./validator");
router
  .route("/create-group")
  .post(Validator("validCreateGroupSchema"), createGroup);
router
  .route("/update-group/:groupId")
  .patch(Validator("validUpdateGroupSchema"), updateGroup);
router.route("/delete-group/:groupId").delete(deleteGroup);
router.route("/list/:userId").get(groupList);

module.exports = router;
