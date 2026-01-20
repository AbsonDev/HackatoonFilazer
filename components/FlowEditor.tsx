import React, { useState, useEffect } from 'react';
import { Flow } from '../types';
import { generateFlowFromPrompt } from '../services/geminiService';
import { Code, Play, Wand2, Loader2, Save, Layers } from 'lucide-react';

interface FlowEditorProps {
  flow: Flow;
  onFlowUpdate: (newFlow: Flow) => void;
}

export const FlowEditor: React.FC<FlowEditorProps> = ({ flow, onFlowUpdate }) => {
  const [jsonText, setJsonText] = useState<string>(JSON.stringify(flow, null, 2));
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'json'>('ai');
  const [error, setError] = useState<string | null>(null);

  // Update local text if flow prop updates externally (e.g. via AI)
  useEffect(() => {
    setJsonText(JSON.stringify(flow, null, 2));
  }, [flow]);

  const handleManualJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
  };

  // Debounce logic for parsing JSON
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonText);
        // Simple basic validation
        if (!parsed.screens || !parsed.start_screen_id) {
            throw new Error("Missing required 'screens' or 'start_screen_id'");
        }
        onFlowUpdate(parsed);
        setError(null);
      } catch (err: any) {
        // Only set error if it's strictly a syntax error or our custom error, 
        // to avoid annoying flashing red while typing.
        setError(err.message || "Invalid JSON format");
      }
    }, 800); // 800ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [jsonText, onFlowUpdate]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const newFlow = await generateFlowFromPrompt(prompt);
      onFlowUpdate(newFlow);
      // jsonText will be updated by the first useEffect
    } catch (err) {
      setError("AI Generation failed. Please check your API Key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const screenCount = Object.keys(flow.screens).length;

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-gray-300 border-r border-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-[#252526]">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Layers size={18} />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Filazero Studio</h1>
        </div>
        <p className="text-xs text-gray-500">Flow Orchestrator v1.0.0 (Hackathon Build)</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 text-sm font-medium">
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${activeTab === 'ai' ? 'border-blue-500 text-white bg-gray-800/50' : 'border-transparent hover:text-white'}`}
        >
          <Wand2 size={14} />
          <span>AI Architect</span>
        </button>
        <button 
          onClick={() => setActiveTab('json')}
          className={`flex-1 py-3 flex items-center justify-center space-x-2 border-b-2 transition-colors ${activeTab === 'json' ? 'border-blue-500 text-white bg-gray-800/50' : 'border-transparent hover:text-white'}`}
        >
          <Code size={14} />
          <span>JSON Config</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative">
        {activeTab === 'ai' && (
          <div className="p-6 flex flex-col h-full space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Describe the Journey</label>
              <textarea 
                className="w-full h-40 bg-[#2d2d2d] border border-gray-700 rounded-lg p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none transition-all"
                placeholder="e.g., Create a queue flow for a VIP lounge. First ask for Membership ID. If verified, offer 'Drinks' or 'Shower' service. If not, show 'Access Denied'."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className={`w-full py-4 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all
                ${isGenerating || !prompt 
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98]'
                }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Generating Flow...</span>
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  <span>Generate Flow</span>
                </>
              )}
            </button>
            
            <div className="mt-8 border-t border-gray-800 pt-6">
               <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Current Flow Stats</h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#252526] p-4 rounded-lg border border-gray-800">
                    <span className="text-2xl font-bold text-white block">{screenCount}</span>
                    <span className="text-xs text-gray-500">Total Screens</span>
                 </div>
                 <div className="bg-[#252526] p-4 rounded-lg border border-gray-800">
                    <span className="text-2xl font-bold text-white block truncate">{flow.start_screen_id}</span>
                    <span className="text-xs text-gray-500">Entry Point</span>
                 </div>
               </div>
            </div>

             <div className="mt-auto bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg">
              <h4 className="text-blue-400 font-medium text-sm mb-1 flex items-center gap-2">
                <Play size={14} fill="currentColor"/>
                Live Preview
              </h4>
              <p className="text-xs text-blue-300/70">
                Changes applied here are instantly reflected on the simulated Kiosk on the right.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="flex flex-col h-full relative">
            <div className="flex-1 relative">
                <textarea 
                    className="absolute inset-0 w-full h-full bg-[#1e1e1e] text-green-400 font-mono text-sm p-6 outline-none custom-scrollbar resize-none"
                    value={jsonText}
                    onChange={handleManualJsonChange}
                    spellCheck={false}
                />
            </div>
            {error && (
                <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-200 text-xs p-3 rounded border border-red-700 animate-pulse">
                    {error}
                </div>
            )}
             <div className="p-3 border-t border-gray-800 bg-[#252526] flex justify-between items-center text-xs text-gray-500">
                <span>Server-Driven UI Protocol v1</span>
                <div className="flex items-center gap-1 text-green-500">
                    <Save size={12}/>
                    <span>Auto-saved (Debounced)</span>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};