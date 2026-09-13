import mongoose,{Schema} from "mongoose";
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import crypto from "crypto"
dotenv.config()

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


userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10)    
})

userSchema.methods.isPasswordCoreect = async function (password) {
    return bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expireIn:process.env.EXPIRYACCESS_TOKEN_SECRET
        }
    )
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expireIn:process.env.EXPIRYREFRESH_TOKEN_SECRET
        }
    )
}

userSchema.methods.generateTempraryToken = function () {
    const unhashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(unhashedToken).digest("hex")
    const tokenExpiry = Date.now() + (20*60*1000)

    return{unhashedToken,hashedToken,tokenExpiry}
    
}



export const User = mongoose.model("User", userSchema);