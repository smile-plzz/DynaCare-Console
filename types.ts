export enum TicketStatus {
  OPEN = 'Open',
  IN_REVIEW = 'In Review',
  WAITING_FOR_APPROVAL = 'Waiting for Approval',
  RESOLVED = 'Resolved'
}

export enum TicketType {
  BUG = 'Bug',
  CONFIGURATION = 'Configuration',
  STYLING = 'Styling',
  MIGRATION = 'Migration',
  FEATURE = 'Feature Request'
}

export enum TicketPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Widget {
  id: string;
  name: string;
  type: string; // e.g., 'Tiered Bar', 'Slideout Upsell'
  zoneId: string;
  isActive: boolean;
  config?: any; // JSON configuration for the widget
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'scheduled' | 'draft';
}

export interface CartProfile {
  name: string;
  type: 'Dynamic' | 'Static';
  isActive: boolean;
  lastUpdated: string;
}

export interface DiscountLog {
  id: string;
  functionName: string; // e.g., 'VolumeDiscount'
  input: string; // e.g., 'Qty 2, Total $50'
  result: 'Applied' | 'Rejected' | 'Error';
  details: string;
  timestamp: string;
}

export interface MigrationTask {
  id: string;
  sourceWidget: string; // e.g. "Rebuy Cart Cross-sell"
  targetWidget: string; // e.g. "Dynamatic Slideout"
  status: 'pending' | 'staging' | 'live';
}

export interface DependencyNode {
  step: string;
  label: string;
  status: 'pass' | 'fail' | 'warning';
  details?: string;
}

export interface StoreHealth {
  cartStatus: boolean;
  appEmbedEnabled: boolean;
  themeIntegration: boolean;
  conflictingApps: string[];
  themeName: string;
  plan: 'Basic' | 'Shopify' | 'Advanced' | 'Plus';
  cartProfile: CartProfile;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  merchantName: string;
  merchantEmail?: string;
  storeUrl: string;
  issueUrl?: string; // Specific URL where the issue is happening
  createdAt: string;
  widgetId?: string;
  campaignId?: string;
  messages: Message[];
  migrationTasks?: MigrationTask[]; // Only for Migration tickets
  tags: string[];
}

export interface Message {
  id: string;
  sender: 'merchant' | 'agent' | 'system';
  content: string;
  timestamp: string;
  isInternal?: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'merchant' | 'agent';
  storeId?: string;
  storeUrl?: string;
}