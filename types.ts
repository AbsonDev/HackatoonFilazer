// SDUI Schema Definitions

export type ComponentType = 'button' | 'input_text' | 'input_cpf' | 'text_block' | 'image';

export type ActionType = 'goto_screen' | 'enqueue' | 'restart';

export interface UIComponent {
  id: string;
  type: ComponentType;
  label?: string; // For buttons or labels
  placeholder?: string; // For inputs
  value?: string; // For text blocks
  action?: ActionType;
  target?: string; // Target screen ID or Queue ID logic
  primary?: boolean; // Styling hint
}

export interface Screen {
  id: string;
  title: string;
  subtitle?: string;
  type: 'menu' | 'form' | 'success' | 'info';
  components: UIComponent[];
}

export interface Flow {
  flow_id: string;
  location_id: string;
  start_screen_id: string;
  screens: Record<string, Screen>;
}

// Mock Entities for the Provider
export interface ServiceEntity {
  id: string;
  name: string;
  category: string;
}

export interface QueueEntity {
  id: string;
  name: string;
  location: string;
}