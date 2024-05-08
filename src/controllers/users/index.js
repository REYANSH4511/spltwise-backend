const express = require("express");
const router = express.Router();
const {
  singnUpUser,
  loginUser,
  updateUser,
  deleteUser,
  usersList,
} = require("./usersController");
const Validator = require("./validator");
router.route("/signup").post(Validator("signUpUserValid"), singnUpUser);
router.route("/login").post(Validator("loginUserValid"), loginUser);
router
  .route("/update-user/:userId")
  .patch(Validator("updateUserValid"), updateUser);
router.route("/delete-user/:userId").delete(deleteUser);
router.route("/users-list").post(usersList);

module.exports = router;
