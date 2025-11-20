import { Router } from 'express';
import { openaiService } from '@services/openai.js';
import { validateReqBody, validateReqParams } from '@middleware/validate.js';
import {
  responseSchema,
  retrieveSchema,
  type ResponseInput,
  type RetrieveParams,
  type OpenAIResponse,
  type OpenAIErrorResponse,
} from '@/types/openai.js';

/*
 * OpenAI routes for creating and retrieving AI-generated responses.
 */

const openaiRouter = Router();

openaiRouter.post('/response', validateReqBody(responseSchema), async (req, res) => {
    const { input, instructions, previous_response_id } =
      req.validatedBody as ResponseInput;

    try {
      const response = await openaiService.createResponse(
        input,
        instructions,
        previous_response_id
      );
      res.json(response);
    } catch (error) {
      console.error('Error creating OpenAI response:', error);
      const errorResponse: OpenAIErrorResponse = {
        error: 'Failed to create response',
      };
      res.status(500).json(errorResponse);
    }
  }
);

openaiRouter.get( '/response/:id', validateReqParams(retrieveSchema), async (req, res) => {
    const { id } = req.validatedParams as RetrieveParams;
    try {
      const response = await openaiService.retrieveResponse(id);
      res.json(response);
    } catch (error) {
      console.error('Error retrieving OpenAI response:', error);
      const errorResponse: OpenAIErrorResponse = {
        error: 'Failed to retrieve response',
      };
      res.status(500).json(errorResponse);
    }
  }
);

export default openaiRouter;
