import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, Plus, Activity } from 'lucide-react';
import { StoreHealth, Ticket, TicketStatus } from '../types';

interface MerchantDashboardProps {
  tickets: Ticket[];
  storeHealth: StoreHealth;
  onRequestSupport: () => void;
}

const MerchantDashboard: React.FC<MerchantDashboardProps> = ({ tickets, storeHealth, onRequestSupport }) => {
  const activeTickets = tickets.filter(t => t.status !== TicketStatus.RESOLVED);
  
  // Mock data for chart
  const data = [
    { name: 'Mon', views: 4000, interactions: 2400 },
    { name: 'Tue', views: 3000, interactions: 1398 },
    { name: 'Wed', views: 2000, interactions: 9800 },
    { name: 'Thu', views: 2780, interactions: 3908 },
    { name: 'Fri', views: 1890, interactions: 4800 },
    { name: 'Sat', views: 2390, interactions: 3800 },
    { name: 'Sun', views: 3490, interactions: 4300 },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your Dynamatic performance and support.</p>
        </div>
        <button 
            onClick={onRequestSupport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center space-x-2 shadow-sm transition-all"
        >
            <Plus className="w-5 h-5" />
            <span>Request Support</span>
        </button>
      </header>

      {/* Health Check Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>System Health</span>
            </h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Cart Status</span>
                    {storeHealth.cartStatus ? (
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3 mr-1"/> ACTIVE</span>
                    ) : (
                        <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full"><XCircle className="w-3 h-3 mr-1"/> OFF</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">App Embed</span>
                    {storeHealth.appEmbedEnabled ? (
                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3 mr-1"/> ENABLED</span>
                    ) : (
                        <span className="flex items-center text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3 mr-1"/> DISABLED</span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Theme</span>
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{storeHealth.themeName}</span>
                </div>
            </div>
            {storeHealth.conflictingApps.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-red-800">Conflict Detected</p>
                            <p className="text-xs text-red-600 mt-1">
                                We found apps that might conflict: <span className="font-semibold">{storeHealth.conflictingApps.join(', ')}</span>.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Analytics Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Widget Performance (7 Days)</h3>
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                            cursor={{fill: '#f3f4f6'}}
                        />
                        <Bar dataKey="interactions" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 2 ? '#818cf8' : '#4f46e5'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </section>

      {/* Active Tickets */}
      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Active Support Requests</h2>
        {activeTickets.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center shadow-sm">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900">All systems operational</h3>
                <p className="text-gray-500 text-sm mt-1">You have no open support tickets.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {activeTickets.map(ticket => (
                    <div key={ticket.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between group cursor-pointer">
                        <div className="flex items-start space-x-4">
                            <div className={`w-2 h-2 rounded-full mt-2 ${ticket.status === TicketStatus.IN_REVIEW ? 'bg-purple-500' : 'bg-blue-500'}`} />
                            <div>
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{ticket.subject}</h4>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">{ticket.description}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{ticket.id}</span>
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">{ticket.status}</span>
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                    </div>
                ))}
            </div>
        )}
      </section>
    </div>
  );
};

export default MerchantDashboard;