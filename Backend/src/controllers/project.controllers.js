import mongoose, { mongo } from "mongoose";
import { asyncHandler } from "../utils/async-handler";
import { ApiError } from "../utils/api-error";
import { ApiResponse } from "../utils/api-response";
import { ProjectMember } from "../models/projectmember.models.js";
import { Project } from "../models/project.models.js";
import {User} from "../models/user.models.js"
import { UserRolesEnum,AvailableUserRoles } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  
  const projects = await ProjectMember.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project",
        pipeline: [
          {
            $lookup: {
              from: "projectmembers",
              localField: "_id",
              foreignField: "project",
              as: "projectmembers",
            },
          },
          {
            $addFields: {
              members: {
                $size: "$projectmembers",
              },
            },
          },
        ],
      },
    },
    {
      $unwind: "$project",
    },
    {
      $project: {
        project: {
          _id: 1,
          name: 1,
          description: 1,
          members: 1,
          createdAt: 1,
          createdBy: 1,
        },
        role: 1,
        _id: 0,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const {projectId} = req.params;
  const project = await Project.findById(projectId);
  if(!project){
    throw new ApiError(404, "Project not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project fetched successfully"));
});

const createProject = asyncHandler(async (req, res) => {
    const {name,description} = req.body;

    if(!name||name.trim()===""||!description||description.trim()===""){
      throw new ApiError(400,"Both project name and description are required");
    }

    const existingProject = await Project.findOne({name:trim()});
    if(existingProject){
      throw new ApiError(409,"A project with this name already exists");
    } 
    const project = await project.create({
      name:name.trim(),
      description:description.trim(),
      createdBy:req.user._id,
    });
    await ProjectMember.create({
      user:req.user._id,
      description:description.trim(),
      role: UserRolesEnum.ADMIN,
    })

    return res
      .status(201)
      .json(new ApiResponse(201,project,"Project created successfully"));
});

const updateProject = asyncHandler(async (req, res) => {
  const {name,description} = req.body;
  const {projectId} = req.params;

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      name,
      description,
    },
    {new :true},
  );

  if(!project){
    throw new ApiError(404,"Project not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200,project,"project updated successfully"))

});

const deleteProject = asyncHandler(async (req, res) => {
  const {projectId} = req.params;

  const project = await Project.findByIdAndDelete(projectId);
  if(!project){
    throw new ApiResponse(404,"Project not found");
  }
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const {email,username,role} = req.body;
  const {projectId} = req.params;
  const user = await User.findOne({
    $or:[{username},{email}],
  });
  if(!user){
    throw new ApiError(404,"user does note exist")
  }

  await ProjectMember.findOneAndUpdate(
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId)
    },
    {
      user: new mongoose.Types.ObjectId(user._id),
      project: new mongoose.Types.ObjectId(projectId),
      role:role,
    },
    {
      new:true,
      upsert:true,
    }
  );

  return res
    .status(201)
    .json(new ApiResponse(201,{},"Project member added successfully"))
});

const getProjectMembers = asyncHandler(async (req, res) => {

});

const updateMemberRole = asyncHandler(async (req, res) => {

});

const deleteMember = asyncHandler(async (req, res) => {
  const {projectId,userId} = req.params;

  let projectMember = await ProjectMember.findOne({
    project: new mongoose.Types.ObjectId(projectId),
    user: new mongoose.Types.ObjectId(userId),
  });
  if(!projectMember){
    throw new ApiError(404,"project member not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        projectMember,
        "Project member deleted successfully",
      ),
    );
});

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
