import mongoose from "mongoose";
import { ProjectNote } from "../models/note.models.js";
import { Project } from "../models/project.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getNotes  = asyncHandler(async (req,res) => {
  const {projetId} = req.params; 
  const project = await Project.findById(projetId);
  if(!project){
    throw new ApiError(404,"project not found")
  }


  const notes = await ProjectNote.findById({
    project: new mongoose.Types.ObjectId(projetId)
  }).populate()
  
});

const getNoteById = async (req, res) => {
  // get note by id
};

const createNote = async (req, res) => {
  // create note
};

const updateNote = async (req, res) => {
  // update note
};

const deleteNote = async (req, res) => {
  // delete note
};

export { createNote, deleteNote, getNoteById, getNotes, updateNote };
