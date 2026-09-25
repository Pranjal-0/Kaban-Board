import mongoose from "mongoose";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import {ProjectNote } from "../models/note.models.js";
import { Project } from "../models/project.models.js";



const getNotes = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    // 1. Verify the project exists
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // 2. Fetch all notes for the project (chained cleanly)
    const notes = await ProjectNote.find({ project: projectId })
        .sort({ createdAt: -1 })
        .populate("createdBy", "username fullName avatar");

    // 3. Return response (notes will be [] if no notes exist yet)
    return res
        .status(200)
        .json(new ApiResponse(200, notes, "Notes retrieved successfully"));
});

const createNote = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { content } = req.body
    
    if(!projectId){
        throw new ApiError (401,"projectId missing");
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }
    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found");
    }
    const note = await ProjectNote.create({
        project: projectId,
        content,
        createdBy: req.user._id
    })
    const populatedNote = await note.populate(
        "createdBy",
        "username fullName avatar"
        );
    return res
        .status(201)
        .json(new ApiResponse(201, populatedNote, "Note created successfully"));


//   const notes = await ProjectNote.find({
//     project: new mongoose.Types.ObjectId(projectId),
//   }).populate("createdBy", "username fullName avatar");
});

const updateNote = asyncHandler(async (req, res) => {
    const {noteId} = req.params;
    const {content} = req.body;
    if(!noteId){
        throw new ApiError (401,"noteId missing");
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }
    //why not this
    //     const note = await ProjectNote.findById(noteId);
    //     const note = await ProjectNote.findOne({ 
    // _id: noteId, 
    // createdBy: req.user._id 
    // });

    // if (!note) {
    // throw new ApiError(404, "Note not found or unauthorized");
    // }

    const note = await ProjectNote.findById(noteId);
    if (!note) {
        throw new ApiError(404, "Note not found");
    }
    if (note.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this note");
  }
    note.content = content;
    await note.save();
    const updatedNote = await note.populate(
        "createdBy",
        "username fullName avatar"
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
    //     const updateNote = asyncHandler(async (req, res) => {
    //     const { noteId } = req.params;
    //     const { content } = req.body;

    //     // 1. Validate incoming content
    //     if (!content || content.trim() === "") {
    //         throw new ApiError(400, "Content is required to update note");
    //     }

    //     // 2. Find, verify ownership, update, and populate in one atomic query
    //     const updatedNote = await ProjectNote.findOneAndUpdate(
    //         { _id: noteId, createdBy: req.user._id }, // Note ID AND owner check
    //         { content },
    //         { new: true, runValidators: true }
    //     ).populate("createdBy", "username fullName avatar");

    //     // 3. If null, either the note doesn't exist or req.user isn't the owner
    //     if (!updatedNote) {
    //         throw new ApiError(
    //             404, 
    //             "Note not found or you do not have permission to update it"
    //         );
    //     }

    //     // 4. Return success response
    //     return res
    //         .status(200)
    //         .json(new ApiResponse(200, updatedNote, "Note updated successfully"));
    // });
});

// const deleteNote = asyncHandler(async (req, res) => {
//     const {noteId} = req.params;
//     if(!noteId){

//     }
//     const note = await ProjectNote.findByIdAndDelete(noteId)
//     if (!note) {
//     throw new ApiError(404, "Note not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, note, "Note deleted successfully"));
// });
const deleteNote = asyncHandler(async (req, res) => {
    const { noteId } = req.params;

    // 1. Fetch the note first
    const note = await ProjectNote.findById(noteId);

    // 2. Check existence
    if (!note) {
        throw new ApiError(404, "Note not found");
    }

    // 3. Authorization Check: Ensure req.user owns this note
    if (note.createdBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this note");
    }

    // 4. Delete the document
    await note.deleteOne();

    // 5. Return success response
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Note deleted successfully"));

    // Why await note.deleteOne()?

// Once you've fetched the note document and verified ownership, calling .
// deleteOne() directly on the document instance removes it cleanly from 
// MongoDB without needing another findByIdAndDelete lookup.
});

const getNoteById = asyncHandler(async (req, res) => {
    const {npteId} = req.params;
    const note = await ProjectNote.findById(noteId).populate(
    "createdBy",
    "username fullName avatar"
  );
    if (!note) {
        throw new ApiError(404, "Note not found");
    }
    return res
    .status(200)
    .json(new ApiResponse(200, note, "Note retrieved successfully"));
});


export { createNote, deleteNote, getNoteById, getNotes, updateNote };
