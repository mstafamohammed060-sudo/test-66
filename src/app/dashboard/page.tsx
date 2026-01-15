"use client";

import { useEffect, useState } from "react";
import { 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Copy, 
  ExternalLink, 
  BarChart3, 
  Calendar,
  Link as LinkIcon,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Shield,
  Globe,
  ChevronRight,
  TrendingUp,
  Clock
} from "lucide-react";

interface Url {
  id: number;
  longUrl: string;
  shortCode: string;
  createdAt: string;
  clicks?: number;
}

export default function Dashboard() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalUrls: 0,
    totalClicks: 0,
    avgUrlLength: 0
  });

  const fetchUrls = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/urls");
      const data = await res.json();
      setUrls(data);
      
      // Calculate statistics
      const totalClicks = data.reduce((sum: number, url: Url) => sum + (url.clicks || 0), 0);
      const avgUrlLength = data.length > 0 
        ? Math.round(data.reduce((sum: number, url: Url) => sum + url.longUrl.length, 0) / data.length)
        : 0;
      
      setStats({
        totalUrls: data.length,
        totalClicks,
        avgUrlLength
      });
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleUpdate = async (id: number) => {
    if (!newUrl) return;
    try {
      await fetch(`/api/urls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl: newUrl }),
      });
      setEditingId(null);
      setNewUrl("");
      fetchUrls();
    } catch (error) {
      console.error("Failed to update URL:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this URL?")) return;
    try {
      await fetch(`/api/urls/${id}`, { method: "DELETE" });
      fetchUrls();
    } catch (error) {
      console.error("Failed to delete URL:", error);
    }
  };

  const handleCopy = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const filteredUrls = urls.filter(url =>
    url.longUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 p-4 md:p-8">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl">
                  <LinkIcon className="h-6 w-6" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  URL Dashboard
                </h1>
              </div>
              <p className="text-gray-400">Manage and monitor all your shortened URLs</p>
            </div>
            
            <button
              onClick={fetchUrls}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-700 transition-all duration-300 group"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''} group-hover:rotate-180 transition-transform`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <LinkIcon className="h-5 w-5 text-purple-400" />
                </div>
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.totalUrls}</div>
              <div className="text-sm text-gray-400">Shortened URLs</div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-sm text-gray-400">Total</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.totalClicks.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Total Clicks</div>
            </div>

            <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-sm text-gray-400">Average</span>
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stats.avgUrlLength}</div>
              <div className="text-sm text-gray-400">URL Length</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by URL or short code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-400">{filteredUrls.length} URLs</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading URLs...</p>
              </div>
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="text-center py-20 bg-gray-800/20 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-800/50 rounded-full flex items-center justify-center">
                <LinkIcon className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No URLs Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm ? 'No URLs match your search. Try a different term.' : 'Start by creating your first shortened URL.'}
              </p>
            </div>
          ) : (
            <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>Short URL</span>
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">
                        <div className="flex items-center space-x-2">
                          <LinkIcon className="h-4 w-4" />
                          <span>Destination</span>
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>Clicks</span>
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created</span>
                        </div>
                      </th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">
                        <div className="flex items-center space-x-2">
                          <Edit className="h-4 w-4" />
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUrls.map((url) => (
                      <tr 
                        key={url.id} 
                        className="border-b border-gray-700/30 hover:bg-gray-700/10 transition-colors duration-200 group"
                      >
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="p-1.5 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
                                <LinkIcon className="h-3.5 w-3.5 text-purple-400" />
                              </div>
                              <code className="font-mono text-sm bg-gray-900/50 px-2 py-1 rounded">
                                {window.location.host}/{url.shortCode}
                              </code>
                            </div>
                            <div className="flex items-center space-x-3 text-xs">
                              <button
                                onClick={() => handleCopy(`${window.location.origin}/${url.shortCode}`, url.id)}
                                className={`flex items-center space-x-1 text-gray-400 hover:text-white transition-colors ${
                                  copiedId === url.id ? 'text-green-400' : ''
                                }`}
                              >
                                {copiedId === url.id ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                              <a
                                href={`/${url.shortCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Visit</span>
                              </a>
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          {editingId === url.id ? (
                            <div className="space-y-3">
                              <input
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-900/50 border-2 border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                                placeholder="Enter new destination URL"
                                autoFocus
                              />
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleUpdate(url.id)}
                                  className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 rounded-lg text-sm font-medium transition-all duration-300"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  <span>Save</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingId(null);
                                    setNewUrl("");
                                  }}
                                  className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-all duration-300"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="group">
                              <p className="text-gray-300 truncate max-w-xs">{url.longUrl}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {url.longUrl.length} characters
                              </p>
                            </div>
                          )}
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4 text-blue-400" />
                            <span className="font-semibold">{url.clicks || 0}</span>
                            <span className="text-xs text-gray-500">clicks</span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-gray-300 text-sm">{formatDate(url.createdAt)}</span>
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{getTimeAgo(url.createdAt)}</span>
                            </span>
                          </div>
                        </td>
                        
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            {editingId === url.id ? null : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingId(url.id);
                                    setNewUrl(url.longUrl);
                                  }}
                                  className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-all duration-300 group/edit"
                                  title="Edit URL"
                                >
                                  <Edit className="h-4 w-4 group-hover/edit:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() => handleDelete(url.id)}
                                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-300 group/delete"
                                  title="Delete URL"
                                >
                                  <Trash2 className="h-4 w-4 group-hover/delete:scale-110 transition-transform" />
                                </button>
                                <button
                                  className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 group/analytics"
                                  title="View Analytics"
                                >
                                  <BarChart3 className="h-4 w-4 group-hover/analytics:scale-110 transition-transform" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="px-6 py-4 border-t border-gray-700/50 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing <span className="font-medium text-gray-300">{filteredUrls.length}</span> of{' '}
                  <span className="font-medium text-gray-300">{urls.length}</span> URLs
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span>All links are secure</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-gray-600 text-sm mt-2">
            © {new Date().getFullYear()} ~Alex .D Mekhail~. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        tr {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}