import React, { useState, useRef, useEffect } from 'react';
import { Ticket, StoreHealth, TicketStatus, Widget, DiscountLog, DependencyNode, TicketType, TicketPriority } from '../types';
import { 
  Users, Terminal, Copy, CheckCircle, MessageSquare, Search,
  Zap, Settings, X, Mail, Globe, AlertTriangle, 
  Store, GitBranch, Activity, Database, Tag, PlayCircle, 
  ArrowRight, AlertCircle, RefreshCw, ChevronDown, PlusCircle,
  PanelRightClose, PanelRightOpen, Loader2, ShieldAlert, Filter, Check, Command
} from 'lucide-react';

interface AgentWorkspaceProps {
  tickets: Ticket[];
  widgets: Widget[];
  storeHealth: StoreHealth;
  discountLogs: DiscountLog[];
  dependencyChains: Record<string, DependencyNode[]>;
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
  onUpdateWidgetConfig: (widgetId: string, config: any) => void;
}

// Internal Toast Type
interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const QUICK_REPLIES = [
    { label: "Ack", text: "Thanks for reaching out! I'm looking into this now." },
    { label: "Need Access", text: "Could you please grant temporary access to your theme? I've sent a collaborator request." },
    { label: "Fixed", text: "I've deployed a fix to the [DYNAMATIC-SUPPORT] theme. Please preview it here: " },
    { label: "No Repro", text: "I cannot reproduce this on my end. Could you send a video recording?" }
];

const SMART_TEMPLATES = [
    { 
        label: "Styling Fix", 
        content: "Hi [Name],\n\nI noticed the styling issue on your widget. I've updated the Custom CSS to fix the overflow.\n\n**Code Applied:**\n```css\noverflow-y: scroll;\n```\n\nYou can see this in the **Advanced** tab. Let me know if you need anything else!"
    },
    {
        label: "Config Error",
        content: "Hi [Name],\n\nIt looks like the widget wasn't appearing because the **Zone ID** was missing from your theme.\n\nI have injected the app block into `theme.liquid`. You should see it live now."
    },
    {
        label: "Migration Update",
        content: "Hi [Name],\n\nI've successfully migrated your **Rebuy Smart Cart** settings to Dynamatic.\n\nPlease check the preview link below. Once approved, I will publish the changes to your live theme."
    }
];

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ tickets, widgets, storeHealth, discountLogs, dependencyChains, onUpdateTicket, onUpdateWidgetConfig }) => {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [isDeployingEnv, setIsDeployingEnv] = useState(false);
  const [envDeployed, setEnvDeployed] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<TicketPriority | 'ALL'>('ALL');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'conversation' | 'migration' | 'logs'>('conversation');
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Widget Config Modal State
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [configJson, setConfigJson] = useState('');

  // Audience Simulator Modal State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simContext, setSimContext] = useState({ cartTotal: '100', tags: 'VIP', device: 'Mobile' });
  const [simResult, setSimResult] = useState<string | null>(null);
  
  // Tagging State
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Derived State
  const filteredTickets = tickets.filter(t => {
      const matchesSearch = 
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
      
      return matchesSearch && matchesPriority;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  const activeDependencyChain = selectedTicket?.widgetId ? dependencyChains[selectedTicket.widgetId] : null;

  // Refs for click outside
  const templateMenuRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // Click Outside Handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (templateMenuRef.current && !templateMenuRef.current.contains(event.target as Node)) {
        setIsTemplateMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Cmd/Ctrl + Enter to send reply
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            if (activeTab === 'conversation' && replyText.trim()) {
                handleSendReply();
            }
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [replyText, activeTab, selectedTicketId]);

  // Auto-switch tabs based on ticket type
  useEffect(() => {
      if (selectedTicket?.type === TicketType.MIGRATION) {
          setActiveTab('migration');
      } else {
          setActiveTab('conversation');
      }
  }, [selectedTicketId]);

  // --- Handlers ---

  const addToast = (message: string, type: Toast['type'] = 'info') => {
      const id = Date.now().toString();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
  };

  const handleDeployEnvironment = () => {
    setIsDeployingEnv(true);
    setTimeout(() => {
        setIsDeployingEnv(false);
        setEnvDeployed(true);
        addToast("Staging environment created successfully", "success");
    }, 1500);
  };

  const handleSendReply = () => {
      addToast("Reply sent to merchant", "success");
      setReplyText('');
      // Logic to actually send message would go here
  };

  const handleResolveTicket = () => {
      if (selectedTicketId) {
          onUpdateTicket(selectedTicketId, { status: TicketStatus.RESOLVED });
          addToast("Ticket marked as Resolved", "success");
      }
  };

  const openWidgetEditor = (widget: Widget) => {
      setEditingWidgetId(widget.id);
      setConfigJson(JSON.stringify(widget.config || {}, null, 2));
  };

  const saveWidgetConfig = () => {
      if (editingWidgetId) {
          try {
              const parsed = JSON.parse(configJson);
              onUpdateWidgetConfig(editingWidgetId, parsed);
              setEditingWidgetId(null);
              addToast("Widget configuration saved", "success");
          } catch (e) {
              alert("Invalid JSON");
          }
      }
  };
  
  const runSimulation = () => {
      setSimResult(null);
      setTimeout(() => {
          if (simContext.cartTotal === '0') {
             setSimResult("HIDDEN: Cart is empty.");
          } else if (simContext.tags.includes("Wholesale")) {
             setSimResult("HIDDEN: Rule excludes 'Wholesale' tag.");
          } else {
             setSimResult("VISIBLE: All conditions met.");
          }
      }, 800);
  };
  
  const addTag = () => {
      if (newTag.trim() && selectedTicket) {
          const updatedTags = [...(selectedTicket.tags || []), newTag.trim()];
          onUpdateTicket(selectedTicket.id, { tags: updatedTags });
          addToast(`Tag #${newTag} added`, "success");
      }
      setNewTag('');
      setIsAddingTag(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          addTag();
      } else if (e.key === 'Escape') {
          setNewTag('');
          setIsAddingTag(false);
      }
  };
  
  const removeTag = (tagToRemove: string) => {
      if (selectedTicket) {
          const updatedTags = selectedTicket.tags.filter(t => t !== tagToRemove);
          onUpdateTicket(selectedTicket.id, { tags: updatedTags });
          addToast("Tag removed", "info");
      }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
              <div key={toast.id} className={`pointer-events-auto flex items-center px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 ${
                  toast.type === 'success' ? 'bg-green-600 text-white' : 
                  toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'
              }`}>
                  {toast.type === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {toast.type === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
                  {toast.type === 'info' && <Check className="w-4 h-4 mr-2" />}
                  {toast.message}
              </div>
          ))}
      </div>

      {/* 1. Ticket List (Left Panel) - Fixed width */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col z-20 shadow-sm">
        <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tickets..." 
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
            </div>
            {/* Filter Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
                <button 
                    onClick={() => setFilterPriority('ALL')}
                    className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors whitespace-nowrap ${filterPriority === 'ALL' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                    All
                </button>
                <button 
                    onClick={() => setFilterPriority(TicketPriority.CRITICAL)}
                    className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors whitespace-nowrap ${filterPriority === TicketPriority.CRITICAL ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                    Critical
                </button>
                <button 
                    onClick={() => setFilterPriority(TicketPriority.HIGH)}
                    className={`text-[10px] font-bold px-2 py-1 rounded border transition-colors whitespace-nowrap ${filterPriority === TicketPriority.HIGH ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                    High
                </button>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredTickets.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    <Filter className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs">No tickets match your filters.</p>
                </div>
            ) : (
                filteredTickets.map(ticket => (
                    <div 
                        key={ticket.id}
                        onClick={() => {
                            setSelectedTicketId(ticket.id);
                            setEnvDeployed(false);
                            setReplyText('');
                        }}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 ${
                            selectedTicketId === ticket.id 
                            ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]' 
                            : 'border-l-4 border-l-transparent hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded tracking-wide ${
                                ticket.priority === 'Critical' ? 'bg-red-600 text-white' :
                                ticket.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {ticket.priority}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className={`text-sm font-semibold mb-1 line-clamp-1 ${selectedTicketId === ticket.id ? 'text-indigo-900' : 'text-gray-900'}`}>
                            {ticket.subject}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{ticket.description}</p>
                        
                        {/* Visual Indicators */}
                        <div className="mt-2 flex flex-wrap gap-1">
                            {ticket.type === TicketType.MIGRATION && (
                                <span className="inline-flex items-center text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                    <RefreshCw className="w-3 h-3 mr-1" /> Migration
                                </span>
                            )}
                            {ticket.tags && ticket.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">#{tag}</span>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* 2. Main Workspace (Middle Panel) - Flexible */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
         {selectedTicket ? (
            <>
                {/* Workspace Header */}
                <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0 mr-4">
                            <div className="flex items-center space-x-3 mb-1">
                                <h2 className="text-lg font-bold text-gray-900 truncate">{selectedTicket.subject}</h2>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-mono shrink-0">#{selectedTicket.id}</span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                <span className="flex items-center" title={selectedTicket.merchantEmail}>
                                    <Users className="w-3 h-3 mr-1" /> {selectedTicket.merchantName}
                                </span>
                                <span className="flex items-center text-blue-600 hover:underline cursor-pointer">
                                    <Globe className="w-3 h-3 mr-1" /> {selectedTicket.storeUrl}
                                </span>
                            </div>

                            {/* Tagging System */}
                            <div className="flex items-center flex-wrap gap-2 min-h-[24px]">
                                {selectedTicket.tags?.map(tag => (
                                    <span key={tag} className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full text-xs font-medium flex items-center group transition-all hover:border-indigo-200">
                                        <Tag className="w-3 h-3 mr-1" /> {tag}
                                        <button onClick={() => removeTag(tag)} className="ml-1 text-indigo-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                                    </span>
                                ))}
                                {isAddingTag ? (
                                    <div className="flex items-center animate-in fade-in duration-200">
                                        <input 
                                            ref={tagInputRef}
                                            autoFocus
                                            type="text" 
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            onKeyDown={handleTagKeyDown}
                                            onBlur={addTag}
                                            placeholder="Type & Enter..."
                                            className="text-xs border border-indigo-300 rounded-l px-2 py-0.5 w-28 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                                        />
                                        <button onClick={addTag} className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-r hover:bg-indigo-700 font-medium">Add</button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setIsAddingTag(true)} 
                                        className="text-xs text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded-full border border-transparent hover:border-indigo-100 flex items-center transition-all"
                                    >
                                        <PlusCircle className="w-3 h-3 mr-1" /> Add Tag
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex space-x-2 shrink-0">
                             <button 
                                onClick={() => setIsSimulatorOpen(true)}
                                className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
                            >
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Simulate
                            </button>
                            
                            {envDeployed ? (
                                <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center border border-green-200 cursor-default animate-in fade-in zoom-in duration-300">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Dev Ready
                                </button>
                            ) : (
                                <button 
                                    onClick={handleDeployEnvironment}
                                    disabled={isDeployingEnv}
                                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all shadow-sm disabled:opacity-80 min-w-[120px] justify-center"
                                >
                                    {isDeployingEnv ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Cloning...
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Clone Env
                                        </>
                                    )}
                                </button>
                            )}
                            
                            <button 
                                onClick={handleResolveTicket}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                Resolve
                            </button>

                            <button 
                                onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                                className={`ml-2 p-2 rounded-lg border transition-colors ${isRightPanelOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                                title={isRightPanelOpen ? "Close Context Panel" : "Open Context Panel"}
                            >
                                {isRightPanelOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    
                    {/* Navigation Tabs */}
                    <div className="flex space-x-6 border-b border-gray-100 -mb-4 pt-2">
                        <button 
                            onClick={() => setActiveTab('conversation')}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'conversation' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <MessageSquare className="w-4 h-4 mr-2" /> Conversation
                        </button>
                        {selectedTicket.type === TicketType.MIGRATION && (
                             <button 
                                onClick={() => setActiveTab('migration')}
                                className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'migration' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Migration Plan
                            </button>
                        )}
                        <button 
                            onClick={() => setActiveTab('logs')}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <Terminal className="w-4 h-4 mr-2" /> Discount Logs
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                    
                    {/* TAB: CONVERSATION */}
                    {activeTab === 'conversation' && (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            {selectedTicket.issueUrl && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start space-x-3">
                                    <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-900">Reported Issue URL</h4>
                                        <a href={selectedTicket.issueUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-700 hover:underline break-all">
                                            {selectedTicket.issueUrl}
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0 shadow-sm border border-blue-200">
                                    {selectedTicket.merchantName.charAt(0)}
                                </div>
                                <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-gray-200 w-full">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-gray-900">{selectedTicket.merchantName}</span>
                                        <span className="text-xs text-gray-400">{new Date(selectedTicket.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <p className="text-gray-800 text-sm whitespace-pre-wrap font-sans leading-relaxed">{selectedTicket.description}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: MIGRATION MAPPER */}
                    {activeTab === 'migration' && selectedTicket.migrationTasks && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 flex items-center">
                                <RefreshCw className="w-4 h-4 mr-2 text-purple-600" /> Migration Checklist
                            </h3>
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="grid grid-cols-12 gap-4 bg-gray-50 p-3 text-xs font-semibold text-gray-500 border-b border-gray-200">
                                    <div className="col-span-5">Source (Legacy App)</div>
                                    <div className="col-span-1 text-center"></div>
                                    <div className="col-span-4">Target (Dynamatic)</div>
                                    <div className="col-span-2 text-center">Status</div>
                                </div>
                                {selectedTicket.migrationTasks.map(task => (
                                    <div key={task.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 items-center last:border-0 hover:bg-gray-50">
                                        <div className="col-span-5 text-sm text-gray-600 font-medium flex items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2"></div>
                                            {task.sourceWidget}
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <ArrowRight className="w-4 h-4 text-gray-300" />
                                        </div>
                                        <div className="col-span-4 flex items-center text-sm text-gray-900 font-bold">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                                            {task.targetWidget}
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold capitalize border ${
                                                task.status === 'live' ? 'bg-green-100 text-green-700 border-green-200' :
                                                task.status === 'staging' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm text-purple-800 flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                                <div>
                                    <strong>Before you go live:</strong> Ensure all Rebuy JavaScript is removed from <code>theme.liquid</code> to prevent race conditions.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: DISCOUNT LOGS */}
                    {activeTab === 'logs' && (
                        <div className="space-y-4 max-w-4xl mx-auto">
                             <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Shopify Function Logs</h3>
                                <span className="text-xs text-gray-500 font-mono">Live Tail: Enabled</span>
                             </div>
                             <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                                <div className="p-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                                    <span className="text-slate-300 text-xs font-mono flex items-center">
                                        <Activity className="w-3 h-3 mr-2 text-blue-400" /> function_run_id: 88293
                                    </span>
                                    <span className="text-green-400 text-xs flex items-center font-bold uppercase tracking-wider">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                        Monitoring
                                    </span>
                                </div>
                                <div className="p-0">
                                    {discountLogs.map(log => (
                                        <div key={log.id} className="border-b border-slate-800 p-3 hover:bg-slate-800/80 transition-colors font-mono text-xs group">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-blue-400 font-bold group-hover:text-blue-300 transition-colors">{log.functionName}</span>
                                                <span className="text-slate-500">{log.timestamp}</span>
                                            </div>
                                            <div className="text-slate-300 mb-1 pl-4 border-l-2 border-slate-700">Input: <span className="text-slate-400">{log.input}</span></div>
                                            <div className="flex items-center pl-4 border-l-2 border-slate-700">
                                                <span className={`mr-2 font-bold ${
                                                    log.result === 'Applied' ? 'text-green-400' :
                                                    log.result === 'Rejected' ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                    [{log.result}]
                                                </span>
                                                <span className="text-slate-500">{log.details}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Reply Footer (Only on Conversation) */}
                {activeTab === 'conversation' && (
                    <div className="p-6 bg-white border-t border-gray-200 z-10">
                        {/* Action Bar */}
                        <div className="flex items-center justify-between mb-3">
                             <div className="flex space-x-2 overflow-x-auto pb-1 max-w-2xl no-scrollbar">
                                {QUICK_REPLIES.map((qr, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setReplyText(prev => prev + qr.text)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-medium text-gray-600 border border-gray-200 hover:border-indigo-200 transition-all"
                                    >
                                        {qr.label}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Smart Reply Dropdown - Click Based */}
                            <div className="relative" ref={templateMenuRef}>
                                <button 
                                    onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                                    className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-full transition-all border ${isTemplateMenuOpen ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100'}`}
                                >
                                    <Zap className="w-3 h-3 mr-1 fill-current" />
                                    Smart Reply
                                    <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isTemplateMenuOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isTemplateMenuOpen && (
                                    <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-20 animate-in slide-in-from-bottom-2 duration-200">
                                        <div className="bg-gray-50 px-4 py-2 text-[10px] font-bold text-gray-500 border-b border-gray-100 uppercase tracking-wider">Select Response Template</div>
                                        {SMART_TEMPLATES.map((tpl, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => {
                                                    setReplyText(tpl.content.replace('[Name]', selectedTicket.merchantName.split(' ')[0]));
                                                    setIsTemplateMenuOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border-b border-gray-100 last:border-0 transition-colors"
                                            >
                                                <div className="font-bold text-xs mb-0.5">{tpl.label}</div>
                                                <div className="text-[10px] text-gray-400 line-clamp-1">{tpl.content}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="relative group">
                            <textarea 
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply... (Cmd+Enter to send)" 
                                className="w-full border border-gray-300 rounded-xl pl-4 pr-14 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none font-sans text-sm transition-shadow shadow-sm focus:shadow-md"
                                rows={3}
                            />
                            <button 
                                onClick={handleSendReply}
                                disabled={!replyText}
                                className="absolute right-2 bottom-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                                title="Send Reply (Cmd+Enter)"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                            <div className="absolute right-14 bottom-3 text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                <Command className="w-3 h-3 mr-0.5" /> + Enter
                            </div>
                        </div>
                    </div>
                )}
            </>
         ) : (
             <div className="flex-1 flex items-center justify-center flex-col text-gray-300">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 opacity-20" />
                 </div>
                 <p className="font-medium">Select a ticket to begin triage</p>
             </div>
         )}
      </div>

      {/* 3. Snapshot Sidebar (Right Panel) - Collapsible */}
      {isRightPanelOpen && (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300 z-20">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                 <Database className="w-3 h-3 mr-2" /> System Snapshot
             </h3>
             <button onClick={() => setIsRightPanelOpen(false)} className="text-gray-400 hover:text-gray-600">
                 <X className="w-4 h-4" />
             </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
            
            {/* Store Context */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center border border-indigo-100">
                        <Store className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{selectedTicket?.merchantName || 'Store'}</h4>
                        <div className="flex items-center text-xs text-gray-500">
                            <Mail className="w-3 h-3 mr-1" />
                            <span className="truncate">{selectedTicket?.merchantEmail || 'No Email'}</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wide mb-1">Plan</span>
                        <span className="font-bold text-gray-900 text-sm">{storeHealth.plan}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="block text-[10px] text-gray-500 uppercase font-bold tracking-wide mb-1">Theme</span>
                        <span className="font-bold text-gray-900 text-sm truncate">{storeHealth.themeName}</span>
                    </div>
                </div>
            </div>

            {/* Dependency Chain Visualizer - IMPROVED */}
            {activeDependencyChain ? (
                <div className="bg-white">
                     <h4 className="text-xs font-bold text-gray-900 mb-4 flex items-center">
                        <GitBranch className="w-3 h-3 mr-1 text-indigo-500" /> Logic Trace
                     </h4>
                     <div className="space-y-0 pl-1">
                        {activeDependencyChain.map((node, idx) => (
                            <div key={idx} className="flex relative pb-6 last:pb-0">
                                {/* Timeline Line - Flex approach for better gaps */}
                                <div className="flex flex-col items-center mr-4 w-6 shrink-0">
                                    {/* Status Dot */}
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white z-10 ${
                                        node.status === 'pass' ? 'border-green-200 text-green-600' :
                                        node.status === 'fail' ? 'border-red-200 text-red-600' :
                                        'border-yellow-200 text-yellow-600'
                                    }`}>
                                        <div className={`w-2 h-2 rounded-full ${
                                            node.status === 'pass' ? 'bg-green-500' :
                                            node.status === 'fail' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}></div>
                                    </div>
                                    {/* Line */}
                                    {idx < activeDependencyChain.length - 1 && (
                                        <div className="w-0.5 bg-gray-200 flex-1 my-1"></div>
                                    )}
                                </div>
                                
                                {/* Content */}
                                <div className="flex-1 pt-0.5 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-gray-800">{node.step}</span>
                                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded leading-none ${
                                            node.status === 'pass' ? 'bg-green-100 text-green-700' :
                                            node.status === 'fail' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>{node.status}</span>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 leading-tight">{node.label}</p>
                                    <p className="text-xs text-gray-500 mt-1 leading-normal break-words">{node.details}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            ) : (
                /* Default Widgets List if no logic chain is active */
                <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-2">Installed Widgets</h4>
                    <div className="space-y-2">
                        {widgets.map(w => (
                            <div key={w.id} className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center group hover:border-indigo-300 transition-all shadow-sm hover:shadow-md">
                                <div>
                                    <p className="text-xs font-bold text-gray-800">{w.name}</p>
                                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">{w.zoneId}</p>
                                </div>
                                <button 
                                    onClick={() => openWidgetEditor(w)}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                    title="Edit Config"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Diagnostics Summary */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                 <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide">Automated Health Checks</h4>
                 <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs p-2 bg-white rounded border border-gray-100">
                        <span className="text-gray-600 font-medium">Cart Status</span>
                        {storeHealth.cartStatus ? <span className="flex items-center text-green-600 font-bold"><CheckCircle className="w-3 h-3 mr-1" /> Active</span> : <span className="flex items-center text-red-600 font-bold"><ShieldAlert className="w-3 h-3 mr-1" /> Inactive</span>}
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 bg-white rounded border border-gray-100">
                        <span className="text-gray-600 font-medium">Theme Integration</span>
                        {storeHealth.themeIntegration ? <span className="flex items-center text-green-600 font-bold"><CheckCircle className="w-3 h-3 mr-1" /> Verified</span> : <span className="flex items-center text-red-600 font-bold"><AlertCircle className="w-3 h-3 mr-1" /> Missing</span>}
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 bg-white rounded border border-gray-100">
                        <span className="text-gray-600 font-medium">Conflicts</span>
                        {storeHealth.conflictingApps.length > 0 ? (
                            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                                {storeHealth.conflictingApps.length} Detected
                            </span>
                        ) : (
                            <span className="text-gray-400">None</span>
                        )}
                    </div>
                 </div>
            </div>

        </div>
      </div>
      )}

      {/* Widget Editor Modal - Reused from before but z-index fixed */}
      {editingWidgetId && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-900 flex items-center">
                          <Settings className="w-4 h-4 mr-2" />
                          Edit Widget Config
                      </h3>
                      <button onClick={() => setEditingWidgetId(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="p-0 flex-1 relative">
                      <textarea 
                          value={configJson}
                          onChange={(e) => setConfigJson(e.target.value)}
                          className="w-full h-96 p-4 font-mono text-xs text-gray-700 bg-white focus:outline-none resize-none"
                      />
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
                      <button onClick={() => setEditingWidgetId(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                      <button onClick={saveWidgetConfig} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium">Save Changes</button>
                  </div>
              </div>
          </div>
      )}

      {/* Audience Simulator Modal - z-index fixed */}
      {isSimulatorOpen && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                   <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                       <h3 className="font-bold text-gray-900 flex items-center"><PlayCircle className="w-4 h-4 mr-2" /> Audience Simulator</h3>
                       <button onClick={() => { setIsSimulatorOpen(false); setSimResult(null); }}><X className="w-5 h-5 text-gray-400" /></button>
                   </div>
                   <div className="p-6 space-y-4">
                       <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Cart Total ($)</label>
                           <input 
                                type="number" value={simContext.cartTotal} onChange={e => setSimContext({...simContext, cartTotal: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Customer Tags (comma separated)</label>
                           <input 
                                type="text" value={simContext.tags} onChange={e => setSimContext({...simContext, tags: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                       </div>
                       <div>
                           <label className="block text-xs font-bold text-gray-700 mb-1">Device Type</label>
                           <select 
                                value={simContext.device} onChange={e => setSimContext({...simContext, device: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option>Desktop</option>
                                <option>Mobile</option>
                            </select>
                       </div>
                       
                       {simResult && (
                           <div className={`p-3 rounded-lg text-sm font-bold text-center border ${simResult.startsWith('VISIBLE') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                               {simResult}
                           </div>
                       )}

                       <button 
                            onClick={runSimulation}
                            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                           Test Visibility
                       </button>
                   </div>
               </div>
          </div>
      )}

    </div>
  );
};

export default AgentWorkspace;