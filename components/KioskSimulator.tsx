import React, { useState, useEffect } from 'react';
import { Flow, Screen, UIComponent } from '../types';
import { ArrowLeft, CheckCircle, Smartphone } from 'lucide-react';

interface KioskSimulatorProps {
  flow: Flow;
}

export const KioskSimulator: React.FC<KioskSimulatorProps> = ({ flow }) => {
  const [currentScreenId, setCurrentScreenId] = useState<string>(flow.start_screen_id);
  const [history, setHistory] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});

  // Reset when flow changes completely
  useEffect(() => {
    setCurrentScreenId(flow.start_screen_id);
    setHistory([]);
    setInputs({});
  }, [flow.flow_id]);

  const currentScreen = flow.screens[currentScreenId];

  // Safety check if configuration is invalid
  if (!currentScreen) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500 p-8 text-center">
        <h3 className="font-bold text-lg">Configuration Error</h3>
        <p>Screen ID "{currentScreenId}" not found in flow.</p>
        <button 
          onClick={() => setCurrentScreenId(flow.start_screen_id)}
          className="mt-4 px-4 py-2 bg-red-100 rounded hover:bg-red-200"
        >
          Reset to Start
        </button>
      </div>
    );
  }

  const handleAction = (component: UIComponent) => {
    if (!component.action) return;

    if (component.action === 'goto_screen' && component.target) {
      setHistory((prev) => [...prev, currentScreenId]);
      setCurrentScreenId(component.target);
    } 
    else if (component.action === 'restart') {
      setHistory([]);
      setInputs({});
      setCurrentScreenId(flow.start_screen_id);
    }
    else if (component.action === 'enqueue') {
      // Simulate API call to backend to enqueue
      alert(`Simulating API Call:\nPOST /queue\nData: ${JSON.stringify(inputs, null, 2)}`);
      // Usually goes to a success screen defined in target, or restarts
      if (component.target) {
        setCurrentScreenId(component.target);
      }
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevScreen = newHistory.pop();
    setHistory(newHistory);
    if (prevScreen) setCurrentScreenId(prevScreen);
  };

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  // Render Component Helpers
  const renderComponent = (comp: UIComponent) => {
    switch (comp.type) {
      case 'button':
        return (
          <button
            key={comp.id}
            onClick={() => handleAction(comp)}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-sm mb-3
              ${comp.primary 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' 
                : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-gray-300'
              }`}
          >
            {comp.label}
          </button>
        );
      case 'input_text':
      case 'input_cpf':
        return (
          <div key={comp.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-500 mb-1">
              {comp.type === 'input_cpf' ? 'CPF' : 'Input'}
            </label>
            <input
              type={comp.type === 'input_cpf' ? 'tel' : 'text'}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg"
              placeholder={comp.placeholder}
              value={inputs[comp.id] || ''}
              onChange={(e) => handleInputChange(comp.id, e.target.value)}
            />
          </div>
        );
      case 'text_block':
        return (
          <div key={comp.id} className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center mb-6">
            <span className="text-2xl font-mono font-bold text-blue-800">{comp.value}</span>
          </div>
        );
      case 'image':
        return (
          <img 
            key={comp.id}
            src="https://picsum.photos/400/200" 
            alt="Dynamic"
            className="w-full h-40 object-cover rounded-xl mb-4"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-gray-100 p-4 lg:p-8">
      {/* Device Frame */}
      <div className="relative w-full max-w-[400px] h-[800px] bg-black rounded-[3rem] shadow-2xl border-[8px] border-black overflow-hidden ring-4 ring-gray-200/50">
        
        {/* Dynamic Notch/Header area */}
        <div className="absolute top-0 left-0 w-full h-8 bg-black z-20 flex justify-center">
            <div className="w-32 h-5 bg-black rounded-b-xl"></div>
        </div>

        {/* Screen Content */}
        <div className="w-full h-full bg-slate-50 overflow-y-auto flex flex-col relative z-10 pt-10">
          
          {/* Header Bar */}
          <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-10">
            {history.length > 0 ? (
              <button onClick={handleBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={20} />
              </button>
            ) : (
               <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                 <Smartphone size={18} />
               </div>
            )}
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Filazero Kiosk</span>
            <div className="w-8"></div> {/* Spacer */}
          </div>

          {/* Body */}
          <div className="flex-1 p-6 flex flex-col animate-fadeIn">
            <div className="mb-8">
              {currentScreen.type === 'success' && (
                <div className="flex justify-center mb-4">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight text-center">{currentScreen.title}</h1>
              {currentScreen.subtitle && (
                <p className="text-gray-500 mt-2 text-center leading-relaxed">{currentScreen.subtitle}</p>
              )}
            </div>

            <div className="space-y-2 flex-1">
              {currentScreen.components.map(renderComponent)}
            </div>
          </div>

          {/* Footer branding */}
          <div className="p-4 text-center">
            <p className="text-[10px] text-gray-300 font-medium">Powered by Filazero Studio</p>
          </div>
        </div>
      </div>
    </div>
  );
};