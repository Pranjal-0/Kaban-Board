import mongoose,{Schema} from "mongoose";

const userSchema = new Schema({
    avatar:{
        url:String,
        localpath:String
    },
    default:{
        url:"https://placehold.co/600x400",
        localpath:empty,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: [true,"passowrd is required"]
    },
    forgotPasswordToken: {
        type: String,
    },
    forgotPasswordExpiry: {
        type: Date,
    },
    refreshToken: {
        type: String, 
    },
    emailVerificationToken: {
        type: String, 
    },
    emailVerificationExpiry: {
        type: Date, 
    }
},{timestamps:true})

export const User = mongoose.model("User", userSchema);