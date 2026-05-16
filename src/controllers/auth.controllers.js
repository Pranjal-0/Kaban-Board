import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import crypto from "crypto";
import {
  emailVerificationMailgenContent,
  sendEmail,
} from "../utils/mailgen.js";
import { response } from "express";
import { validate } from "../middlewares/validator.middleware.js";




const generateAccessAndRefreshTokens = async (userId)=>{
  try {
    const user = await User.findById(userId);
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();
    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    await user.save({validateBeforeSave:false});
    return {accessToken,refreshToken}
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access token",
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  const { email,username, password } = req.body;
  const existedUser = await User.findOne({$or:[
    {email},{username}],
  })
  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

 const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

const {unHashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();
user.emailVerificationToken = hashedToken;
user.emailVerificationExpiry = tokenExpiry;
await user.save({ validateBeforeSave: false });



 await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host",
      )}/api/v1/auth/verify-email/${unHashedToken}`,
    ),
  });
  
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpir"
  )

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "Users registered successfully and verification email has been sent on your email.",
      ),
    );
});
const loginUser = asyncHandler(async (req, res) => {
  const { email, password,username} = req.body;


  if(!email && !username){
    throw new ApiError(401, "Invalid email or password");

  }

  const user  = await User.findOne({$or:[
    {email},{username}],
  })

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
 

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }
  console.log(user._id);
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select(
  "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
);


// yaha se samajhna hai 
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options) // set the access token in the cookie
    .cookie("refreshToken", refreshToken, options) // set the refresh token in the cookie
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken }, // send access and refresh token in response if client decides to save them by themselves
        "User logged in successfully",
      ),
    );
  }
// idar tk!!!!!!!!!!
);
const logoutUser = asyncHandler(async (req, res) => {
  console.log(req.user._id)
  await User.findByIdAndUpdate( req.user._id,    
  {
    $set:{
      refreshToken : "",
    },
  },
  {new:true}
)
const options = {
  httpOnly:true,
  secure: process.env.NODE_ENV === "production",
};
return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"user logged out successfully!"))


});
const verifyEmail = asyncHandler(async (req, res) => {
  const {verificationToken} = req.params;
  if(!verificationToken){
    throw new ApiError(400, "Email verification token is missing"); 
  }  
  let hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)//unhashing verificatio token and saving in hashedtoken
    .digest('hex') 
  const user = await User.findOne({
    emailVerificationToken : hashedToken,
    emailVerificationExpiry : {$gt: Date.now()}
  });
  if(!user){
    throw new ApiError(404,"user not found (verify email)")
  }
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;
  await user.save({validateBeforeSave:false});

  return res
    .status(200)
    .json(new ApiResponse(200, { isEmailVerified: true }, "Email is verified"));
});
const resendEmailVerification = asyncHandler(async (req, res) => {  
  const user = await User.findById(req.user?._id);
  if(!user){
    throw new ApiError(404,"user not found");
  }
  if(user.isEmailVerified){
    throw new ApiError(400,"email already verified")
  }
const{unHashedToken,hashedToken,tokenExpiry}=
user.generateTemporaryToken();
user.emailVerificationToken = hashedToken;
user.emailVerificationExpiry = tokenExpiry;
await user.save({validateBeforeSave:false});

// ye samjhna hai
await sendEmail({
    email: user?.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get(
        "host",
      )}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
});
const resetForgottenPassword = asyncHandler(async (req, res) => {
  const{resetToken} = req.params;
  const{newPassword} = req.body;
  

  let hashedToken = crypto
    .createHash("sha256")
    .update("resetToken")
    .digest("hex");
  

  const user = await User.findOne({
    forgotPasswordToken : hashedToken,
    forgotPasswordExpiry: { $gt:Date.now() }
  })
  if (!user) {
    throw new ApiError(489, "Token is invalid or expired");
  }
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = 
  req.cookie.refreshToken || req.body.refreshToken;
  if(!incomingToken){
     throw new ApiError(401, "Unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id)
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if(incomingToken!==user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };
    const{accessToken,refreshToken: newrefreshToken} = generateAccessAndRefreshTokens();
    user.refreshToken = newrefreshToken;
    await user.save();

  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User does not exists", []);
  }

  const{unHashedToken,hashedToken,tokenExpiry} =
  user.generateTemporaryToken();
  user.forgotPasswordToken = unHashedToken;
  user.forgotPasswordExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

   await sendEmail({
    email: user?.email,
    subject: "Password reset request",
    mailgenContent: forgotPasswordMailgenContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id",
      ),
    );
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {oldpassword,newPassword} = req.body;
  const user = await User.findById(req.user?._id);

  if(!user){
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save({validateBeforeSave:false});
   return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});
export {
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
};
