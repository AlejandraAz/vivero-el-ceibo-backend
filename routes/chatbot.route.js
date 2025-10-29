import getResponse from "../controllers/chatbot.controller.js";
import { Router } from "express";

const router = Router();

router.post('/query',getResponse);

export default router;