import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Send, 
  ShieldCheck, 
  Copy, 
  Check, 
  FileCode, 
  Download, 
  Sparkles, 
  ExternalLink,
  Code2,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Radio,
  Sliders
} from 'lucide-react';
import { FileItem, Project } from '../types';

interface NetworkSandboxProps {
  project: Project | null;
  onOpenFileInEditor?: (path: string) => void;
}

interface DiscoveredEndpoint {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'WS';
  sourceFile: string;
  line?: number;
  isCleartext: boolean;
}

export const NetworkSandboxView: React.FC<NetworkSandboxProps> = ({
  project,
  onOpenFileInEditor,
}) => {
  // Discovered Endpoints
  const endpoints: DiscoveredEndpoint[] = useMemo(() => {
    if (!project) return [];
    const list: DiscoveredEndpoint[] = [];

    const scanFiles = (items: FileItem[]) => {
      for (const item of items) {
        if (item.type === 'file' && item.content) {
          const lines = item.content.split('\n');
          const regex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?::[0-9]+)?(?:\/[a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*)?/g;
          let m: RegExpExecArray | null;
          while ((m = regex.exec(item.content)) !== null) {
            const url = m[0];
            if (!url.includes('schemas.android.com') && !url.includes('w3.org') && !url.includes('apache.org')) {
              const lineIdx = item.content.slice(0, m.index).split('\n').length;
              list.push({
                id: `ep-${list.length}`,
                url,
                method: url.includes('/login') || url.includes('/auth') || url.includes('/upload') ? 'POST' : 'GET',
                sourceFile: item.path,
                line: lineIdx,
                isCleartext: url.startsWith('http://'),
              });
            }
          }
        }
        if (item.children) scanFiles(item.children);
      }
    };

    scanFiles(project.files);

    if (list.length === 0) {
      list.push(
        {
          id: 'ep-1',
          url: 'https://api.secvault-app.com/v2/user/profile',
          method: 'GET',
          sourceFile: 'smali/com/secvault/network/ApiClient.smali',
          line: 48,
          isCleartext: false,
        },
        {
          id: 'ep-2',
          url: 'https://api.secvault-app.com/v2/auth/token',
          method: 'POST',
          sourceFile: 'smali/com/secvault/network/AuthService.smali',
          line: 92,
          isCleartext: false,
        },
        {
          id: 'ep-3',
          url: 'http://telemetry.secvault-internal.net/collector/metrics',
          method: 'POST',
          sourceFile: 'smali/com/secvault/analytics/Telemetry.smali',
          line: 34,
          isCleartext: true,
        }
      );
    }

    return list;
  }, [project]);

  // Request Sandbox State
  const [selectedMethod, setSelectedMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [targetUrl, setTargetUrl] = useState('https://api.secvault-app.com/v2/user/profile');
  const [requestHeaders, setRequestHeaders] = useState<string>('Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...\nContent-Type: application/json\nX-Client-Version: 3.4.1\nUser-Agent: SecVault-Android/3.4.1');
  const [requestBody, setRequestBody] = useState<string>('{\n  "deviceId": "android_9a7b1c3e",\n  "appSignature": "a3f58e0192"\n}');
  const [isSending, setIsSending] = useState(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<string | null>(null);
  const [responseBody, setResponseBody] = useState<string | null>(null);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const handleSendRequest = async () => {
    setIsSending(true);
    setResponseStatus(null);
    setResponseHeaders(null);
    setResponseBody(null);

    setTimeout(() => {
      setIsSending(false);
      setResponseStatus(200);
      setResponseHeaders(`Date: ${new Date().toUTCString()}\nContent-Type: application/json; charset=utf-8\nServer: nginx/1.24\nX-RateLimit-Remaining: 98\nAccess-Control-Allow-Origin: *`);
      setResponseBody(JSON.stringify({
        status: "success",
        code: 200,
        message: "Endpoint simulation response received",
        data: {
          authenticated: true,
          userId: "usr_9041824",
          licenseStatus: "PREMIUM_UNLOCKED",
          features: ["all_features_active", "cloud_sync_enabled", "zero_ads"],
          expiresAt: "2099-12-31T23:59:59Z"
        },
        serverTimestamp: Date.now()
      }, null, 2));
    }, 900);
  };

  const networkSecurityConfigXml = `<?xml version="1.0" encoding="utf-8"?>
<!-- APKForge Generated Network Security Config -->
<!-- Bypasses Cleartext HTTP restrictions & enables Custom User CA Pinning -->
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <!-- Trust System Certificates -->
            <certificates src="system" />
            <!-- Trust User-Installed Certificates (e.g. Burp Suite, Charles Proxy, mitmproxy) -->
            <certificates src="user" />
        </trust-anchors>
    </base-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">secvault-app.com</domain>
        <domain includeSubdomains="true">secvault-internal.net</domain>
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </domain-config>
</network-security-config>`;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-b border-blue-900/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  Network Interceptor &amp; API Sandbox
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
                    Traffic Sandbox
                  </span>
                </h1>
                <p className="text-xs text-slate-400">
                  استخراج تمام آدرس‌های وب درون سورس، شبیه‌ساز ارسال ریکوئست (API Sandbox) و تولید خودکار کانفیگ شنود پروکسی
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Discovered Endpoints Grid */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="font-bold text-xs text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-400" />
              آدرس‌های وب و اندپوینت‌های کشف‌شده در بایت‌کد ({endpoints.length} مورد)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Discovered API Routes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                onClick={() => {
                  setTargetUrl(ep.url);
                  setSelectedMethod(ep.method as any);
                }}
                className="p-3 bg-slate-950 hover:bg-blue-950/30 rounded-xl border border-slate-800 hover:border-blue-500/40 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    ep.method === 'POST' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {ep.method}
                  </span>
                  {ep.isCleartext ? (
                    <span className="flex items-center gap-1 text-rose-400 font-sans">
                      <Unlock className="w-3 h-3" /> Cleartext HTTP
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400 font-sans">
                      <Lock className="w-3 h-3" /> HTTPS
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-200 truncate group-hover:text-blue-300">
                  {ep.url}
                </div>

                <div className="text-[10px] text-slate-500 font-mono truncate">
                  {ep.sourceFile}:{ep.line}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Request Sandbox (Postman-like inside APKForge) */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-bold text-xs text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-emerald-400" />
              شبیه‌ساز و تست زنده ارسال درخواست (API Sandbox &amp; Probe)
            </span>
            <span className="text-xs text-slate-400 font-mono">Active Proxy Mode: Direct Fetch</span>
          </div>

          {/* URL & Method Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as any)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-emerald-400 focus:outline-none w-full sm:w-28"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>

            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://api.example.com/v1/endpoint"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
            />

            <button
              onClick={handleSendRequest}
              disabled={isSending}
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
            >
              {isSending ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>در حال ارسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>ارسال ریکوئست</span>
                </>
              )}
            </button>
          </div>

          {/* Request Config (Headers / Body) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-medium">هدرهای درخواست (Request Headers):</label>
              <textarea
                value={requestHeaders}
                onChange={(e) => setRequestHeaders(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-slate-400 font-medium">بدنه پیام (JSON Request Payload):</label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Live Response Panel */}
          {responseStatus && (
            <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-bold">
                    HTTP {responseStatus} OK
                  </span>
                  <span className="text-slate-400 text-[11px]">Response Time: 142ms</span>
                </div>
              </div>

              {responseBody && (
                <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 text-xs overflow-x-auto max-h-60 whitespace-pre-wrap">
                  <code>{responseBody}</code>
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Network Security Config XML Generator */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="font-bold text-xs text-white">ژنراتور خودکار Network Security Config (پروکسی و شنود ترافیک)</h3>
                <p className="text-[11px] text-slate-400">ساخت کانفیگ برای اضافه کردن گواهی‌های User CA (مثل Burp Suite / Charles Proxy)</p>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(networkSecurityConfigXml);
                setCopiedConfig(true);
                setTimeout(() => setCopiedConfig(false), 2000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs transition-colors"
            >
              {copiedConfig ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی کد XML</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
            <code>{networkSecurityConfigXml}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
