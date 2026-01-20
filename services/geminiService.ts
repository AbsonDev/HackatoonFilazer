import { GoogleGenAI, Type } from "@google/genai";
import { Flow } from '../types';
import { INITIAL_FLOW, MOCK_SERVICES, MOCK_QUEUES } from '../constants';

const MODEL_NAME = "gemini-3-flash-preview";

export const generateFlowFromPrompt = async (userPrompt: string): Promise<Flow> => {
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Prepare context strings
  const servicesContext = MOCK_SERVICES.map(s => `- ID: "${s.id}", Name: "${s.name}" (${s.category})`).join('\n');
  const queuesContext = MOCK_QUEUES.map(q => `- ID: "${q.id}", Name: "${q.name}" (${q.location})`).join('\n');

  const systemInstruction = `
    You are an expert solution architect for 'Filazero Studio', a flow orchestration engine.
    Your job is to generate a valid JSON configuration for a kiosk application based on the user's description.

    ### CRITICAL: SYSTEM CONTEXT
    You must ONLY use the following entity IDs when creating logical connections (targets, queue references, etc).
    Do not invent IDs for Services or Queues.
    
    **Available Services:**
    ${servicesContext}

    **Available Queues:**
    ${queuesContext}

    ### DATA STRUCTURE (TypeScript Interface)
    
    type ComponentType = 'button' | 'input_text' | 'input_cpf' | 'text_block' | 'image';
    type ActionType = 'goto_screen' | 'enqueue' | 'restart';

    interface ValidationRule {
      regex: string; // e.g., "^\\d{11}$" for CPF
      message: string;
    }

    interface UIComponent {
      id: string;
      type: ComponentType;
      label?: string; // Mandatory for buttons
      placeholder?: string; // For inputs
      value?: string; // For text blocks
      action?: ActionType; // Mandatory for buttons
      target?: string; // The ID of the next screen (if goto_screen) or empty if restart.
      primary?: boolean;
      validation?: ValidationRule; // Optional regex validation
    }

    interface Theme {
      primaryColor: string; // Hex code, e.g. #FF5733
      backgroundColor?: string;
    }

    interface Screen {
      id: string; // Must match the key in the screens object
      title: string;
      subtitle?: string;
      type: 'menu' | 'form' | 'success' | 'info';
      components: UIComponent[];
    }

    interface Flow {
      flow_id: string;
      location_id: string;
      start_screen_id: string; // Must exist in screens keys
      theme: Theme; // Define a brand color based on the context (e.g., Green for health, Blue for tech)
      screens: Record<string, Screen>;
    }

    ### RULES
    1. Ensure all 'target' IDs actually exist as keys in the 'screens' object.
    2. Always include a way to restart the flow on the final screens.
    3. Use 'input_cpf' for identification steps. Add validation regex "^\\d{11}$" for CPFs.
    4. Create logical flows (Welcome -> Selection -> Action -> Success).
    5. If the user asks for a specific service (e.g. "X-Ray"), route the button to a logic that leads to the queue ID "q_gen" or specific logic provided.
    6. Return ONLY the JSON object. No markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const parsedFlow = JSON.parse(text) as Flow;
    return parsedFlow;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return INITIAL_FLOW;
  }
};