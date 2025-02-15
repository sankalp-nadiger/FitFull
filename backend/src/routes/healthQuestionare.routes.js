// routes/healthQuestionnaireRoutes.js
import express from 'express';
import healthQuestionnaireController from '../controllers/healthQuestionnaireController.js';
import { user_verifyJWT, user_verifyJWTverifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Save health questionnaire data
router.post('/save-questionnaire', user_verifyJWT, healthQuestionnaireController.saveQuestionnaire);

// Get health questionnaire data
router.get('/get-questionnaire', user_verifyJWT, healthQuestionnaireController.getQuestionnaire);

export default router;