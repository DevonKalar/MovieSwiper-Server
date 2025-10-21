declare module 'openai' {
  interface OpenAIConfig {
    apiKey?: string;
    [key: string]: any;
  }
  
  class OpenAI {
    constructor(config?: OpenAIConfig);
    [key: string]: any;
  }
  
  export default OpenAI;
}