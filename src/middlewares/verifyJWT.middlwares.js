import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ProjectMember } from "../models/projectmember.models.js";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodeToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});


export const validateProjectPermission = (roles = [] )=>{
  return asyncHandler(async (req,res,next) => {
    const {projectId}  = req.params;

    if(!projectId){
      throw new ApiError(400, "Project id is missing");
    }
    const Project = await ProjectMember.findOne({
      project : new mongoose.Types.ObjectId(projectId),
      user : new mongoose.Types.ObjectId(req.user._id)
    })
    if(!Project){
      throw new ApiError(404, "Project not found");
    }
    const givenRole = Project?.role;
    req.user.role = givenRole;
    
    if (!roles.includes(givenRole)) {
      throw new ApiError(
        403,
        "You do not have permission to perform this action",
      );
    }
    next();
    
  })

};