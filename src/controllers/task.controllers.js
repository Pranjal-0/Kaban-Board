import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { Subtask } from "../models/subtask.models.js";
import { Task } from "../models/task.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { UserRolesEnum } from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
  const {projectId} = req.params;
  const project = await Project.findById(projectId);
  if(!project){
    throw new ApiError(404, "Project not found");
  }
  const task = await Task.find({
    project: new mongoose.Types.ObjectId(projectId),
  }).populate("assigneTo","username fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
 
});
const createTask = asyncHandler(async (req, res) => {
  const { title , description , assignedTo , status } = req.body;
  const { projectId } = req.params;
  // console.log(assignedTo)
  if(!projectId){
    throw new ApiError(404, "Project not found");
  }

  const files = req.file || [];

  const attachments = files.map((file)=>{
    return {
      url: `${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype: file.mimetype,
      size:file.size,
    };

  });
  
  const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo ?
      new mongoose.Types.ObjectId(assignedTo) 
      :undefined,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),//req.user._id  ye idar kaha se aya hai
    attachments,

  })
  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});
const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetched successfully"));
});
const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, assignedTo } = req.body;

  console.log("Update task request body:", req.body);

  const existingTask = await Task.findById(taskId);

  if(!existingTask){
    throw new ApiError(404, "Task not found");
  }


  const existingTask = existingTask.attachments || [];

  const files = req.files || [];

  const newAttachments = files.map((file)=>{
    return{
      url:`${process.env.SERVER_URL}/images/${file.originalname}`,
      mimetype:file.mimetype,
      size:file.size,
    }
  })

  const allAttachments = [...existingTask,...newAttachments];
  // const allAttachments = existingAttachments.concat(newAttachments);
  const   updateFields = {
    attachments: allAttachments,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  }

  if(title !== undefined) updateFields.title = title;
  if(description !== undefined) updateFields.description = description;
  if(status !== undefined) updateFields.status = status;

  if(assignedTo !== undefined) {
    updateFields.assignedTo = assignedTo
    ? new mongoose.Types.ObjectId(assignedTo)
    : undefined;
  } else if (existingTask.assignedTo) {
      updateFields.assignedTo = existingTask.assignedTo
  }

  console.log("Update fields:", updateFields);

  const task = await Task.findByIdAndUpdate(taskId,updateFields,{new:true})
  .populate("assignedTo","username fullname avatar")

  console.log("Updated task:", task);

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});
const deleteTask = asyncHandler(async (req, res) => {
  const {taskId} = req.params;
  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task deleted successfully"));

});
const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const subTask = await Subtask.create({
    title,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  })


return res
    .status(201)
    .json(new ApiResponse(201, subTask, "Sub task created successfully"));
});
const updateSubTask = asyncHandler(async (req, res) => {
  const {subTaskId} = req.params;
  const { title , isCompleted } = req.body;
  
  let subTask = await Subtask.findById(subTaskId);

  if (!subTask) {
    throw new ApiError(404, "Sub task not found");
  }

  subTask = await SubTask.findByIdAndUpdate(
    subTaskId,
    {
      title: [UserRolesEnum.ADMIN, UserRolesEnum.PROJECT_ADMIN].includes(
        req?.user?.role,
      )
        ? title
        : undefined, // only allow admins and project admins to update the title
      isCompleted,
    },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, subTask, "Sub task updated successfully"));
});
const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;
  const subTask = await Subtask.findByIdAndDelete(subTaskId);

  if (!subTask) {
    throw new ApiError(404, "Sub task not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subTask, "Sub task deleted successfully"));
});


export {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
};
