import React, { useState, useEffect, useMemo } from 'react';
import { FLOWER_STYLES, DEFAULT_SYSTEM_PROMPT, UI_TEXT } from './constants';
import { FlowchartSpec, Language, ThemeMode, ModelProvider, FlowerTheme } from './types';
import Visualizer from './components/Visualizer';
import Editor from './components/Editor';
import { generateFlowchart } from './services/llmService';

const App: React.FC = () => {
  // UI State
  const [uiLanguage, setUiLanguage] = useState<Language>('en');
  const [flowchartLanguage, setFlowchartLanguage] = useState<Language>('en');
  
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [flowerStyle, setFlowerStyle] = useState<string>('Sakura');
  const [provider, setProvider] = useState<ModelProvider>('Gemini');
  const [activeTab, setActiveTab] = useState<'visual' | 'edit' | 'json' | 'settings'>('visual');
  
  // Data State
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [spec, setSpec] = useState<FlowchartSpec | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived
  const ui = UI_TEXT[uiLanguage];
  const currentTheme = useMemo(() => FLOWER_STYLES[flowerStyle][themeMode], [flowerStyle, themeMode]);

  // Apply theme colors to CSS variables for global usage if needed, or just pass to components
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setIsLoading(true);
    setError(null);
    setActiveTab('visual');
    
    try {
      const data = await generateFlowchart(description, systemPrompt, flowchartLanguage);
      setSpec(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate flowchart");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!spec) return null;
    const n = spec.nodes.length;
    let complexity = 'Low';
    if (n > 10) complexity = 'Medium';
    if (n > 25) complexity = 'High';
    return { nodes: n, edges: spec.edges.length, complexity };
  }, [spec]);

  return (
    <div className="min-h-screen flex flex-col bg-cover bg-center transition-all duration-500"
         style={{ 
           backgroundColor: currentTheme.bg_color,
           backgroundImage: themeMode === 'light' 
             ? 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8), transparent)' 
             : 'radial-gradient(circle at 50% 0%, rgba(0,0,0,0.4), transparent)'
         }}>
      
      {/* Header */}
      <header className="h-16 glass-panel border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: currentTheme.title_fill }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold leading-tight">{ui.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Controls */}
          <select 
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            value={flowerStyle}
            onChange={(e) => setFlowerStyle(e.target.value)}
          >
            {Object.keys(FLOWER_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700"></div>

          <button 
            onClick={() => setThemeMode(m => m === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {themeMode === 'light' ? '🌙' : '☀️'}
          </button>
           <button 
            onClick={() => setUiLanguage(l => l === 'en' ? 'zh' : 'en')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-current opacity-70 hover:opacity-100"
            title="Switch UI Language"
          >
            {uiLanguage.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar / Input Panel */}
        <aside className="w-full lg:w-[400px] flex flex-col bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 p-6 gap-6 z-20 overflow-y-auto">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">{ui.inputLabel}</label>
              <div className="flex gap-2">
                 <span className={`text-xs px-2 py-0.5 rounded-full ${provider === 'Gemini' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>Gemini</span>
                 <span className="text-xs text-gray-400">|</span>
                 <span className="text-xs text-gray-400">OpenAI</span>
              </div>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={ui.inputPlaceholder}
              className="w-full h-48 p-4 rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-offset-2 focus:outline-none resize-none shadow-inner transition-all"
              style={{ focusRingColor: currentTheme.title_fill }}
            />

            {/* Output Language Selector */}
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{ui.outputLanguage}</span>
              <div className="flex bg-gray-100 dark:bg-black/20 rounded-lg p-1 gap-1">
                <button 
                  onClick={() => setFlowchartLanguage('en')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${flowchartLanguage === 'en' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  {ui.langEn}
                </button>
                <button 
                  onClick={() => setFlowchartLanguage('zh')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${flowchartLanguage === 'zh' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                >
                  {ui.langZh}
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-white font-semibold shadow-lg transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ backgroundColor: currentTheme.title_fill }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {ui.generating}
                </>
              ) : (
                <>
                  <span>✨</span> {ui.generateBtn}
                </>
              )}
            </button>
          </div>

          {error && (
             <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-300 text-sm">
               {error}
             </div>
          )}

          {/* Stats Dashboard */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: currentTheme.title_fill }}>{stats.nodes}</div>
                <div className="text-xs text-gray-500 uppercase">{ui.nodes}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: currentTheme.title_fill }}>{stats.edges}</div>
                <div className="text-xs text-gray-500 uppercase">{ui.edges}</div>
              </div>
              <div className="text-center">
                 <div className="text-sm font-bold py-1.5 mt-1 rounded" style={{ backgroundColor: currentTheme.phase_fill, color: currentTheme.font_color }}>{stats.complexity}</div>
                 <div className="text-xs text-gray-500 uppercase mt-1">{ui.complexity}</div>
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
            <button 
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              <span className="text-lg">⚙️</span> {ui.settings}
            </button>
          </div>
        </aside>

        {/* Right Main Content */}
        <div className="flex-1 flex flex-col h-full relative">
           {/* Tabs */}
           <div className="h-12 flex items-center px-6 gap-6 border-b border-gray-200 dark:border-gray-800 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab('visual')}
                className={`h-full border-b-2 text-sm font-medium transition-colors ${activeTab === 'visual' ? 'border-current' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                style={{ borderColor: activeTab === 'visual' ? currentTheme.title_fill : 'transparent', color: activeTab === 'visual' ? currentTheme.title_fill : undefined }}
              >
                Visualizer
              </button>
              <button 
                onClick={() => setActiveTab('edit')}
                disabled={!spec}
                className={`h-full border-b-2 text-sm font-medium transition-colors ${activeTab === 'edit' ? 'border-current' : 'border-transparent text-gray-400 hover:text-gray-600 disabled:opacity-30'}`}
                style={{ borderColor: activeTab === 'edit' ? currentTheme.title_fill : 'transparent', color: activeTab === 'edit' ? currentTheme.title_fill : undefined }}
              >
                Editor
              </button>
              <button 
                onClick={() => setActiveTab('json')}
                disabled={!spec}
                className={`h-full border-b-2 text-sm font-medium transition-colors ${activeTab === 'json' ? 'border-current' : 'border-transparent text-gray-400 hover:text-gray-600 disabled:opacity-30'}`}
                style={{ borderColor: activeTab === 'json' ? currentTheme.title_fill : 'transparent', color: activeTab === 'json' ? currentTheme.title_fill : undefined }}
              >
                JSON Spec
              </button>
           </div>

           <div className="flex-1 p-6 overflow-hidden relative">
              {activeTab === 'visual' && (
                spec ? (
                  <Visualizer data={spec} theme={currentTheme} width={800} height={600} />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center animate-pulse">
                       <svg className="w-10 h-10 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
                    </div>
                    <p>{ui.subtitle}</p>
                  </div>
                )
              )}

              {activeTab === 'edit' && spec && (
                 <Editor spec={spec} onChange={setSpec} />
              )}

              {activeTab === 'json' && spec && (
                <div className="w-full h-full overflow-auto bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs shadow-inner">
                   <pre>{JSON.stringify(spec, null, 2)}</pre>
                </div>
              )}

              {activeTab === 'settings' && (
                 <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                    <h2 className="text-xl font-bold mb-4">{ui.prompt}</h2>
                    <textarea 
                      value={systemPrompt}
                      onChange={(e) => setSystemPrompt(e.target.value)}
                      className="w-full h-64 p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-4 flex justify-end">
                      <button onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)} className="text-sm text-gray-500 hover:underline">Reset to Default</button>
                    </div>
                 </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;