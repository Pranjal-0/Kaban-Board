import mongoose, { Schema } from "mongoose";
import { UserStatusEnum, AvailableUserStatus } from "../utils/constants.js"; // Import your enums/constants

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    //   required: [true, "Project reference is required"],
      required: true, // Ensure that the project reference is required
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: AvailableUserStatus, 
      default: UserStatusEnum.TODO,
    },
    attachments: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          mimeType: {
            type: String,
          },
          size: {
            type: Number,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);