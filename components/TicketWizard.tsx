import React, { useState } from 'react';
import { TicketType, Widget, TicketPriority, Campaign, User } from '../types';
import { 
  ChevronRight, FileText, Layout, Wrench, 
  AlertTriangle, ArrowRightLeft, X, CheckCircle2, 
  HelpCircle, Camera, Globe, Zap, Store, User as UserIcon, Map, Link2, BookOpen
} from 'lucide-react';

interface TicketWizardProps {
  user: User;
  widgets: Widget[];
  campaigns: Campaign[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

// Mock KB Suggestions for Intercept
const KB_SUGGESTIONS: Record<string, {title: string, link: string}[]> = {
  [TicketType.CONFIGURATION]: [
    { title: 'How to enable App Embed', link: '#' },
    { title: 'Setting up "Buy X Get Y" Logic', link: '#' },
    { title: 'Understanding Targeting Rules', link: '#' }
  ],
  [TicketType.STYLING]: [
    { title: 'Custom CSS: Progress Bar Colors', link: '#' },
    { title: 'Fixing Z-Index Issues', link: '#' },
    { title: 'Mobile Layout Adjustments', link: '#' }
  ],
  [TicketType.MIGRATION]: [
    { title: 'Migrating from Rebuy Smart Cart', link: '#' },
    { title: 'Importing Product Feeds', link: '#' },
    { title: 'Removing Legacy Code', link: '#' }
  ],
  [TicketType.BUG]: [
    { title: 'Troubleshooting: Cart Not Opening', link: '#' },
    { title: 'Common Javascript Conflicts', link: '#' },
    { title: 'Widget Not Showing (Checklist)', link: '#' }
  ]
};

const TicketWizard: React.FC<TicketWizardProps> = ({ user, widgets, campaigns, onClose, onSubmit }) => {
  const [step, setStep] = useState(1);
  
  // Step 1: Context & Identity
  const [contactName, setContactName] = useState(user.name);
  const [contactEmail, setContactEmail] = useState(user.email || '');
  const [storeUrl, setStoreUrl] = useState(user.storeUrl || '');
  
  // Step 2: Scope
  const [scope, setScope] = useState<'widget' | 'campaign' | 'global'>('widget');
  const [selectedWidget, setSelectedWidget] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  
  // Step 3: Classification
  const [selectedCategory, setSelectedCategory] = useState<TicketType>(TicketType.CONFIGURATION);
  const [subCategory, setSubCategory] = useState<string>('');
  const [impact, setImpact] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  
  // Step 4: Details
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [issueUrl, setIssueUrl] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<'Desktop' | 'Mobile' | 'Both'>('Both');

  // Step 5: Diagnostics
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<{status: 'pass' | 'fail' | 'warn', text: string, canFix?: boolean}[]>([]);
  const [fixedIssues, setFixedIssues] = useState<number[]>([]);

  // Sub-category options mapping
  const subCategories: Record<TicketType, string[]> = {
    [TicketType.CONFIGURATION]: ['Campaign Setup', 'Targeting Rules', 'Widget Placement', 'Discount Logic'],
    [TicketType.STYLING]: ['Colors & Fonts', 'Mobile Layout', 'Positioning/Z-Index', 'Custom CSS'],
    [TicketType.BUG]: ['Cart Not Opening', 'Widget Not Loading', 'API Error', 'Conflict with other App'],
    [TicketType.MIGRATION]: ['Rebuy', 'Bold Commerce', 'CartHook', 'Zipify', 'Other'],
    [TicketType.FEATURE]: ['New Widget Type', 'New Integration', 'Dashboard Improvement']
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => f.name);
      setFiles([...files, ...newFiles]);
    }
  };

  const runDiagnostics = () => {
    setIsDiagnosing(true);
    setStep(5);
    setFixedIssues([]);
    
    // Simulate system checks based on context
    setTimeout(() => {
      const results: {status: 'pass' | 'fail' | 'warn', text: string, canFix?: boolean}[] = [];
      results.push({status: 'pass', text: "Store API Connection: Stable"});
      results.push({status: 'pass', text: `Theme Verified: Dawn v11.0.0`});
      
      // Simulate App Embed Failure for demo purposes if Configuration/Bug
      if (selectedCategory === TicketType.CONFIGURATION || selectedCategory === TicketType.BUG) {
         results.push({
             status: 'fail', 
             text: "CRITICAL: 'App Embed' is DISABLED in your Shopify Theme.",
             canFix: true
         });
      } else {
         results.push({status: 'pass', text: "App Embed: Enabled"});
      }
      
      if (selectedWidget) {
        const w = widgets.find(wi => wi.id === selectedWidget);
        results.push({status: w?.isActive ? 'pass' : 'warn', text: `Widget Status: ${w?.isActive ? 'Active' : 'Inactive'}`});
        
        // Zone Validator Logic (Simulated)
        if (w?.zoneId === 'cart_drawer') {
           results.push({status: 'fail', text: `Zone '${w.zoneId}' not detected in 'theme.liquid'.`});
        } else {
           results.push({status: 'pass', text: `Zone '${w?.zoneId}' verified in theme.`});
        }
      }

      setDiagnosticResult(results);
      setIsDiagnosing(false);
    }, 2000);
  };
  
  const handleInstantFix = (index: number) => {
      // Simulate fixing
      setFixedIssues([...fixedIssues, index]);
  };

  const handleSubmit = () => {
    const fullDescription = `
**Contact:** ${contactName} (${contactEmail})
**Context:** ${scope === 'widget' ? `Widget: ${selectedWidget}` : scope === 'campaign' ? `Campaign: ${selectedCampaign}` : 'Global Issue'}
**Category:** ${selectedCategory} > ${subCategory}
**Impact:** ${impact}
**Device:** ${selectedDevice}

**Issue Description:**
${description}

**System Diagnostics:**
${diagnosticResult.map(r => `[${r.status.toUpperCase()}] ${r.text}`).join('\n')}

**Attachments:**
${files.length > 0 ? files.join(', ') : 'None'}
    `.trim();

    onSubmit({
      subject: subject || `${subCategory} Issue`,
      description: fullDescription,
      widgetId: selectedWidget,
      campaignId: selectedCampaign,
      storeUrl,
      issueUrl,
      type: selectedCategory,
      priority: impact === 'Critical' ? TicketPriority.CRITICAL : impact === 'High' ? TicketPriority.HIGH : TicketPriority.MEDIUM,
    });
  };

  const steps = [
    { s: 1, label: 'Store' },
    { s: 2, label: 'Scope' },
    { s: 3, label: 'Triage' },
    { s: 4, label: 'Evidence' },
    { s: 5, label: 'Review' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Progress Header */}
        <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Request Support</h2>
                    <p className="text-sm text-gray-500">Step {step} of 5</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                </button>
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center space-x-2">
                {steps.map((item, idx) => (
                    <div key={idx} className="flex items-center">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            step === item.s 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : step > item.s 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-400'
                        }`}>
                            {step > item.s ? <CheckCircle2 className="w-3 h-3" /> : <span>{item.s}</span>}
                            <span>{item.label}</span>
                        </div>
                        {idx < steps.length - 1 && <div className="w-4 h-0.5 bg-gray-200 mx-1"></div>}
                    </div>
                ))}
            </div>
        </div>

        {/* Content Body */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* STEP 1: Store & Contact Info */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Who are we helping?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                            <input 
                                type="text" value={contactName} onChange={(e) => setContactName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input 
                                type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Store URL (myshopify.com)</label>
                            <div className="relative">
                                <Store className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <input 
                                    type="text" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)}
                                    placeholder="example.myshopify.com"
                                    className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">This helps us auto-detect your theme and settings.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: Scope Selection */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Map className="w-5 h-5 mr-2 text-blue-600" />
                        Where is the problem?
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {['widget', 'campaign', 'global'].map((s) => (
                            <button
                                key={s}
                                onClick={() => { setScope(s as any); setSelectedWidget(''); setSelectedCampaign(''); }}
                                className={`py-2 px-4 rounded-lg text-sm font-medium border capitalize ${
                                    scope === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
                                }`}
                            >
                                {s} Issue
                            </button>
                        ))}
                    </div>

                    {scope === 'widget' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {widgets.map(w => (
                                <div 
                                    key={w.id}
                                    onClick={() => setSelectedWidget(w.id)}
                                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedWidget === w.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:border-blue-300'}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-gray-800">{w.name}</span>
                                        {w.isActive && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                                    </div>
                                    <div className="text-xs text-gray-500">{w.zoneId}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {scope === 'campaign' && (
                        <div className="space-y-3">
                             <label className="block text-sm font-medium text-gray-700">Select Campaign</label>
                             <select 
                                value={selectedCampaign} 
                                onChange={(e) => setSelectedCampaign(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                             >
                                 <option value="">-- Choose Campaign --</option>
                                 {campaigns.map(c => (
                                     <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
                                 ))}
                             </select>
                        </div>
                    )}

                    {scope === 'global' && (
                        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                            You are reporting an issue that affects the entire store or account settings (e.g., Billing, API Keys, Dashboard access).
                        </div>
                    )}
                </div>
            )}

            {/* STEP 3: Triage & KB Intercept */}
            {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="md:col-span-2 space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
                            What kind of issue is it?
                        </h3>
                        
                        {/* Categories */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { id: TicketType.CONFIGURATION, label: 'Config', icon: Layout },
                                { id: TicketType.STYLING, label: 'Styling', icon: Wrench },
                                { id: TicketType.BUG, label: 'Bug', icon: AlertTriangle },
                                { id: TicketType.MIGRATION, label: 'Migration', icon: ArrowRightLeft },
                            ].map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCategory(cat.id); setSubCategory(''); }}
                                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                                        selectedCategory === cat.id 
                                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' 
                                        : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                                    }`}
                                >
                                    <cat.icon className="w-6 h-6 mb-2" />
                                    <span className="text-sm font-medium">{cat.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Sub-Category */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Specific Area</h4>
                            <div className="flex flex-wrap gap-2">
                                {subCategories[selectedCategory].map((sub) => (
                                    <button
                                        key={sub}
                                        onClick={() => setSubCategory(sub)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                                            subCategory === sub 
                                            ? 'bg-gray-900 text-white border-gray-900' 
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        {sub}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Impact */}
                        <div>
                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Impact Level</h4>
                            <div className="flex space-x-4">
                                {['Low', 'Medium', 'High', 'Critical'].map(lvl => (
                                    <label key={lvl} className="flex items-center cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="impact" 
                                            checked={impact === lvl} 
                                            onChange={() => setImpact(lvl as any)}
                                            className="mr-2 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm text-gray-700">{lvl}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* KB Intercept Panel */}
                    <div className="md:col-span-1 bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-yellow-800 font-bold mb-3">
                            <BookOpen className="w-4 h-4" />
                            <h4 className="text-sm">Help Center Suggestions</h4>
                        </div>
                        <p className="text-xs text-yellow-700 mb-4">Before you submit, have you checked these guides related to <strong>{selectedCategory}</strong>?</p>
                        <div className="space-y-2">
                             {KB_SUGGESTIONS[selectedCategory]?.map((sug, i) => (
                                 <a key={i} href={sug.link} className="block bg-white p-3 rounded-lg border border-yellow-200 text-sm text-gray-800 hover:border-yellow-400 hover:text-blue-600 transition-colors shadow-sm">
                                     {sug.title}
                                     <span className="block text-[10px] text-gray-400 mt-1">Read Article &rarr;</span>
                                 </a>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: Evidence & Details */}
            {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        The Details
                    </h3>

                    {/* Dynamic Prompt */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start space-x-3">
                        <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            {selectedCategory === TicketType.BUG && "Tip: Tell us exactly what steps make the bug appear."}
                            {selectedCategory === TicketType.STYLING && "Tip: Upload a mockup or screenshot of the desired look."}
                            {selectedCategory === TicketType.MIGRATION && "Tip: Send us a link to the widget you want to replicate."}
                            {selectedCategory === TicketType.CONFIGURATION && "Tip: Explain the logic you are trying to achieve."}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <input 
                            type="text" 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder={subCategory ? `${subCategory} Issue...` : "Brief summary..."}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Issue URL (Optional)</label>
                         <div className="relative">
                            <Link2 className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                            <input 
                                type="text" 
                                value={issueUrl}
                                onChange={(e) => setIssueUrl(e.target.value)}
                                placeholder="https://store.com/products/specific-page"
                                className="w-full border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                         </div>
                         <p className="text-xs text-gray-500 mt-1">Direct link to where we can see the problem.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
                            placeholder="Please provide as much detail as possible..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                            <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="flex flex-col items-center">
                                <Camera className="w-5 h-5 text-gray-400 mb-1" />
                                <span className="text-sm font-medium text-blue-600">Upload Screenshot / Video</span>
                            </div>
                        </div>
                        {files.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                                {files.join(', ')}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 5: Diagnostics & Review (Instant Fix) */}
            {step === 5 && (
                <div className="h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                    {isDiagnosing ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                            <h3 className="text-lg font-bold text-gray-900">Running System Diagnostics...</h3>
                            <p className="text-gray-500 mt-2 max-w-xs">Checking store theme, API connections, and widget status.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className={`border rounded-xl p-5 ${diagnosticResult.some(r => r.status === 'fail') ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                                <h3 className={`${diagnosticResult.some(r => r.status === 'fail') ? 'text-orange-800' : 'text-green-800'} font-bold flex items-center mb-3`}>
                                    {diagnosticResult.some(r => r.status === 'fail') ? <AlertTriangle className="w-5 h-5 mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                                    Diagnostics Complete
                                </h3>
                                <div className="space-y-3">
                                    {diagnosticResult.map((res, i) => (
                                        <div key={i} className="flex justify-between items-center bg-white/50 p-2 rounded">
                                            <div className={`text-sm font-medium ${
                                                res.status === 'pass' ? 'text-green-700' : 
                                                res.status === 'fail' ? 'text-red-700' : 'text-orange-700'
                                            }`}>
                                                {res.status === 'pass' ? '✅' : res.status === 'fail' ? '❌' : '⚠️'} {res.text}
                                            </div>
                                            {res.canFix && !fixedIssues.includes(i) && (
                                                <button 
                                                    onClick={() => handleInstantFix(i)}
                                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded shadow-sm hover:bg-blue-700 font-bold flex items-center"
                                                >
                                                    <Zap className="w-3 h-3 mr-1" /> Fix it for me
                                                </button>
                                            )}
                                            {res.canFix && fixedIssues.includes(i) && (
                                                <span className="text-xs font-bold text-green-600 flex items-center bg-green-100 px-2 py-1 rounded">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Fixed!
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Ticket Summary</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-600">Contact</span>
                                        <span className="text-gray-900 font-medium text-right">{contactName}<br/><span className="text-xs text-gray-500">{contactEmail}</span></span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-100 pb-2">
                                        <span className="text-gray-600">Issue</span>
                                        <span className="text-gray-900 font-medium text-right">{selectedCategory} / {subCategory}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Scope</span>
                                        <span className="text-gray-900 font-medium text-right capitalize">{scope}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
            <button 
                onClick={step === 1 ? onClose : () => {
                    if (step === 5) setStep(4);
                    else setStep(step - 1);
                }}
                className="px-4 py-2 text-gray-600 font-medium hover:text-gray-900 disabled:opacity-50"
                disabled={isDiagnosing}
            >
                {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            {step < 5 ? (
                <button 
                    onClick={() => {
                        if (step === 4) runDiagnostics();
                        else setStep(step + 1);
                    }}
                    disabled={
                        (step === 1 && (!storeUrl || !contactEmail)) ||
                        (step === 2 && scope === 'widget' && !selectedWidget) ||
                        (step === 2 && scope === 'campaign' && !selectedCampaign) ||
                        (step === 3 && !subCategory)
                    }
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium shadow-sm flex items-center transition-all"
                >
                    {step === 4 ? 'Run Diagnostics' : 'Next'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                </button>
            ) : (
                <button 
                    onClick={handleSubmit}
                    disabled={isDiagnosing}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-8 py-2 rounded-lg font-bold shadow-sm flex items-center transition-all"
                >
                    Submit Request
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default TicketWizard;