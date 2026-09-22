import { Router } from "express";
import {
  changeCurrentPassword,
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
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { validate} from "../middlewares/validators.middlewares.js";
import {
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgottenPasswordValidator,
} from "../validators/index.js";


const router = Router();




router.route("/register").post(userRegisterValidator(),validate,registerUser);
router.route("/login").post(userLoginValidator(),validate,loginUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/verify-email/:verficationToken").get(verifyEmail);
router.route("/forgot-password").post(userForgotPasswordValidator(),validate,forgotPasswordRequest);
router.route("/reset-password/:resetToken").post(userForgotPasswordValidator(),validate,resetForgottenPassword);

router.route("/logout").post(verifyJwt,logoutUser);
router.route("/current-user").get(verifyJwt,getCurrentUser);
router.route("/change-password").post(verifyJwt,userChangeCurrentPasswordValidator(),validate,changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJwt,resendEmailVerification);



export default router;