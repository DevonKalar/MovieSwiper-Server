import { Router } from 'express';
import { validateReqBody, validateReqParams } from '@middleware/validate.js';
import { responseSchema, retrieveSchema } from '@/models/openai.js';
import * as openaiController from '@/controllers/openai.js';

/*
 * OpenAI routes for creating and retrieving AI-generated responses.
 */

const openaiRouter = Router();

openaiRouter.post( '/response', validateReqBody(responseSchema), openaiController.createResponse);
openaiRouter.get( '/response/:id', validateReqParams(retrieveSchema), openaiController.retrieveResponse);

export default openaiRouter;
