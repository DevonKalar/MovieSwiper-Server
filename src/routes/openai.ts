import { Router } from "express";
import type { Request, Response } from "express";
import { validateReqBody, validateReqParams } from "@middleware/validate.js";
import { responseSchema, retrieveSchema } from "@/models/openai.js";
import type { ResponseInput, RetrieveParams } from "@/models/openai.js";
import { openaiClient } from "@/clients/openai.js";

const openaiRouter = Router();

openaiRouter.post(
  "/response",
  validateReqBody(responseSchema),
  async (req: Request, res: Response) => {
    const { input, instructions, previous_response_id } =
      req.validatedBody as ResponseInput;
    const response = await openaiClient.createResponse(
      input,
      instructions,
      previous_response_id,
    );
    res.json(response);
  },
);

openaiRouter.get(
  "/response/:id",
  validateReqParams(retrieveSchema),
  async (req: Request, res: Response) => {
    const { id } = req.validatedParams as RetrieveParams;
    const response = await openaiClient.retrieveResponse(id);
    res.json(response);
  },
);

export default openaiRouter;
