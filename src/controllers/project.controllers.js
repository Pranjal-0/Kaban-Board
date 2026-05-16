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
          _id : 1,
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
)
const getProjectById = async (req, res) => {
  // get project by id
};

const createProject = async (req, res) => {
  // create project
};

const updateProject = async (req, res) => {
  // update project
};

const deleteProject = async (req, res) => {
  // delete project
};

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
