import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MerchantDashboard from './components/MerchantDashboard';
import AgentWorkspace from './components/AgentWorkspace';
import TicketWizard from './components/TicketWizard';
import University from './components/University';
import { Ticket, TicketStatus, TicketType, TicketPriority, StoreHealth, Widget, User, Campaign, DependencyNode, DiscountLog } from './types';

// Mock Data
const MOCK_WIDGETS: Widget[] = [
  { 
    id: 'wdg_123', 
    name: 'Tiered Progress Bar', 
    type: 'Gamification', 
    zoneId: 'cart_drawer', 
    isActive: true,
    config: { threshold: 50, color: '#000000', message: 'You are close!' }
  },
  { 
    id: 'wdg_456', 
    name: 'Slideout Upsell', 
    type: 'Product Rec', 
    zoneId: 'post_purchase', 
    isActive: true,
    config: { maxItems: 3, algorithm: 'best-seller', trigger: 'add-to-cart' }
  },
  { 
    id: 'wdg_789', 
    name: 'Trust Badges', 
    type: 'Social Proof', 
    zoneId: 'footer', 
    isActive: false,
    config: { style: 'minimal', badges: ['visa', 'mastercard'] }
  },
];

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'cmp_001', name: 'Black Friday 2024', status: 'draft' },
  { id: 'cmp_002', name: 'Welcome Series', status: 'active' },
  { id: 'cmp_003', name: 'VIP Retention', status: 'active' }
];

const MOCK_HEALTH: StoreHealth = {
  cartStatus: true,
  appEmbedEnabled: true,
  themeIntegration: false, // Simulating a Zone Validator failure
  conflictingApps: ['Rebuy', 'Bold Options'],
  themeName: 'Dawn v11.0.0',
  plan: 'Advanced',
  cartProfile: {
    name: 'Holiday Sale V2',
    type: 'Dynamic',
    isActive: true,
    lastUpdated: '2 hours ago'
  }
};

const MOCK_DISCOUNT_LOGS: DiscountLog[] = [
  { id: 'log_1', functionName: 'VolumeDiscount', input: 'Qty: 2, Total: $120', result: 'Applied', details: 'Tier 2 reached (10% off)', timestamp: '10:42 AM' },
  { id: 'log_2', functionName: 'FreeGiftLogic', input: 'Cart: $120', result: 'Rejected', details: 'Condition failed: Tag "VIP" missing', timestamp: '10:45 AM' },
  { id: 'log_3', functionName: 'BundleBuilder', input: 'Items: [A, B]', result: 'Error', details: 'Timeout exceeding 200ms', timestamp: '11:00 AM' }
];

// Mock Dependency Trees for specific widgets
export const MOCK_DEPENDENCY_CHAINS: Record<string, DependencyNode[]> = {
  'wdg_456': [
    { step: 'Campaign', label: 'Welcome Series', status: 'pass', details: 'Status: Active' },
    { step: 'Experience', label: 'New Visitors', status: 'pass', details: 'Logic: First Visit = True' },
    { step: 'Audience', label: 'Global', status: 'pass', details: 'No exclusions found' },
    { step: 'Zone', label: 'post_purchase', status: 'pass', details: 'Injected in checkout.liquid' },
    { step: 'Theme', label: 'Dawn v11', status: 'pass', details: 'App Block verified' }
  ],
  'wdg_123': [
    { step: 'Campaign', label: 'VIP Retention', status: 'pass', details: 'Status: Active' },
    { step: 'Experience', label: 'High Spenders', status: 'pass', details: 'Logic: Lifetime Value > $500' },
    { step: 'Audience', label: 'Wholesale', status: 'fail', details: 'Current user missing "Wholesale" tag' },
    { step: 'Zone', label: 'cart_drawer', status: 'warning', details: 'Zone exists but duplicates Rebuy ID' },
    { step: 'Theme', label: 'Dawn v11', status: 'fail', details: 'Zone ID not found in theme.liquid' }
  ]
};

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt_001',
    subject: 'Slideout upsell overlapping with header',
    description: 'The slideout upsell widget is covering my navigation bar on mobile devices.',
    type: TicketType.STYLING,
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    merchantName: 'GymShark Lite',
    storeUrl: 'gymshark-lite.myshopify.com',
    issueUrl: 'https://gymshark-lite.myshopify.com/products/leggings',
    createdAt: new Date().toISOString(),
    widgetId: 'wdg_456',
    messages: [],
    tags: ['Styling_CSS_Overflow', 'Mobile']
  },
  {
    id: 'tkt_002',
    subject: 'Migrate Rebuy Cart to Dynamatic',
    description: 'We need to move our Rebuy Smart Cart logic over to Dynamatic before Black Friday.',
    type: TicketType.MIGRATION,
    status: TicketStatus.IN_REVIEW,
    priority: TicketPriority.HIGH,
    merchantName: 'GymShark Lite',
    storeUrl: 'gymshark-lite.myshopify.com',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    messages: [],
    migrationTasks: [
      { id: 'mt_1', sourceWidget: 'Rebuy Smart Cart', targetWidget: 'Dynamatic Cart Drawer', status: 'live' },
      { id: 'mt_2', sourceWidget: 'Checkout Upsell', targetWidget: 'Slideout Widget', status: 'staging' },
      { id: 'mt_3', sourceWidget: 'Gift with Purchase', targetWidget: 'Free Gift Logic', status: 'pending' }
    ],
    tags: ['Migration', 'HighValue']
  },
  {
    id: 'tkt_003',
    subject: 'Progress Bar not showing for non-VIPs',
    description: 'The progress bar should show for everyone, but it seems to be hidden.',
    type: TicketType.BUG,
    status: TicketStatus.OPEN,
    priority: TicketPriority.HIGH,
    merchantName: 'GymShark Lite',
    storeUrl: 'gymshark-lite.myshopify.com',
    widgetId: 'wdg_123',
    createdAt: new Date().toISOString(),
    messages: [],
    tags: ['Bug', 'Audience']
  }
];

const MOCK_MERCHANT: User = { id: 'u1', name: 'Sarah Jenkins', email: 'sarah@gymshark-lite.com', role: 'merchant', storeId: 'store_1', storeUrl: 'gymshark-lite.myshopify.com' };
const MOCK_AGENT: User = { id: 'u2', name: 'DynaSupport Bot', role: 'agent' };

function App() {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_MERCHANT);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'agent-workspace' | 'university'
  const [showWizard, setShowWizard] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  
  // State for Agent Widget Editor
  const [widgets, setWidgets] = useState<Widget[]>(MOCK_WIDGETS);

  const switchRole = () => {
    if (currentUser.role === 'merchant') {
      setCurrentUser(MOCK_AGENT);
      setCurrentView('agent-workspace');
    } else {
      setCurrentUser(MOCK_MERCHANT);
      setCurrentView('dashboard');
    }
  };

  const handleTicketSubmit = (data: Partial<Ticket>) => {
    const newTicket: Ticket = {
      id: `tkt_${Date.now()}`,
      subject: data.subject || 'No Subject',
      description: data.description || '',
      type: data.type || TicketType.CONFIGURATION,
      status: TicketStatus.OPEN,
      priority: data.priority || TicketPriority.MEDIUM,
      merchantName: currentUser.name,
      merchantEmail: currentUser.email,
      storeUrl: data.storeUrl || currentUser.storeUrl || '',
      issueUrl: data.issueUrl,
      createdAt: new Date().toISOString(),
      widgetId: data.widgetId,
      campaignId: data.campaignId,
      messages: [],
      tags: [] // Initialize empty tags
    };
    
    setTickets([newTicket, ...tickets]);
    setShowWizard(false);
  };

  const handleUpdateTicket = (id: string, updates: Partial<Ticket>) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleUpdateWidgetConfig = (id: string, newConfig: any) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, config: newConfig } : w));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar 
        currentUser={currentUser} 
        currentView={currentView} 
        onNavigate={setCurrentView}
        onSwitchRole={switchRole}
      />
      
      <main className="flex-1 bg-[#F3F4F6] relative overflow-hidden flex flex-col">
        {currentView === 'dashboard' && currentUser.role === 'merchant' && (
          <MerchantDashboard 
            tickets={tickets} 
            storeHealth={MOCK_HEALTH} 
            onRequestSupport={() => setShowWizard(true)} 
          />
        )}

        {currentView === 'agent-workspace' && currentUser.role === 'agent' && (
          <AgentWorkspace 
            tickets={tickets} 
            widgets={widgets}
            storeHealth={MOCK_HEALTH}
            discountLogs={MOCK_DISCOUNT_LOGS}
            dependencyChains={MOCK_DEPENDENCY_CHAINS}
            onUpdateTicket={handleUpdateTicket}
            onUpdateWidgetConfig={handleUpdateWidgetConfig}
          />
        )}

        {currentView === 'university' && (
          <University onRequestSupport={() => setShowWizard(true)} />
        )}

        {/* Fallback View */}
        {((currentView !== 'dashboard' && currentView !== 'university' && currentUser.role === 'merchant') || 
          (currentView !== 'agent-workspace' && currentView !== 'university' && currentView !== 'kb' && currentUser.role === 'agent')) && (
          <div className="flex items-center justify-center h-full text-gray-400">
            Work in progress...
          </div>
        )}

        {showWizard && (
          <TicketWizard 
            user={currentUser}
            widgets={widgets} 
            campaigns={MOCK_CAMPAIGNS}
            onClose={() => setShowWizard(false)}
            onSubmit={handleTicketSubmit}
          />
        )}
      </main>
    </div>
  );
}

export default App;