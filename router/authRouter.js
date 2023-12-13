const express = require("express");
const {
  register,
  login,
  getUser,
  updateUser,
  generateOTP,
  verifyOTP,
  createResetSession,
  resetPassword,
  refreshToken,
  getUserDetails,
} = require("../controllers/userController.js");
const { Auth, verifyUser, localVariables } = require("../middleware/auth.js");
const { registerMail } = require("../controllers/mailerController");
const upload = require("../config/storage.js");
const { createLibrary } = require("../controllers/libraryController.js");


const router = express.Router();

router.route("/register").post(upload.single("profile"),register);
router.route("/register-mail").post(registerMail);
router.route("/onboarding").get(Auth,createLibrary);
router.route("/authenticate").post(verifyUser, (req, res) => res.end()); // authenticate user
router.route("/login").post(verifyUser, login); // login in app
router.route("/token/refresh").post(refreshToken);
router.route("/generate-otp").get(verifyUser, localVariables, generateOTP);
router.route("/verify-otp").get(verifyUser, verifyOTP);
router.route("/create-reset-session").get(createResetSession);
router.route("/reset-password").put(verifyUser, resetPassword);
router.route("/user-details").get(Auth, getUserDetails);
router.route("/update-user").put(Auth, upload.single("profile"), updateUser);
router.route("/users/:username").get(getUser);

module.exports = router;
