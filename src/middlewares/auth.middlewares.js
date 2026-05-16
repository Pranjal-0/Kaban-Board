import {asyncHandler} from "../utils/async-handler.js";
import {ApiError} from "../utils/api-errors.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import dotenv from "dotenv";
dotenv.config()



export const isLoggedIn = asyncHandler(async(req, res, next)=>{
        const accessToken = req.cookies?.accessToken;

       if(!accessToken){
        throw new ApiError(455,"Auth failed: NO TOKEN" );
       }

       const decoded = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
       console.log("DECODE: ", decoded);


       if(!decoded){
        throw new ApiError(405,"error in token")

       }

       const user = await User.findById(decoded._id).select("-password");
       if(!user){
        throw new ApiError(405, "Unauthorized access");

       }
    

       req.user = user;
       
  

       next();

})