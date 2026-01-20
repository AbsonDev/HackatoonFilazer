import { GoogleGenAI, Type } from "@google/genai";
import { Flow } from '../types';
import { INITIAL_FLOW } from '../constants';

const MODEL_NAME = "gemini-3-flash-preview";

// We define the Schema for structured output
const FlowSchema = {
  type: Type.OBJECT,
  properties: {
    flow_id: { type: Type.STRING },
    location_id: { type: Type.STRING },
    start_screen_id: { type: Type.STRING },
    screens: {
      type: Type.OBJECT,
      description: "A map of screen IDs to Screen objects",
      // Note: In dynamic schema generation for maps, we often rely on the model understanding
      // or define it as an object with arbitrary keys if the SDK supports it strictly.
      // For this implementation, we will trust the prompt to enforce the Record<string, Screen> structure
      // and parse the JSON string, as strict schema for dynamic keys can be verbose.
    }
  },
  required: ["flow_id", "start_screen_id", "screens"]
};

export const generateFlowFromPrompt = async (userPrompt: string): Promise<Flow> => {
  if (!process.env.API_KEY) {
    console.error("API Key missing");
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are an expert solution architect for 'Filazero Studio', a flow orchestration engine.
    Your job is to generate a valid JSON configuration for a kiosk application based on the user's description.

    The JSON must strictly follow this TypeScript Interface:
    
    type ComponentType = 'button' | 'input_text' | 'input_cpf' | 'text_block' | 'image';
    type ActionType = 'goto_screen' | 'enqueue' | 'restart';

    interface UIComponent {
      id: string;
      type: ComponentType;
      label?: string; // Mandatory for buttons
      placeholder?: string; // For inputs
      value?: string; // For text blocks
      action?: ActionType; // Mandatory for buttons
      target?: string; // The ID of the next screen (if goto_screen) or empty if restart.
      primary?: boolean;
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
      screens: Record<string, Screen>;
    }

    RULES:
    1. Ensure all 'target' IDs actually exist as keys in the 'screens' object.
    2. Always include a way to restart the flow on the final screens.
    3. Use 'input_cpf' for identification steps.
    4. Create logical flows (Welcome -> Selection -> Action -> Success).
    5. Return ONLY the JSON object. No markdown code blocks.
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
    // Fallback to initial flow in case of total failure to prevent crash
    return INITIAL_FLOW;
  }
};