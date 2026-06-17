import { Router } from "express";
import {
  createSubTask,
  createTask,
  deleteSubTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateSubTask,
  updateTask,
} from "../controllers/task.controllers.js";
import { verifyJWT,validateProjectPermission } from "../middlewares/auth.middlewares.js"
import { AvailableUserRoles,UserRolesEnum } from "../utils/constants.js"
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createTaskValidator,
  updateTaskValidator,
} from "../validators/index.js";

const router = Router()

router.use(verifyJWT);

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRoles),getTasks)
    .post(validateProjectPermission([
        UserRolesEnum.ADMIN,
        UserRolesEnum.PROJECT_ADMIN
    ]),
    upload.array("attachments"),
    createTaskValidator(),
    validate,
    createTask,
    )
    .delete(
    validateProjectPermission([
      UserRolesEnum.ADMIN,
      UserRolesEnum.PROJECT_ADMIN,
    ]),
    deleteTask,
  );


router
    .route("/:projectId/t/:taskId/subtasks")
    .get(validateProjectPermission(AvailableUserRoles),updateSubTask)
    .delete(
        validateProjectPermission([
            UserRolesEnum.ADMIN,
            UserRolesEnum.PROJECT_ADMIN,
        ]),
        deleteSubTask
    );
export default router