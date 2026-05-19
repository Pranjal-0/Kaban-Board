import mongoose from "mongoose";
import { Project } from "../models/project.models";
import { User } from "../models/user.models";
import { ApiError } from "../utils/api-errors";
import { ApiResponse } from"../utils/api-response";
import { ProjectMember } from"../models/projectmember.models.js"
import { asyncHandler } from "../utils/async-handler";
import {AvailableUserRoles,UserRolesEnum} from "../utils/constants.js";
const getProjects = asyncHandler(async (req,res) => {
  const projects =  await ProjectMember.aggregate([
    {
      $match:{
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup:{
        from:"projects",
        localField:"project",
        foreignField:"_id",
        as:"project",
        pipeline:[
          {
            $lookup:{
              from:"projectmembers",
              localField:"_id",
              foreignField:"project",
              as:"projectmember",
            },
          },
          {
            $addFields:{
              members:{
                $size:"$projectmember",
              },
            },
          },
        ],
      },
    },
    {
      $unwind:"$project",
    },
    {
      $project:{
        Project:{
          _id : 1, //In MongoDB $project, 1 means "Show it" and 0 means "Hide it".
          name : 1,
          description : 1,
          members : 1,
          createdAt : 1,
          createdBy : 1,
        },
        role : 1,
        _id : 0,  
      },
    },
  ]);
  return res
  .status(200)
  .json(new ApiResponse(200, projects, "Projects fetched successfully"));
},
);
const getProjectById = asyncHandler(async (req,res) => {
  const { ProjectId } = req.params;
  const project = await Project.findById(ProjectId) ;
  if(!project){
    throw new ApiError(404, "Project not found");
  } 
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"))
})
const createProject = asyncHandler(async (req,res) => {
  const { name,description } = req.body;
  const project = await Project.create({
    name,
    description,
    createdBy: new mongoose.Types.ObjectId(req.user._id)

  })
  await ProjectMember.create({
    user: new mongoose.Types.ObjectId(req.user._id),
    project: new mongoose.Types.ObjectId(project._id),
    role: UserRolesEnum.ADMIN 
  })
return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});
const updateProject = asyncHandler(async (req,res) => {
  const { name,description } = req.body;
  const { projectId } = req.params;

  const project = await Project.findByIdAndUpdate(projectId,
    {
      name,
      description,
    },
    {new:ture}
  );

  if(!project){
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
})
const deleteProject = asyncHandler(async (req,res) => {
  const { projectId } = req.params;
  const project = await Project.findByIdAndDelete(projectId);
  if(!projectId){
    throw new ApiError(404, "Project not found");
  }  
  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project deleted successfully"));

})
const getProjectMembers = async (req, res) => {
  // get project members
};

const addMemberToProject = async (req, res) => {
  // add member to project
};

const deleteMember = async (req, res) => {
  // delete member from project
};

const updateMemberRole = async (req, res) => {
  // update member role
};

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
