import { Router } from 'express';
import { openaiService } from '../services/openai.js';
import * as z from 'zod';
import { validateReqBody } from '../middleware/validate.js';
import { validateReqParams } from '../middleware/validate.js';

const openaiRouter = Router();

const responseSchema = z.object({
	input: z.string().min(2).max(1000),
	instructions: z.string().min(2).max(1000).optional(),
	previous_response_id: z.string().optional(),
});

openaiRouter.post('/response', validateReqBody(responseSchema), async (req, res) => {
	const { input, instructions, previous_response_id } = req.body;

  try {
		const response = await openaiService.createResponse(input, instructions, previous_response_id);
		res.json(response);
	} catch (error) {
		console.error('Error creating OpenAI response:', error);
		res.status(500).json({ error: 'Failed to create response' });
	}
});

const retrieveSchema = z.object({
  id: z.string().min(1),
});

openaiRouter.get('/response/:id', validateReqParams(retrieveSchema), async (req, res) => {
	const { id } = req.params;
	try {
		const response = await openaiService.retrieveResponse(id as string);
		res.json(response);
	} catch (error) {
		console.error('Error retrieving OpenAI response:', error);
		res.status(500).json({ error: 'Failed to retrieve response' });
	}
});

export default openaiRouter;
