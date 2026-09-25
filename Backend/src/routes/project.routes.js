import { Router } from "express";
import {
    addMemberToProject,
    createProject,
    deleteMember,
    deleteProject,
    getProjectById,
    getProjectMembers,
    getProjects,
    updateMemberRole,
    updateProject,
}from "../controllers/project.controllers.js"

import { 
    validateProjectPermission,
    verifyJwt
} from "../middlewares/auth.middleware.js"

import { validate } from "../middlewares/validators.middlewares.js";
import { AvailableUserRoles,UserRolesEnum } from "../utils/constants";
import { addMemberToProjectValidator,createProjectValidator } from "../validators";


const router = Router();

router.use(verifyJwt);



router 
    .route("/")
    .get(getProjects)
    .post(createProject(),validate,createProject)

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRoles),getProjectById)
    .put(validateProjectPermission([UserRolesEnum.ADMIN]),
        createProjectValidator(),
        validate,
        updateProject
    )
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteProject)

router  
    .route("/projectId/members/:userId")
    .put(validateProjectPermission([UserRolesEnum.ADMIN]),updateMemberRole)
    .delete(validateProjectPermission([UserRolesEnum.ADMIN]),deleteMember)
export default router;