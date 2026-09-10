import mongoose,{Schema} from "mongoose";

const subtaskSchema = new Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    task:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Task",
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    iscompleted:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

export const Subtask = mongoose.model("Subtask", subtaskSchema);