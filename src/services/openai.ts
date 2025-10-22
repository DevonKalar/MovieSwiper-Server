import OpenAI from "openai";
import { config } from "../config/env.js";

class OpenAIService {
	private client: OpenAI;

	constructor() {
		this.client = new OpenAI({
			apiKey: config.apiKeys.openai,
		})
	}

	async createResponse(input: string, instructions?: string, previous_response_id?: string) {
		console.log('Creating response with input:', input, 'and previousResponseID:', previous_response_id);
		const response = await this.client.responses.create({
			model: 'gpt-4o',
			input,
			instructions,
			previous_response_id,
		});
		return response;
	}

	async retrieveResponse(responseId: string) {
		const response = await this.client.responses.retrieve(responseId);
		return response;
	}
}

export const openaiService = new OpenAIService();