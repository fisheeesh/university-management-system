import express from "express";
import subjectsRouter from "./subjects"

const router = express.Router();

router.use("/api/v1", subjectsRouter)

export default router;