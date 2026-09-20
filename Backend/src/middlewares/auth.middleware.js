import mongoose from "mongoose";
import {asyncHandler} from "../utils/async-handler.js";
import {ApiError} from "../utils/api-error.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import {ProjectMember} from "../models/projectmember.models.js"


// Helper: Standardized token extraction
const extractToken = (req) => {
  return (
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "").trim()
  );
};
// Standard excluded fields string for database user queries
const SENSITIVE_FIELDS =
  "-password -refreshToken -emailVerificationToken -emailVerificationExpiry";


export const verifyJwt = asyncHandler(async (req,res,next) => {
    const token = extractToken(req);
    if(!token){
        throw new ApiError(401,"Token is missing in middleware")
    }
    try {
        const decodedToken =  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select(SENSITIVE_FIELDS);
        if(!user){
            throw new ApiError(401,"Invalid access token or User no longer exists")
        }
        req.user = user;
        next();
    } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
}
});

export const getLoggedInUserOrIgnore = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return next();
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    const user = await User.findById(decodedToken?._id).select(SENSITIVE_FIELDS);

    if (user) {
      req.user = user;
    }
    
    return next();
  } catch (error) {
    // Fail silently: proceed as an unauthenticated guest
    return next();
  }
});

export const validateProjectPermission = (roles=[])=>{
    return asyncHandler(async(req,res,next)=>{
        const {projectId} = req.params;
        if(!projectId){
            throw new ApiError(400,"missing Id");
        }
        const member = await ProjectMember.findOne({
            project:projectId,
            user:req.user?._id
        })
        if (!member) {
        throw new ApiError(403, "You are not a member of this project");
        }
        req.projectMember = member;
        next();
  });
};