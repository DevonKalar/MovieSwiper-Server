import { Router } from 'express';
import { openaiService } from '../services/openai.js';

const openaiRouter = Router();

openaiRouter.post('/response', async (req, res) => {
	const { input, instructions, previous_response_id } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'Input is required' });
  }

	try {
		const response = await openaiService.createResponse(input, instructions, previous_response_id);
		res.json(response);
	} catch (error) {
		console.error('Error creating OpenAI response:', error);
		res.status(500).json({ error: 'Failed to create response' });
	}
});

openaiRouter.get('/response/:id', async (req, res) => {
	const { id } = req.params;
	try {
		const response = await openaiService.retrieveResponse(id);
		res.json(response);
	} catch (error) {
		console.error('Error retrieving OpenAI response:', error);
		res.status(500).json({ error: 'Failed to retrieve response' });
	}
});

export default openaiRouter;
