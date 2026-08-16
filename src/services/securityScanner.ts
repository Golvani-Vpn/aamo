import { FileItem, Project, SecurityVulnerability } from '../types';

export class SecurityScanner {
  static scanProject(project: Project): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const allFiles = this.flattenFiles(project.files);

    const manifestFile = allFiles.find(f => f.name.toLowerCase() === 'androidmanifest.xml');
    if (manifestFile && manifestFile.content) {
      this.auditManifest(manifestFile.content, vulnerabilities);
    }

    const smaliFiles = allFiles.filter(f => f.extension === 'smali');
    for (const smali of smaliFiles) {
      if (smali.content) {
        this.auditSmali(smali.path, smali.content, vulnerabilities);
      }
    }

    const stringFiles = allFiles.filter(f => f.name === 'strings.xml' || f.name.endsWith('.json'));
    for (const strFile of stringFiles) {
      if (strFile.content) {
        this.auditSecrets(strFile.path, strFile.content, vulnerabilities);
      }
    }

    return vulnerabilities;
  }

  private static flattenFiles(files: FileItem[]): FileItem[] {
    const list: FileItem[] = [];
    for (const item of files) {
      if (item.type === 'file') {
        list.push(item);
      } else if (item.children) {
        list.push(...this.flattenFiles(item.children));
      }
    }
    return list;
  }

  private static auditManifest(content: string, list: SecurityVulnerability[]) {
    if (content.includes('android:debuggable="true"')) {
      list.push({
        id: 'vuln-debuggable-true',
        title: 'Application is Marked as Debuggable',
        severity: 'HIGH',
        category: 'MANIFEST',
        description: 'android:debuggable="true" allows an attacker or reverse engineer to attach jdb/lldb debuggers to inspect memory, decrypt keys, and bypass security logic in production.',
        location: 'AndroidManifest.xml (<application>)',
        affectedCode: 'android:debuggable="true"',
        remediation: 'Remove android:debuggable or set it to "false" in release build variants.',
        suggestedPatch: 'android:debuggable="false"'
      });
    }

    if (content.includes('android:usesCleartextTraffic="true"')) {
      list.push({
        id: 'vuln-cleartext-traffic',
        title: 'Cleartext HTTP Traffic Permitted',
        severity: 'HIGH',
        category: 'NETWORK',
        description: 'The app permits unencrypted HTTP transmission, making network traffic vulnerable to sniffing and Man-in-the-Middle (MitM) eavesdropping.',
        location: 'AndroidManifest.xml (<application>)',
        affectedCode: 'android:usesCleartextTraffic="true"',
        remediation: 'Enforce HTTPS communication and set android:usesCleartextTraffic="false", configuring network_security_config.xml.',
        suggestedPatch: 'android:usesCleartextTraffic="false"'
      });
    }

    if (content.includes('android:allowBackup="true"')) {
      list.push({
        id: 'vuln-allow-backup',
        title: 'Application Data Backup Enabled (ADB Backup)',
        severity: 'MEDIUM',
        category: 'MANIFEST',
        description: 'Allowing ADB backup enables extraction of the private internal application storage directory (/data/data/<package>) via "adb backup".',
        location: 'AndroidManifest.xml (<application>)',
        affectedCode: 'android:allowBackup="true"',
        remediation: 'Set android:allowBackup="false" unless automated cloud backup rules are strictly filtered.',
        suggestedPatch: 'android:allowBackup="false"'
      });
    }

    // Exported components check
    const exportedRegex = /<(activity|service|receiver|provider)[^>]*android:name="([^"]+)"[^>]*android:exported="true"[^>]*>/gi;
    let match;
    while ((match = exportedRegex.exec(content)) !== null) {
      const compType = match[1];
      const compName = match[2];
      // Skip main launcher activity
      if (content.slice(match.index, match.index + 200).includes('android.intent.action.MAIN')) {
        continue;
      }
      list.push({
        id: `vuln-exported-${compName}`,
        title: `Insecure Exported Component: ${compName}`,
        severity: compType === 'provider' ? 'CRITICAL' : 'MEDIUM',
        category: 'MANIFEST',
        description: `Exported <${compType}> without signature protection permission can be arbitrarily invoked or queried by malicious 3rd-party apps on the device.`,
        location: `AndroidManifest.xml (<${compType} android:name="${compName}">)`,
        affectedCode: match[0],
        remediation: `Set android:exported="false" or protect with android:permission="signature".`,
        suggestedPatch: match[0].replace('android:exported="true"', 'android:exported="false"')
      });
    }
  }

  private static auditSmali(filePath: string, content: string, list: SecurityVulnerability[]) {
    // Check for Weak MD5 or SHA1
    if (content.includes('"MD5"') || content.includes('MessageDigest;->getInstance(Ljava/lang/String;)')) {
      list.push({
        id: `vuln-weak-crypto-${filePath}`,
        title: 'Weak Cryptographic Hash Algorithm (MD5 / SHA-1)',
        severity: 'MEDIUM',
        category: 'CRYPTOGRAPHY',
        description: 'MD5 is cryptographically broken and vulnerable to collision and pre-image attacks.',
        location: filePath,
        affectedCode: 'const-string v0, "MD5"',
        remediation: 'Upgrade to SHA-256 or SHA-512 with PBKDF2/Argon2 for password verification.',
        suggestedPatch: 'const-string v0, "SHA-256"'
      });
    }

    // Check for Hardcoded IV or Keys
    if (content.includes('fill-array-data') && content.includes('HARDCODED_IV')) {
      list.push({
        id: `vuln-hardcoded-iv-${filePath}`,
        title: 'Static / Hardcoded Cryptographic Initialization Vector (IV)',
        severity: 'HIGH',
        category: 'CRYPTOGRAPHY',
        description: 'Reusing static IVs in CBC or GCM cipher modes allows ciphertext prediction and cryptographic degradation.',
        location: filePath,
        affectedCode: 'sput-object v0, L...;->HARDCODED_IV:[B',
        remediation: 'Generate cryptographically secure pseudo-random IVs with java.security.SecureRandom on every encryption pass.',
        suggestedPatch: 'invoke-static {v0}, Ljava/security/SecureRandom;->getInstanceStrong()Ljava/security/SecureRandom;'
      });
    }

    // Check for Root Detection
    if (content.includes('isDeviceCompromised') || content.includes('/system/bin/su')) {
      list.push({
        id: `vuln-root-check-${filePath}`,
        title: 'Bypassable Client-Side Root Detection',
        severity: 'LOW',
        category: 'SMALI',
        description: 'Client-side root checking methods can be trivially patched in Smali or hooked with Frida/Xposed.',
        location: filePath,
        affectedCode: 'invoke-static {}, Lcom/.../RootChecker;->isDeviceCompromised()Z',
        remediation: 'Combine client checks with Play Integrity API / SafetyNet hardware-attested token validation on the backend.',
        suggestedPatch: '# Inject Root detection hook'
      });
    }
  }

  private static auditSecrets(filePath: string, content: string, list: SecurityVulnerability[]) {
    // API Keys regex (e.g. sk_live_, AIza, bearer tokens)
    const secretRegex = /(sk_live_[a-zA-Z0-9]{24,}|AIza[0-9A-Za-z-_]{35}|ghp_[a-zA-Z0-9]{36})/g;
    let match;
    while ((match = secretRegex.exec(content)) !== null) {
      list.push({
        id: `vuln-secret-${match[0].slice(0, 8)}`,
        title: 'Hardcoded Production API Secret Key',
        severity: 'CRITICAL',
        category: 'CRYPTOGRAPHY',
        description: `Sensitive API token found in plain text in ${filePath}. Any attacker decompiling the APK can extract this credential.`,
        location: filePath,
        affectedCode: match[0],
        remediation: 'Never bundle secret tokens in APK resources or source code. Use Android Keystore, backend token proxying, or Cloud Secret Manager.',
        suggestedPatch: '[REMOVED_SECRET_KEY]'
      });
    }
  }
}
