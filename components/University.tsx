import React, { useState } from 'react';
import { Search, Zap, Layout, Code, Wrench, ChevronRight, ArrowLeft, BookOpen, ExternalLink, PlayCircle, MessageSquare } from 'lucide-react';

interface Article {
  id: string;
  categoryId: string;
  title: string;
  content: string; // Markdown-lite
  videoUrl?: string; // Placeholder for video
  popular?: boolean;
}

interface Category {
  id: string;
  title: string;
  icon: any;
  description: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { 
    id: 'getting-started', 
    title: 'Getting Started', 
    icon: Zap, 
    description: 'Installation, app embeds, and theme setup basics.',
    color: 'bg-yellow-100 text-yellow-700'
  },
  { 
    id: 'campaigns', 
    title: 'Campaigns & Offers', 
    icon: Layout, 
    description: 'Buy X Get Y, Free Gift, and Tiered Rewards.',
    color: 'bg-green-100 text-green-700'
  },
  { 
    id: 'styling', 
    title: 'Design & CSS', 
    icon: Code, 
    description: 'Custom CSS recipes, fonts, and branding.',
    color: 'bg-purple-100 text-purple-700'
  },
  { 
    id: 'troubleshooting', 
    title: 'Troubleshooting', 
    icon: Wrench, 
    description: 'Fixing conflicts, bugs, and common errors.',
    color: 'bg-red-100 text-red-700'
  },
];

const ARTICLES: Article[] = [
  { 
    id: '1', 
    categoryId: 'getting-started', 
    title: 'How to enable App Embed in Shopify Theme Editor', 
    content: 'To use Dynamatic, you must enable the App Embed in your Shopify Theme Editor.\n\n1. Go to Online Store > Themes.\n2. Click Customize.\n3. Go to App Embeds on the left sidebar.\n4. Toggle "Dynamatic Core" to ON.\n\nIf you do not see the app embed, please try refreshing your Shopify admin.',
    videoUrl: 'https://placeholder.video/embed',
    popular: true
  },
  { 
    id: '2', 
    categoryId: 'campaigns', 
    title: 'Setting up a "Buy X Get Y" Campaign', 
    content: 'Create a new campaign and select the "BOGO" template.\n\n1. Define the "Trigger Product" (The X).\n2. Define the "Reward Product" (The Y).\n3. Set the discount amount (e.g., 50% off or Free).\n\n**Note:** Ensure your "Cart Status" is enabled so the discount applies automatically.',
    popular: true
  },
  { 
    id: '5', 
    categoryId: 'styling', 
    title: 'Custom CSS: Change Progress Bar Color', 
    content: 'You can override the default brand colors for specific widgets using Custom CSS.\n\nCopy and paste this into the "Custom CSS" tab of your widget:\n\n```css\n.dynamatic-progress-fill {\n  background-color: #ff0000 !important;\n  background-image: linear-gradient(45deg, #ff0000, #ff5500);\n}\n\n.dynamatic-text-highlight {\n  color: #ff0000;\n}```\n\nSave the widget to see changes immediately.' 
  },
  { 
    id: '6', 
    categoryId: 'styling', 
    title: 'Custom CSS: Hide Widget on Mobile', 
    content: 'If you want to hide a specific widget on mobile devices, use this snippet:\n\n```css\n@media only screen and (max-width: 768px) {\n  .dynamatic-widget-container {\n    display: none !important;\n  }\n}```' 
  },
  { 
    id: '7', 
    categoryId: 'troubleshooting', 
    title: 'Widget appearing twice (Rebuy Conflict)', 
    content: 'If you see two cart drawers opening, you likely have Rebuy or another cart app enabled.\n\n**Fix:**\n1. Go to Rebuy Smart Cart settings.\n2. Disable "Smart Cart".\n3. Ensure your theme\'s native cart drawer is also disabled if using Dynamatic as a replacement.' 
  },
];

interface UniversityProps {
  onRequestSupport: () => void;
}

const University: React.FC<UniversityProps> = ({ onRequestSupport }) => {
  const [view, setView] = useState<'home' | 'category' | 'article'>('home');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const activeCategory = CATEGORIES.find(c => c.id === activeCategoryId);
  const activeArticle = ARTICLES.find(a => a.id === activeArticleId);
  
  const filteredArticles = searchQuery 
    ? ARTICLES.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : (activeCategoryId ? ARTICLES.filter(a => a.categoryId === activeCategoryId) : []);

  const handleCategoryClick = (id: string) => {
    setActiveCategoryId(id);
    setView('category');
    setSearchQuery('');
  };

  const handleArticleClick = (id: string) => {
    setActiveArticleId(id);
    setView('article');
  };

  const goHome = () => {
    setView('home');
    setActiveCategoryId(null);
    setActiveArticleId(null);
    setSearchQuery('');
  };

  // Helper to render text with Code Blocks
  const renderContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```')) {
            const code = part.replace(/```(css)?/g, '').trim();
            return (
                <div key={index} className="bg-slate-900 text-slate-50 p-4 rounded-lg my-4 font-mono text-sm overflow-x-auto border border-slate-700">
                    <pre>{code}</pre>
                </div>
            );
        }
        return <p key={index} className="mb-4 leading-relaxed whitespace-pre-wrap">{part}</p>;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
           <button onClick={goHome} className="hover:text-blue-600 transition-colors">University</button>
           {view !== 'home' && (
             <>
               <ChevronRight className="w-4 h-4" />
               <button onClick={() => setView('category')} disabled={view === 'category'} className={`${view === 'category' ? 'font-semibold text-gray-900' : 'hover:text-blue-600'}`}>
                 {activeCategory?.title || 'Search Results'}
               </button>
             </>
           )}
           {view === 'article' && (
             <>
               <ChevronRight className="w-4 h-4" />
               <span className="font-semibold text-gray-900 truncate max-w-xs">{activeArticle?.title}</span>
             </>
           )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Dynamatic University</h1>
        <p className="text-gray-500 mt-1">Documentation, guides, and technical references.</p>
        
        {view !== 'article' && (
            <div className="mt-6 relative max-w-2xl">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search for articles (e.g., 'custom css', 'bogo')..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                />
            </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {/* Search Results */}
        {searchQuery && (
             <div className="max-w-3xl">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Search Results</h3>
                {filteredArticles.length > 0 ? (
                    <div className="space-y-4">
                        {filteredArticles.map(article => (
                            <div key={article.id} onClick={() => handleArticleClick(article.id)} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md cursor-pointer transition-all">
                                <h4 className="font-bold text-gray-900 mb-1">{article.title}</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{article.content.replace(/```[\s\S]*?```/g, '[Code Snippet]')}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <h3 className="font-medium text-gray-900">No articles found</h3>
                        <p className="text-gray-500 text-sm mt-1 mb-6">We couldn't find anything matching "{searchQuery}".</p>
                        <button 
                            onClick={onRequestSupport}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Open Support Ticket
                        </button>
                    </div>
                )}
             </div>
        )}

        {/* Home View */}
        {!searchQuery && view === 'home' && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mb-12">
                    {CATEGORIES.map(cat => (
                        <div 
                            key={cat.id} 
                            onClick={() => handleCategoryClick(cat.id)}
                            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group"
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${cat.color}`}>
                                    <cat.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{cat.title}</h3>
                                    <p className="text-gray-500 mt-1">{cat.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="max-w-5xl">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Popular Articles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ARTICLES.filter(a => a.popular).map(article => (
                            <div key={article.id} onClick={() => handleArticleClick(article.id)} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-all">
                                <BookOpen className="w-4 h-4 text-gray-400 mb-2" />
                                <h4 className="font-medium text-gray-900 text-sm hover:text-blue-600 line-clamp-2">{article.title}</h4>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-5xl mt-12 bg-indigo-50 border border-indigo-100 rounded-xl p-8 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900">Can't find what you need?</h3>
                        <p className="text-indigo-700 mt-1">Our support team is ready to help you with custom setups.</p>
                    </div>
                    <button 
                        onClick={onRequestSupport}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm flex items-center transition-colors"
                    >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Contact Support
                    </button>
                </div>
            </>
        )}

        {/* Category View */}
        {!searchQuery && view === 'category' && (
             <div className="max-w-3xl">
                <button onClick={goHome} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Categories
                </button>
                <div className="flex items-center space-x-3 mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeCategory?.color}`}>
                         {activeCategory && <activeCategory.icon className="w-5 h-5" />}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{activeCategory?.title}</h2>
                </div>
                
                <div className="space-y-3">
                    {filteredArticles.map(article => (
                        <div key={article.id} onClick={() => handleArticleClick(article.id)} className="bg-white p-5 rounded-xl border border-gray-200 hover:border-blue-300 cursor-pointer transition-all group flex justify-between items-center">
                             <div>
                                <h4 className="font-medium text-gray-900 group-hover:text-blue-600">{article.title}</h4>
                             </div>
                             <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                        </div>
                    ))}
                </div>
             </div>
        )}

        {/* Article View */}
        {!searchQuery && view === 'article' && activeArticle && (
             <div className="max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                 <div className="p-8 border-b border-gray-100">
                    <button onClick={() => activeCategoryId ? setView('category') : goHome()} className="flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{activeArticle.title}</h1>
                    <div className="flex items-center space-x-2 text-sm">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 font-medium">
                            {CATEGORIES.find(c => c.id === activeArticle.categoryId)?.title}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">Updated recently</span>
                    </div>
                 </div>
                 
                 <div className="p-8 text-gray-700">
                     {activeArticle.videoUrl && (
                         <div className="mb-8 bg-gray-100 rounded-xl aspect-video flex items-center justify-center text-gray-400 border border-gray-200">
                             <div className="text-center">
                                 <PlayCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                 <span className="text-sm font-medium">Video Tutorial Placeholder</span>
                             </div>
                         </div>
                     )}
                     
                     <div className="prose prose-blue max-w-none">
                        {renderContent(activeArticle.content)}
                     </div>
                 </div>

                 <div className="bg-gray-50 px-8 py-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div>
                        <span className="text-sm text-gray-500 block font-medium">Still need help with this?</span>
                        <span className="text-xs text-gray-400">Our support team can check your store directly.</span>
                     </div>
                     <button 
                        onClick={onRequestSupport}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                     >
                        Open Support Ticket
                     </button>
                 </div>
             </div>
        )}
      </div>
    </div>
  );
};

export default University;