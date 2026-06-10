import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvailableUserRoles, UserRolesEnum } from "../utils/constants.js";

const getNotes  = asyncHandler(async (req,res) => {
  const {projetId} = req.params; 
  const project = await Project.findById(projetId);
  if(!project){
    throw new ApiError(404,"project not found")
  }


  const notes = await ProjectNote.findById({
    project: new mongoose.Types.ObjectId(projetId)
  }).populate("createdBy" , "username fullName avatar")
  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});
const getNoteById = asyncHandler (async (req, res) => {
  const{ noteId } = req.params;

  const note = await ProjectNote.findById(noteId).populate("createdBy" , "username fullName avatar");

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note fetched successfully"));
});
const createNote = asyncHandler (async (req, res) => {
  const {projetId} = req.params;
  const {content} = req.body;

  const project = await ProjectNote.findById(projetId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  const note = await ProjectNote.create({
    project: new mongoose.Types.ObjectId(projetId),
    content,
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });

  const populateNote = await ProjectNote.findById(req.note._id).populate("createdBy",
    "username fullName avatar",);
  return res
    .status(201)
    .json(new ApiResponse(201, populatedNote, "Note created successfully"));
});
const updateNote = asyncHandler (async (req, res) => {
  const { noteId } = req.params;
  const { content } = req.body;

  const existingnote = await ProjectNote.findById(noteId);
  if(!existingnote){
    throw new ApiError(404, "Note not found");
  }

  const note = await ProjectNote.findByIdAndUpdate(
    noteId,
    {content},
    {new:true},
  ).populate("createdBy", "username fullName avatar");

  return res
    .status(200)
    .json(new ApiResponse(200,note, "Note updated successfully"));

});
const deleteNote = asyncHandler (async (req, res) => {
  const { noteId } = req.params;
  const note = await ProjectNote.findByIdAndDelete(noteId);
  if(!note){
    throw new ApiError(404, "Note not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note deleted successfully"));
  
});

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
