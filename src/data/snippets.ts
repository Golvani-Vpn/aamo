import { Snippet } from '../types';

export const SMALI_SNIPPETS: Snippet[] = [
  {
    id: 'snip-ssl-bypass',
    title: 'TrustAllCerts SSL Pinning Bypass',
    description: 'Custom X509TrustManager implementation that accepts all SSL/TLS certificates for MITM traffic analysis.',
    category: 'bypass',
    targetType: 'smali',
    code: `.class public Lcom/apkforge/ai/security/TrustAllManager;
.super Ljava/lang/Object;
.implements Ljavax/net/ssl/X509TrustManager;

.method public constructor <init>()V
    .registers 1
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    return-void
.end method

.method public checkClientTrusted([Ljava/security/cert/X509Certificate;Ljava/lang/String;)V
    .registers 3
    # No-op to accept any client cert
    return-void
.end method

.method public checkServerTrusted([Ljava/security/cert/X509Certificate;Ljava/lang/String;)V
    .registers 3
    # No-op bypass server verification
    return-void
.end method

.method public getAcceptedIssuers()[Ljava/security/cert/X509Certificate;
    .registers 2
    const/4 v0, 0x0
    new-array v0, v0, [Ljava/security/cert/X509Certificate;
    return-object v0
.end method`
  },
  {
    id: 'snip-log-register',
    title: 'Logcat Register Value Dumper',
    description: 'Injects an android.util.Log call to inspect string or variable registers at runtime.',
    category: 'hook',
    targetType: 'smali',
    code: `    # --- APKForge AI Injected Logcat Monitor ---
    const-string v0, "APKForge_Debug"
    invoke-static {v0, p1}, Landroid/util/Log;->d(Ljava/lang/String;Ljava/lang/String;)I
    # ------------------------------------------`
  },
  {
    id: 'snip-toast-hook',
    title: 'Show Injected Toast Notification',
    description: 'Injects a quick Android Toast notification when an activity or method is invoked.',
    category: 'hook',
    targetType: 'smali',
    code: `    # --- APKForge AI Toast Hook ---
    const-string v0, "Hooked by APKForge AI Engine"
    const/4 v1, 0x1
    invoke-static {p0, v0, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v0
    invoke-virtual {v0}, Landroid/widget/Toast;->show()V
    # ------------------------------`
  },
  {
    id: 'snip-root-bypass',
    title: 'Root Detection Return False Bypass',
    description: 'Forces isDeviceRooted() or checkSuBinary() checks to always return boolean false (0x0).',
    category: 'bypass',
    targetType: 'smali',
    code: `.method public static isRooted()Z
    .registers 1
    # Overwritten by APKForge AI: Always return false
    const/4 v0, 0x0
    return v0
.end method`
  },
  {
    id: 'snip-license-check',
    title: 'License & Subscription True Bypass',
    description: 'Forces isPremiumUser() or isLicenseValid() to return true (0x1).',
    category: 'bypass',
    targetType: 'smali',
    code: `.method public isPremiumActive()Z
    .registers 2
    # APKForge AI: Forced Premium activation
    const/4 v0, 0x1
    return v0
.end method`
  },
  {
    id: 'snip-network-sec-config',
    title: 'Network Security Config (Allow User Certs)',
    description: 'XML configuration file allowing user-installed CA certificates for HTTPS proxying (Charles/Burp).',
    category: 'xml',
    targetType: 'xml',
    code: `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>`
  },
  {
    id: 'snip-manifest-debuggable',
    title: 'AndroidManifest Debug & Network Flags',
    description: 'Flags to enable debugging, backup, and network config in AndroidManifest.xml.',
    category: 'xml',
    targetType: 'manifest',
    code: `android:debuggable="true"
android:networkSecurityConfig="@xml/network_security_config"
android:usesCleartextTraffic="true"
android:allowBackup="true"`
  }
];
