"use client";
import { useState, useRef, useEffect } from "react";
import { Copy, Check, Link, Globe, Zap, Shield, BarChart, QrCode, ExternalLink, Clock, Lock, History, Sparkles, Download, Share2 } from "lucide-react";

// Define TypeScript interfaces
interface UrlStats {
  shortCode: string;
  createdAt: string;
  clicks: number;
  isExisting?: boolean;
  message?: string;
}

interface ApiResponseSuccess {
  shortUrl: string;
  shortCode?: string;
  originalUrl?: string;
  createdAt?: string;
  clicks?: number;
  isExisting?: boolean;
  message?: string;
  analytics?: {
    clicks: number;
    lastAccessed: string | null;
  };
}

interface ApiResponseError {
  error: string;
}

type ApiResponse = ApiResponseSuccess | ApiResponseError;

// QR Code component
const QRCodeDisplay = ({ url, onClose }: { url: string; onClose: () => void }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate QR code immediately when component mounts
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Import QRCode dynamically
        const QRCode = (await import('qrcode')).default;
        
        // Generate QR code as Data URL
        const dataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: '#7C3AED',
            light: '#1F2937'
          }
        });
        
        setQrCodeDataUrl(dataUrl);
        
        // Also draw to canvas for download
        if (canvasRef.current) {
          await QRCode.toCanvas(canvasRef.current, url, {
            width: 300,
            margin: 2,
            color: {
              dark: '#7C3AED',
              light: '#1F2937'
            }
          });
        }
      } catch (error) {
        console.error('QR Code generation error:', error);
      } finally {
        setIsGenerating(false);
      }
    };
    
    generateQRCode();
  }, [url]);

  const downloadQRCode = async () => {
    if (!canvasRef.current || isGenerating) return;
    
    setIsDownloading(true);
    
    try {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `qrcode-${url.split('/').pop() || 'url'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

 const shareQRCode = async () => {
  const shareData = {
    title: 'QR Code for Shortened URL',
    text: `Scan this QR code to visit: ${url}`,
    url: url,
  };

  try {
    // Check if Web Share API exists and can share this data
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      // Fallback: copy URL to clipboard
      await navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    }
  } catch (error) {
    console.error('Share failed:', error);
    // Optional fallback in case share fails
    try {
      await navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    } catch (clipError) {
      console.error('Clipboard copy failed:', clipError);
      alert('Failed to share or copy the URL.');
    }
  }
};


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 p-6 md:p-8 max-w-md w-full shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-lg">
              <QrCode className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-200">QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            aria-label="Close"
          >
            <span className="text-gray-400 hover:text-white">✕</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col items-center">
            {/* QR Code Canvas */}
            <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700/50 mb-4 min-h-[320px] min-w-[320px] flex items-center justify-center">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="h-10 w-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400">Generating QR code...</p>
                </div>
              ) : qrCodeDataUrl ? (
                <>
                  {/* Hidden canvas for download */}
                  <canvas ref={canvasRef} className="hidden" />
                  {/* Visible QR code image */}
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR Code for ${url}`}
                    className="w-64 h-64"
                  />
                </>
              ) : (
                <div className="text-center">
                  <p className="text-red-400 mb-2">Failed to generate QR code</p>
                  <p className="text-gray-400 text-sm">Please try again</p>
                </div>
              )}
            </div>
            
            {/* URL Display */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">Scan to visit:</p>
              <code className="text-gray-300 font-mono text-sm break-all bg-gray-900/50 px-3 py-2 rounded-lg">
                {url}
              </code>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadQRCode}
              disabled={isDownloading || isGenerating || !qrCodeDataUrl}
              className="flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </>
              )}
            </button>
            
            <button
              onClick={shareQRCode}
              disabled={isGenerating}
              className="flex items-center justify-center space-x-2 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-all duration-300 border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>QR codes are generated in real-time and contain your shortened URL.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [urlStats, setUrlStats] = useState<UrlStats | null>(null);
  const [isExistingUrl, setIsExistingUrl] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const handleShorten = async () => {
    setLoading(true);
    setError("");
    setShortUrl("");
    setCopied(false);
    setUrlStats(null);
    setIsExistingUrl(false);
    setShowQRCode(false);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ longUrl }),
      });

      const data: ApiResponse = await res.json();

      if (res.ok) {
        const successData = data as ApiResponseSuccess;
        setShortUrl(successData.shortUrl);
        setIsExistingUrl(successData.isExisting || false);
        
        setUrlStats({
          shortCode: successData.shortCode || successData.shortUrl.split("/").pop() || "",
          createdAt: successData.createdAt || new Date().toISOString(),
          clicks: successData.clicks || successData.analytics?.clicks || 0,
          isExisting: successData.isExisting,
          message: successData.message,
        });
      } else {
        const errorData = data as ApiResponseError;
        setError(errorData.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to shorten URL. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUrl = () => {
    if (!shortUrl) return;
    window.open(shortUrl, '_blank');
  };

  const handleGenerateQR = () => {
    if (!shortUrl) return;
    setQrCodeUrl(shortUrl);
    setShowQRCode(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && longUrl) {
      handleShorten();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 p-4 md:p-8">
      {/* QR Code Modal */}
      {showQRCode && <QRCodeDisplay url={qrCodeUrl} onClose={() => setShowQRCode(false)} />}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 md:mb-16 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl blur opacity-75 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-r from-purple-700 to-blue-600 rounded-xl">
                  <Link className="h-7 w-7" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                  Alex
                </h1>
                <p className="text-sm text-gray-400">Professional URL Shortening Service</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
                <QrCode className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-gray-300">QR Code</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700">
                <Clock className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium text-gray-300">Real-time</span>
              </div>
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-200 mb-4">
              Transform Long URLs into Clean, Shareable Links
            </h2>
            <p className="text-gray-400">
              Create shortened URLs with QR codes, analytics, and custom domains. Fast, secure, and free.
            </p>
            <div className="mt-6 p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 inline-block">
              <div className="flex items-center space-x-2 text-sm text-purple-400">
                <QrCode className="h-4 w-4" />
                <span>Generate QR codes for your shortened links!</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8 shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-lg">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-200">Shorten Your URL</h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-gray-300 font-medium flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <span>Enter Long URL</span>
                  </label>
                  <div className="relative group">
                    <input
                      type="url"
                      placeholder="https://example.com/very-long-url-path-that-needs-shortening"
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="w-full p-4 bg-gray-900/50 border-2 border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 group-hover:border-gray-600"
                      disabled={loading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Lock className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Press Enter to shorten or click the button below
                  </p>
                </div>

                <button
                  onClick={handleShorten}
                  disabled={loading || !longUrl}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    loading || !longUrl
                      ? "bg-gray-700 cursor-not-allowed opacity-50"
                      : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 shadow-lg hover:shadow-purple-500/25"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking URL...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Link className="h-5 w-5" />
                      <span>Shorten URL</span>
                    </div>
                  )}
                </button>

                {error && (
                  <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl animate-fadeIn">
                    <div className="flex items-center space-x-3">
                      <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-red-400 text-sm">!</span>
                      </div>
                      <p className="text-red-300">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Result Section */}
            {shortUrl && (
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8 shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${isExistingUrl ? 'bg-yellow-500/20' : 'bg-green-600/20'}`}>
                      {isExistingUrl ? (
                        <History className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <Check className="h-5 w-5 text-green-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-200">
                        {isExistingUrl ? "Existing Shortened URL" : "Your Shortened URL"}
                      </h3>
                      {urlStats?.message && (
                        <p className={`text-sm ${isExistingUrl ? 'text-yellow-400' : 'text-green-400'}`}>
                          {urlStats.message}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {isExistingUrl && (
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-400">Already Exists</span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-gray-300 font-medium">Short URL</label>
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="flex-1 bg-gray-900/50 border-2 border-gray-700 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Link className="h-5 w-5 text-purple-400" />
                            <code className="text-gray-100 font-mono text-lg truncate">{shortUrl}</code>
                          </div>
                          <div className={`px-3 py-1 rounded-lg text-xs font-medium ${copied ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            {copied ? 'Copied!' : 'Ready'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={handleCopy}
                          className={`px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
                            copied
                              ? "bg-gradient-to-r from-green-600 to-emerald-500"
                              : "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                            <span>{copied ? "Copied" : "Copy"}</span>
                          </div>
                        </button>
                        
                        <button
                          onClick={handleOpenUrl}
                          className="px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 rounded-xl font-semibold transition-all duration-300 border border-gray-600"
                        >
                          <div className="flex items-center space-x-2">
                            <ExternalLink className="h-5 w-5" />
                            <span>Visit</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Original URL Display */}
                  <div className="space-y-3">
                    <label className="text-gray-300 font-medium">Original URL</label>
                    <div className="p-4 bg-gray-900/30 rounded-xl border border-gray-700/50">
                      <p className="text-gray-400 text-sm truncate">{longUrl}</p>
                    </div>
                  </div>

                  {/* Stats Display */}
                  {urlStats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <BarChart className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-gray-400">Total Clicks</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{urlStats.clicks || 0}</div>
                      </div>
                      
                      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Clock className="h-4 w-4 text-purple-400" />
                          <span className="text-sm text-gray-400">Created</span>
                        </div>
                        <div className="text-lg text-gray-300">
                          {new Date(urlStats.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50">
                        <div className="flex items-center space-x-2 mb-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="text-sm text-gray-400">Status</span>
                        </div>
                        <div className={`text-lg font-medium ${isExistingUrl ? 'text-yellow-400' : 'text-green-400'}`}>
                          {isExistingUrl ? 'Existing' : 'New'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <button
                      onClick={handleGenerateQR}
                      className="p-4 bg-gradient-to-r from-purple-600/20 to-blue-500/20 hover:from-purple-600/30 hover:to-blue-500/30 rounded-xl border border-purple-500/30 transition-all duration-300 group"
                    >
                      <div className="flex items-center space-x-3">
                        <QrCode className="h-5 w-5 text-purple-400 group-hover:text-purple-300" />
                        <div>
                          <span className="text-gray-300 group-hover:text-white">Generate QR</span>
                          <p className="text-xs text-gray-500 group-hover:text-gray-400">Download & Share</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700/50 transition-all duration-300 group">
                      <div className="flex items-center space-x-3">
                        <BarChart className="h-5 w-5 text-green-400 group-hover:text-green-300" />
                        <div>
                          <span className="text-gray-300 group-hover:text-white">View Analytics</span>
                          <p className="text-xs text-gray-500 group-hover:text-gray-400">Track Performance</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700/50 transition-all duration-300 group">
                      <div className="flex items-center space-x-3">
                        <Share2 className="h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                        <div>
                          <span className="text-gray-300 group-hover:text-white">Share Link</span>
                          <p className="text-xs text-gray-500 group-hover:text-gray-400">Copy & Distribute</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features Sidebar */}
          <div className="space-y-6">
            {/* QR Code Info Card */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-6 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-600/20 to-blue-500/20 rounded-lg">
                  <QrCode className="h-5 w-5 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-200">QR Code Features</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-purple-400 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-300">Generate custom QR codes instantly</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-300">Download as PNG for printing</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-purple-400 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-300">Share QR codes directly</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-blue-400 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-300">Custom colors and styling</span>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-2xl">
              <h4 className="text-lg font-semibold text-gray-200 mb-6">Features</h4>
              <div className="space-y-4">
                {[
                  { icon: Zap, text: "Lightning Fast", color: "text-yellow-400", desc: "Instant URL shortening" },
                  { icon: Shield, text: "Secure Links", color: "text-green-400", desc: "HTTPS encrypted" },
                  { icon: BarChart, text: "Analytics", color: "text-blue-400", desc: "Track click data" },
                  { icon: QrCode, text: "QR Codes", color: "text-purple-400", desc: "Generate & download" },
                  { icon: History, text: "No Duplicates", color: "text-amber-400", desc: "Smart URL detection" },
                  { icon: Lock, text: "SSL Encryption", color: "text-cyan-400", desc: "Secure connections" },
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3 group">
                    <div className="p-2 bg-gray-900/50 rounded-lg group-hover:bg-gradient-to-r group-hover:from-gray-900/70 group-hover:to-gray-800/70 transition-all duration-300">
                      <feature.icon className={`h-4 w-4 ${feature.color}`} />
                    </div>
                    <div>
                      <span className="text-gray-300 group-hover:text-white transition-colors">{feature.text}</span>
                      <p className="text-xs text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-2xl border border-blue-500/20 p-6">
              <h4 className="text-lg font-semibold text-gray-200 mb-4">💡 How to Use QR Codes</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs text-blue-400">1</span>
                  </div>
                  <p className="text-sm text-gray-400">Shorten your URL first</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs text-blue-400">2</span>
                  </div>
                  <p className="text-sm text-gray-400">Click "Generate QR" button</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-xs text-blue-400">3</span>
                  </div>
                  <p className="text-sm text-gray-400">Download or share your QR code</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800/50 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-500 text-sm">
                Shortened links are encrypted. Analytics update in real-time.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <QrCode className="h-4 w-4" />
                <span>QR Code Generator</span>
              </div>
              <div className="h-4 w-px bg-gray-700"></div>
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <Shield className="h-4 w-4" />
                <span>Secure & Free</span>
              </div>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            © {new Date().getFullYear()} by ~Alex .D Mekhail~. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}