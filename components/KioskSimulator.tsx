import React, { useState, useEffect } from 'react';
import { Flow, UIComponent } from '../types';
import { ArrowLeft, CheckCircle, Smartphone, Printer, AlertCircle } from 'lucide-react';

interface KioskSimulatorProps {
  flow: Flow;
}

export const KioskSimulator: React.FC<KioskSimulatorProps> = ({ flow }) => {
  const [currentScreenId, setCurrentScreenId] = useState<string>(flow.start_screen_id);
  const [history, setHistory] = useState<string[]>([]);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isPrinting, setIsPrinting] = useState(false);

  // Extract Theme
  const primaryColor = flow.theme?.primaryColor || '#2563eb';

  // Reset when flow changes completely
  useEffect(() => {
    setCurrentScreenId(flow.start_screen_id);
    setHistory([]);
    setInputs({});
    setValidationErrors({});
    setIsPrinting(false);
  }, [flow.flow_id]);

  const currentScreen = flow.screens[currentScreenId];

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

  const validateInputs = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};

    // Check all components in current screen
    currentScreen.components.forEach(comp => {
      if ((comp.type === 'input_text' || comp.type === 'input_cpf') && comp.validation) {
        const value = inputs[comp.id] || '';
        const regex = new RegExp(comp.validation.regex);
        if (!regex.test(value)) {
          isValid = false;
          newErrors[comp.id] = comp.validation.message;
        }
      }
    });

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleAction = (component: UIComponent) => {
    if (!component.action) return;

    // Validate if trying to move forward from a form
    if (currentScreen.type === 'form') {
        if (!validateInputs()) return;
    }

    if (component.action === 'goto_screen' && component.target) {
      setHistory((prev) => [...prev, currentScreenId]);
      setCurrentScreenId(component.target);
    } 
    else if (component.action === 'restart') {
      setHistory([]);
      setInputs({});
      setValidationErrors({});
      setCurrentScreenId(flow.start_screen_id);
    }
    else if (component.action === 'enqueue') {
      // Simulate Printing/Enqueueing
      setIsPrinting(true);
      setTimeout(() => {
        setIsPrinting(false);
        if (component.target) {
          setCurrentScreenId(component.target);
        }
      }, 2500); // 2.5s Printing simulation
    }
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const prevScreen = newHistory.pop();
    setHistory(newHistory);
    if (prevScreen) setCurrentScreenId(prevScreen);
    setValidationErrors({});
  };

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
    // Clear error on type
    if (validationErrors[id]) {
        setValidationErrors(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }
  };

  // Render Component Helpers
  const renderComponent = (comp: UIComponent) => {
    switch (comp.type) {
      case 'button':
        return (
          <button
            key={comp.id}
            onClick={() => handleAction(comp)}
            style={{
                backgroundColor: comp.primary ? primaryColor : 'white',
                color: comp.primary ? 'white' : '#374151',
                borderColor: comp.primary ? primaryColor : '#e5e7eb'
            }}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all transform active:scale-95 shadow-sm mb-3 border-2 hover:opacity-90`}
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
              className={`w-full p-4 border-2 rounded-xl outline-none transition-all text-lg
                ${validationErrors[comp.id] ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-200 focus:ring-2'}`}
              style={{ 
                  '--tw-ring-color': primaryColor + '40', // 40 is 25% opacity hex
                  borderColor: validationErrors[comp.id] ? undefined : (inputs[comp.id] ? primaryColor : undefined)
              } as React.CSSProperties}
              placeholder={comp.placeholder}
              value={inputs[comp.id] || ''}
              onChange={(e) => handleInputChange(comp.id, e.target.value)}
            />
            {validationErrors[comp.id] && (
                <div className="flex items-center gap-1 mt-1 text-xs text-red-500 font-medium animate-pulse">
                    <AlertCircle size={12} />
                    <span>{validationErrors[comp.id]}</span>
                </div>
            )}
          </div>
        );
      case 'text_block':
        return (
          <div key={comp.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-center mb-6">
            <span style={{ color: primaryColor }} className="text-2xl font-mono font-bold">{comp.value}</span>
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
        
        {/* Dynamic Notch */}
        <div className="absolute top-0 left-0 w-full h-8 bg-black z-20 flex justify-center">
            <div className="w-32 h-5 bg-black rounded-b-xl"></div>
        </div>

        {/* Printing Modal Overlay */}
        {isPrinting && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fadeIn">
                <div className="bg-white p-6 rounded-2xl flex flex-col items-center shadow-2xl w-64 text-gray-800">
                    <Printer size={48} className="text-gray-400 mb-4 animate-bounce" />
                    <h3 className="font-bold text-lg mb-2">Printing Ticket...</h3>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div style={{ backgroundColor: primaryColor }} className="h-full w-full animate-[loading_2s_ease-in-out]"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Please wait</p>
                </div>
            </div>
        )}

        {/* Screen Content */}
        <div className="w-full h-full bg-slate-50 overflow-y-auto flex flex-col relative z-10 pt-10">
          
          {/* Header Bar */}
          <div className="px-6 py-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-10">
            {history.length > 0 ? (
              <button onClick={handleBack} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <ArrowLeft size={20} />
              </button>
            ) : (
               <div style={{ backgroundColor: primaryColor + '20', color: primaryColor }} className="w-9 h-9 rounded-full flex items-center justify-center">
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
                  <CheckCircle style={{ color: primaryColor }} className="w-16 h-16" />
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