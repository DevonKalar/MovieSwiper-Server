import type { Request, Response } from 'express';
import { openaiClient } from '@/clients/openai.js';
import type { ResponseInput, RetrieveParams } from '@/models/openai.js';

export async function createResponse(
  req: Request,
  res: Response
) {
  const { input, instructions, previous_response_id } =
    req.validatedBody as ResponseInput;

  try {
    const response = await openaiClient.createResponse(
      input,
      instructions,
      previous_response_id
    );
    res.json(response);
  } catch (error) {
    console.error('Error creating OpenAI response:', error);
    res.status(500).json({ error: 'Failed to create response' });
  }
}

export async function retrieveResponse(
  req: Request,
  res: Response
) {
  const { id } = req.validatedParams as RetrieveParams;
  try {
    const response = await openaiClient.retrieveResponse(id);
    res.json(response);
  } catch (error) {
    console.error('Error retrieving OpenAI response:', error);
    res.status(500).json({ error: 'Failed to retrieve response' });
  }
}
