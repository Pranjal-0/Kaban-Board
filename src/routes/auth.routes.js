import { Router } from "express";
import { validate} from "../middlewares/validator.middleware.js";
import {isLoggedIn} from "../middlewares/auth.middlewares.js"
import{verifyJWT}from "../middlewares/verifyJWT.middlwares.js"
import { addMemberToProjectValidator,
  createProjectValidator,
  createTaskValidator,
  notesValidator,
  updateTaskValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgottenPasswordValidator } from "../validators/index.js";
import {   changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgottenPassword,
  verifyEmail,
} from "../controllers/auth.controllers.js";

const router = Router();

 
router.route("/register").post(userRegisterValidator(),validate,registerUser);
router.route("/login").post(userLoginValidator(),validate,loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);

router.route("/logout").post(verifyJWT,logoutUser);


router.route("/change-password").post(verifyJWT,
  userChangeCurrentPasswordValidator(),
  validate,
  changeCurrentPassword
);

router.route("/resend-email-verification").post(verifyJWT,resendEmailVerification);
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPasswordRequest);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/getcurrent-user").get(verifyJWT,getCurrentUser);
router.route("change-password").post(verifyJWT,userChangeCurrentPasswordValidator(),validate,changeCurrentPassword)
export default router;