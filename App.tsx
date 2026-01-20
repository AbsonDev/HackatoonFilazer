import React, { useState, useEffect } from 'react';
import { FlowEditor } from './components/FlowEditor';
import { KioskSimulator } from './components/KioskSimulator';
import { INITIAL_FLOW } from './constants';
import { Flow } from './types';

function App() {
  // Initialize flow from localStorage if available, otherwise use default
  const [currentFlow, setCurrentFlow] = useState<Flow>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('filazero_flow');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved flow", e);
        }
      }
    }
    return INITIAL_FLOW;
  });

  // Persist flow changes to localStorage
  useEffect(() => {
    localStorage.setItem('filazero_flow', JSON.stringify(currentFlow));
  }, [currentFlow]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* Left Panel: The Studio (Admin/Provider View) */}
      <div className="w-full md:w-[450px] lg:w-[500px] h-1/2 md:h-full z-10 shadow-2xl flex-shrink-0">
        <FlowEditor 
          flow={currentFlow} 
          onFlowUpdate={setCurrentFlow} 
        />
      </div>

      {/* Right Panel: The Kiosk (End User/Location View) */}
      <div className="flex-1 h-1/2 md:h-full relative bg-[url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full h-full">
            <KioskSimulator flow={currentFlow} />
        </div>
      </div>
    </div>
  );
}

export default App;