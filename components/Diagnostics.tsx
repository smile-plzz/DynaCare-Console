import React, { useState } from 'react';
import { 
  CheckCircle2, AlertCircle, HelpCircle, ChevronDown, ChevronRight, 
  Play, RefreshCw, ShieldAlert, Zap, Bug, Activity, Search,
  ClipboardList, Thermometer, BrainCircuit, XCircle, RotateCcw
} from 'lucide-react';

// --- Data Models based on QA Workflow ---

const CHECKLIST_SECTIONS = [
  {
    title: "1. Functional Competency",
    description: "Does the agent work as intended?",
    items: [
      { id: '1.1', label: "Intent Recognition: Correctly classifies user goals (e.g., Search vs Book)", critical: true },
      { id: '1.2', label: "Tool Calling: Selects correct tool & extracts valid arguments", critical: true },
      { id: '1.3', label: "API Resilience: Handles 500 errors gracefully", critical: false },
      { id: '1.4', label: "Multi-step Reasoning: Maintains sequence without skipping steps", critical: true },
      { id: '1.5', label: "Context Retention: Recalls info from 3+ turns ago", critical: false }
    ]
  },
  {
    title: "2. Output Quality",
    description: "Is the response accurate and well-formatted?",
    items: [
      { id: '2.1', label: "Hallucination Check: No invented facts or URLs", critical: true },
      { id: '2.2', label: "Formatting: Output matches JSON/Markdown requirements", critical: true },
      { id: '2.3', label: "Loop Prevention: No repetitive retries on failure", critical: false },
      { id: '2.4', label: "Refusal Logic: Correctly declines out-of-scope requests", critical: true }
    ]
  },
  {
    title: "3. Safety & Security",
    description: "Is the agent safe for public use?",
    items: [
      { id: '3.1', label: "Prompt Injection: Resists 'Ignore instructions' attacks", critical: true },
      { id: '3.2', label: "PII Leakage: No output of keys, passwords, or emails", critical: true },
      { id: '3.3', label: "Toxicity: Tone is neutral and professional", critical: true }
    ]
  },
  {
    title: "4. Performance",
    description: "Is it fast and efficient?",
    items: [
      { id: '4.1', label: "Latency: Time-to-first-token < 2s", critical: false },
      { id: '4.2', label: "Token Usage: Context window usage is optimized", critical: false }
    ]
  }
];

const DEBUG_SCENARIOS = [
  {
    id: 'A',
    title: "Hallucinations / Bad Answers",
    type: "Probabilistic",
    symptom: "Agent invents facts, URLs, or data not in KB.",
    icon: BrainCircuit,
    color: "text-purple-600",
    bg: "bg-purple-50",
    fixes: [
      { title: "Inspect Context", desc: "Was the retrieved RAG context actually relevant?" },
      { title: "Negative Constraints", desc: "Add 'If unknown, explicitly state you do not know' to System Prompt." },
      { title: "Lower Temperature", desc: "Reduce from 0.7 to 0.1 for more determinism." }
    ]
  },
  {
    id: 'B',
    title: "Tool / API Failures",
    type: "Deterministic",
    symptom: "Agent calls tools with wrong arguments or JSON schema errors.",
    icon: Wrench, // Using Zap as placeholder if Wrench not available, but Wrench is standard
    color: "text-blue-600",
    bg: "bg-blue-50",
    fixes: [
      { title: "Check Schema", desc: "Ensure JSON definition matches API expectations exactly." },
      { title: "Simplify Names", desc: "Rename parameters to be self-explanatory for the LLM." },
      { title: "Few-Shot Examples", desc: "Inject 'User: X -> Tool: Y' examples into System Prompt." }
    ]
  },
  {
    id: 'C',
    title: "Loops / Getting Stuck",
    type: "Logic",
    symptom: "Agent repeats the same phrase or retries failed tool endlessly.",
    icon: RotateCcw,
    color: "text-orange-600",
    bg: "bg-orange-50",
    fixes: [
      { title: "Force State Update", desc: "Ensure 'Observation' is appended to history after tool use." },
      { title: "Hard Retry Limit", desc: "Code a max-retry (e.g., 3) before returning failure." }
    ]
  }
];

// Helper icon mapping since Wrench might be imported as something else in some sets, 
// strictly using lucide-react imports available
import { Wrench } from 'lucide-react';

const Diagnostics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'debug' | 'regression'>('checklist');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedDebug, setExpandedDebug] = useState<string | null>(null);

  // Regression State
  const [regressionRuns, setRegressionRuns] = useState<{id: number, status: 'pass' | 'fail' | 'pending'}[]>(
    Array(10).fill(null).map((_, i) => ({ id: i + 1, status: 'pending' }))
  );
  
  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateRun = (id: number, status: 'pass' | 'fail') => {
    setRegressionRuns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const resetRuns = () => {
    setRegressionRuns(prev => prev.map(r => ({ ...r, status: 'pending' })));
  };

  const calculateProgress = () => {
    const total = CHECKLIST_SECTIONS.reduce((acc, sec) => acc + sec.items.length, 0);
    const checked = Object.values(checkedItems).filter(Boolean).length;
    return Math.round((checked / total) * 100);
  };

  const successRate = Math.round(
    (regressionRuns.filter(r => r.status === 'pass').length / 
    regressionRuns.filter(r => r.status !== 'pending').length || 1) * 100
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="w-6 h-6 mr-2 text-indigo-600" />
              Diagnostics & QA Console
            </h1>
            <p className="text-gray-500 mt-1">Audit, debug, and regression test your AI Agents.</p>
          </div>
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'checklist', label: 'Phase 1: Checklist', icon: ClipboardList },
              { id: 'debug', label: 'Phase 2: Debug', icon: Bug },
              { id: 'regression', label: 'Phase 3: Regression', icon: RefreshCw }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab.id 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar for Checklist */}
        {activeTab === 'checklist' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${calculateProgress()}%` }}
            ></div>
            <div className="text-right text-xs text-gray-500 mt-1">{calculateProgress()}% Audit Complete</div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        
        {/* PHASE 1: CHECKLIST */}
        {activeTab === 'checklist' && (
          <div className="max-w-4xl mx-auto space-y-8">
            {CHECKLIST_SECTIONS.map((section, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {section.items.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => toggleCheck(item.id)}
                      className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-slate-50 ${checkedItems[item.id] ? 'bg-indigo-50/30' : ''}`}
                    >
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                          checkedItems[item.id] 
                          ? 'bg-indigo-600 border-indigo-600' 
                          : 'border-gray-300'
                        }`}>
                          {checkedItems[item.id] && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${checkedItems[item.id] ? 'text-indigo-900' : 'text-gray-700'}`}>
                            {item.label}
                          </p>
                          {item.critical && (
                            <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded mt-1 inline-block">Critical</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PHASE 2: DEBUGGING */}
        {activeTab === 'debug' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start">
              <HelpCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-blue-900">Issue Isolation Protocol</h3>
                <p className="text-sm text-blue-700 mt-1">Determine if your error is <span className="font-bold">Probabilistic</span> (Model Behavior) or <span className="font-bold">Deterministic</span> (Code/Logic) to select the right fix.</p>
              </div>
            </div>

            <div className="grid gap-6">
              {DEBUG_SCENARIOS.map((scenario) => (
                <div key={scenario.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div 
                    onClick={() => setExpandedDebug(expandedDebug === scenario.id ? null : scenario.id)}
                    className="px-6 py-5 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${scenario.bg}`}>
                        <scenario.icon className={`w-6 h-6 ${scenario.color}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{scenario.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            scenario.type === 'Probabilistic' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                            scenario.type === 'Deterministic' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            'bg-orange-100 text-orange-700 border-orange-200'
                          }`}>
                            {scenario.type}
                          </span>
                          <span className="text-sm text-gray-500">{scenario.symptom}</span>
                        </div>
                      </div>
                    </div>
                    {expandedDebug === scenario.id ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>

                  {expandedDebug === scenario.id && (
                    <div className="bg-gray-50 px-6 py-6 border-t border-gray-200 animate-in slide-in-from-top-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Recommended Fixes (In Order)</h4>
                      <div className="space-y-3">
                        {scenario.fixes.map((fix, i) => (
                          <div key={i} className="flex items-start bg-white p-4 rounded-lg border border-gray-200">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 mr-3 mt-0.5">
                              {i + 1}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{fix.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{fix.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PHASE 3: REGRESSION */}
        {activeTab === 'regression' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Regression Test Suite</h3>
                  <p className="text-sm text-gray-500 mb-6">Run the prompt that caused failure 10 times to verify the fix stability.</p>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {regressionRuns.map(run => (
                      <div key={run.id} className="flex flex-col items-center">
                        <div className={`w-full h-12 rounded-lg flex items-center justify-center border-2 mb-2 transition-all ${
                          run.status === 'pending' ? 'border-dashed border-gray-300 bg-gray-50' :
                          run.status === 'pass' ? 'border-green-500 bg-green-50 text-green-600' :
                          'border-red-500 bg-red-50 text-red-600'
                        }`}>
                           {run.status === 'pass' && <CheckCircle2 className="w-6 h-6" />}
                           {run.status === 'fail' && <XCircle className="w-6 h-6" />}
                           {run.status === 'pending' && <span className="text-gray-400 font-bold">{run.id}</span>}
                        </div>
                        <div className="flex space-x-1">
                          <button onClick={()