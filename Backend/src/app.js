import express from "express";

const app = express();
import healthCheck from "./routes/healthcheck.routes.js"
 
app.use("/api/v1/healthcheck", healthCheck);

export default app;