import React, { useState } from 'react';
import { 
  Zap, 
  Copy, 
  Check, 
  Terminal, 
  Download, 
  Sparkles, 
  Play, 
  FileCode2, 
  Code2, 
  Layers,
  CheckCircle2
} from 'lucide-react';
import { Project } from '../types';

interface FridaHookGeneratorViewProps {
  project: Project | null;
}

export const FridaHookGeneratorView: React.FC<FridaHookGeneratorViewProps> = ({ project }) => {
  const [hookType, setHookType] = useState<'ssl' | 'root' | 'method' | 'crypto' | 'xposed'>('ssl');
  const [targetClass, setTargetClass] = useState('com.secvault.MainActivity');
  const [targetMethod, setTargetMethod] = useState('isDeviceRooted');
  const [copied, setCopied] = useState(false);

  const generateScript = () => {
    const pkg = project?.packageName || 'com.secvault.apk';

    if (hookType === 'ssl') {
      return `/*
 * APKForge AI - Universal Android SSL Pinning Bypass (Frida Script)
 * Target Package: ${pkg}
 */
Java.perform(function () {
    console.log("[*] APKForge AI: Initializing Universal SSL Pinning Bypass...");

    // 1. TrustManager (Trust all certs)
    var TrustManager = Java.use('javax.net.ssl.X509TrustManager');
    var SSLContext = Java.use('javax.net.ssl.SSLContext');

    var TrustManagerImpl = Java.registerClass({
        name: 'com.apkforge.TrustAllTrustManager',
        implements: [TrustManager],
        methods: {
            checkClientTrusted: function (chain, authType) {},
            checkServerTrusted: function (chain, authType) {},
            getAcceptedIssuers: function () { return []; }
        }
    });

    var TrustManagers = [TrustManagerImpl.$new()];
    var SSLContext_init = SSLContext.init.overload(
        '[Ljavax.net.ssl.KeyManager;', '[Ljavax.net.ssl.TrustManager;', 'java.security.SecureRandom'
    );

    SSLContext_init.implementation = function (km, tm, sr) {
        console.log("[+] Intercepted SSLContext.init() -> Overriding with TrustAllTrustManager");
        SSLContext_init.call(this, km, TrustManagers, sr);
    };

    // 2. OkHttp3 CertificatePinner
    try {
        var CertificatePinner = Java.use('okhttp3.CertificatePinner');
        CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function (str, list) {
            console.log("[+] OkHttp3.CertificatePinner.check() bypassed for: " + str);
            return;
        };
    } catch (err) {
        console.log("[-] OkHttp3 CertificatePinner not found in classpath.");
    }

    console.log("[✓] SSL Pinning Bypass active.");
});`;
    }

    if (hookType === 'root') {
      return `/*
 * APKForge AI - Root Detection & Anti-Tamper Bypass (Frida Script)
 * Target Package: ${pkg}
 */
Java.perform(function () {
    console.log("[*] APKForge AI: Initializing Root Detection Bypass...");

    // 1. Hook File.exists for su binaries
    var File = Java.use("java.io.File");
    File.exists.implementation = function () {
        var path = this.getAbsolutePath();
        if (path.indexOf("/su") !== -1 || 
            path.indexOf("/magisk") !== -1 || 
            path.indexOf("/daemonsu") !== -1 || 
            path.indexOf("Superuser.apk") !== -1 || 
            path.indexOf("busybox") !== -1) {
            console.log("[+] Root check blocked on path: " + path);
            return false;
        }
        return this.exists();
    };

    // 2. Hook Runtime.exec for su / which
    var Runtime = Java.use("java.lang.Runtime");
    Runtime.exec.overload('java.lang.String').implementation = function (cmd) {
        if (cmd.indexOf("su") !== -1 || cmd.indexOf("which") !== -1) {
            console.log("[+] Runtime.exec blocked command: " + cmd);
            return Runtime.exec.call(this, "echo not_found");
        }
        return this.exec(cmd);
    };

    // 3. Hook Build tags (test-keys)
    var Build = Java.use("android.os.Build");
    Build.TAGS.value = "release-keys";

    console.log("[✓] Root checks neutralized.");
});`;
    }

    if (hookType === 'method') {
      return `/*
 * APKForge AI - Dynamic Method Tracer & Parameter Interceptor
 * Target: ${targetClass}.${targetMethod}
 */
Java.perform(function () {
    try {
        var TargetClass = Java.use("${targetClass}");
        var methods = TargetClass["${targetMethod}"].overloads;

        console.log("[*] Hooking ${targetClass}.${targetMethod} (" + methods.length + " overload(s))...");

        methods.forEach(function (overload) {
            overload.implementation = function () {
                console.log("\\n[-->] ENTER: ${targetClass}.${targetMethod}");
                for (var i = 0; i < arguments.length; i++) {
                    console.log("      Arg[" + i + "]: " + arguments[i]);
                }

                // Call original method
                var retval = this["${targetMethod}"].apply(this, arguments);
                console.log("[<--] RETURN: " + retval);
                return retval;
            };
        });
        console.log("[✓] Hook established successfully.");
    } catch (e) {
        console.error("[-] Failed to hook class or method: " + e.message);
    }
});`;
    }

    if (hookType === 'crypto') {
      return `/*
 * APKForge AI - Android Cryptographic Key & Cipher Sniffer
 * Intercepts AES, RSA, DES, and IV Initialization Vectors
 */
Java.perform(function () {
    console.log("[*] Sniffing javax.crypto.Cipher instances...");

    var Cipher = Java.use("javax.crypto.Cipher");
    var SecretKeySpec = Java.use("javax.crypto.spec.SecretKeySpec");
    var IvParameterSpec = Java.use("javax.crypto.spec.IvParameterSpec");

    Cipher.doFinal.overload('[B').implementation = function (bytes) {
        console.log("\\n[CRYPTO] Cipher.doFinal() called on algorithm: " + this.getAlgorithm());
        console.log("         Input Hex: " + bytesToHex(bytes));
        var result = this.doFinal(bytes);
        console.log("         Output Hex: " + bytesToHex(result));
        return result;
    };

    function bytesToHex(b) {
        if (!b) return "null";
        var str = "";
        for (var i = 0; i < b.length; i++) {
            var hex = (b[i] & 0xff).toString(16);
            str += (hex.length === 1 ? "0" + hex : hex) + " ";
        }
        return str;
    }
});`;
    }

    // Xposed Java module
    return `// Xposed Framework Hook Implementation
package com.apkforge.xposed;

import de.robv.android.xposed.IXposedHookLoadPackage;
import de.robv.android.xposed.XC_MethodHook;
import de.robv.android.xposed.XposedBridge;
import de.robv.android.xposed.XposedHelpers;
import de.robv.android.xposed.callbacks.XC_LoadPackage.LoadPackageParam;

public class ModuleMain implements IXposedHookLoadPackage {
    @Override
    public void handleLoadPackage(final LoadPackageParam lpparam) throws Throwable {
        if (!lpparam.packageName.equals("${pkg}")) {
            return;
        }
        XposedBridge.log("[APKForge] Hooking into: " + lpparam.packageName);

        XposedHelpers.findAndHookMethod(
            "${targetClass}",
            lpparam.classLoader,
            "${targetMethod}",
            new XC_MethodHook() {
                @Override
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                    XposedBridge.log("[+] Hook before method call: ${targetMethod}");
                }

                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    // Force method to return true / bypass
                    param.setResult(Boolean.TRUE);
                    XposedBridge.log("[+] Hook replaced return value with true");
                }
            }
        );
    }
}`;
  };

  const scriptCode = generateScript();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Frida &amp; Xposed Hook Script Generator
          </h1>
          <p className="text-xs text-slate-400">
            Generate production-grade JavaScript &amp; Java hooks for dynamic instrumentation, SSL bypass, and root evasion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const blob = new Blob([scriptCode], { type: 'text/javascript' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = hookType === 'xposed' ? 'ModuleMain.java' : `hook-${hookType}.js`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Script</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(scriptCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all active:scale-95 shadow-md shadow-amber-950/40"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Script'}</span>
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { id: 'ssl', label: 'Universal SSL Unpin', icon: Zap },
          { id: 'root', label: 'Root / Su Bypass', icon: CheckCircle2 },
          { id: 'method', label: 'Method Interceptor', icon: Terminal },
          { id: 'crypto', label: 'Crypto Key Sniffer', icon: Sparkles },
          { id: 'xposed', label: 'Xposed Java Module', icon: Layers },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setHookType(item.id as any)}
            className={`p-3 rounded-xl border text-left text-xs space-y-1 transition-all ${
              hookType === item.id
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-md shadow-amber-950/20 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <div className="text-xs">{item.label}</div>
          </button>
        ))}
      </div>

      {/* Method Parameters for custom hook */}
      {hookType === 'method' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Full Class Path</label>
            <input
              type="text"
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Target Method Name</label>
            <input
              type="text"
              value={targetMethod}
              onChange={(e) => setTargetMethod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-100"
            />
          </div>
        </div>
      )}

      {/* Script Code Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-amber-300">
            {hookType === 'xposed' ? 'ModuleMain.java' : 'frida-agent.js'}
          </span>
          <span className="text-[11px]">Usage: frida -U -f {project?.packageName || 'com.example'} -l script.js</span>
        </div>
        <pre className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed max-h-[500px]">
          <code>{scriptCode}</code>
        </pre>
      </div>
    </div>
  );
};
