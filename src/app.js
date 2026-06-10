import express from "express";
import cookieParser from "cookie-parser";


const app = express();

app.use(express.json());
app.use(cookieParser())



//router imports
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import noteRouter from "./routes/note.routes.js";



app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/project",projectRoutes);
app.use("/api/v1/notes", noteRouter);


export default app;