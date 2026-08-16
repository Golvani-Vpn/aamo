import { Project } from '../types';

export const SAMPLE_PROJECTS: Project[] = [
  {
    id: 'proj-vault-pro',
    name: 'SecureVault_v2.4.apk',
    packageName: 'com.secvault.passguard',
    versionName: '2.4.0',
    versionCode: 24,
    minSdk: 26,
    targetSdk: 34,
    fileCount: 28,
    smaliClassCount: 14,
    sizeBytes: 8421000,
    lastModified: '2026-08-16 10:30 AM',
    createdDate: '2026-08-15 04:12 PM',
    isBackupAvailable: true,
    vulnerabilitiesCount: {
      critical: 1,
      high: 2,
      medium: 3,
      low: 1,
    },
    files: [
      {
        id: 'f-manifest',
        name: 'AndroidManifest.xml',
        path: 'AndroidManifest.xml',
        type: 'file',
        extension: 'xml',
        size: 2450,
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.secvault.passguard"
    android:versionCode="24"
    android:versionName="2.4.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.SecureVault"
        android:usesCleartextTraffic="true"
        android:debuggable="false">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".AuthActivity"
            android:exported="false" />

        <activity
            android:name=".ExportVaultActivity"
            android:exported="true" />

        <!-- Insecure exported receiver without permission -->
        <receiver
            android:name=".receivers.VaultSyncReceiver"
            android:exported="true">
            <intent-filter>
                <action android:name="com.secvault.ACTION_FORCE_SYNC" />
            </intent-filter>
        </receiver>

        <provider
            android:name=".provider.VaultBackupProvider"
            android:authorities="com.secvault.provider.backup"
            android:exported="true" />

    </application>
</manifest>`
      },
      {
        id: 'f-smali-dir',
        name: 'smali',
        path: 'smali',
        type: 'folder',
        children: [
          {
            id: 'f-smali-com',
            name: 'com',
            path: 'smali/com',
            type: 'folder',
            children: [
              {
                id: 'f-smali-secvault',
                name: 'secvault',
                path: 'smali/com/secvault',
                type: 'folder',
                children: [
                  {
                    id: 'f-smali-main',
                    name: 'MainActivity.smali',
                    path: 'smali/com/secvault/MainActivity.smali',
                    type: 'file',
                    extension: 'smali',
                    size: 3840,
                    content: `.class public Lcom/secvault/MainActivity;
.super Landroidx/appcompat/app/AppCompatActivity;
.source "MainActivity.java"

# static fields
.field private static final MASTER_KEY_HASH:Ljava/lang/String; = "e10adc3949ba59abbe56e057f20f883e"
.field private static final SERVER_ENDPOINT:Ljava/lang/String; = "http://api.secvault.internal/v1/sync"

# instance fields
.field private isUserAuthenticated:Z
.field private failedAttempts:I

.method public constructor <init>()V
    .registers 2
    invoke-direct {p0}, Landroidx/appcompat/app/AppCompatActivity;-><init>()V
    const/4 v0, 0x0
    iput-boolean v0, p0, Lcom/secvault/MainActivity;->isUserAuthenticated:Z
    iput v0, p0, Lcom/secvault/MainActivity;->failedAttempts:I
    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .registers 4
    invoke-super {p0, p1}, Landroidx/appcompat/app/AppCompatActivity;->onCreate(Landroid/os/Bundle;)V
    const v0, 0x7f0b001c
    invoke-virtual {p0, v0}, Lcom/secvault/MainActivity;->setContentView(I)V

    # Check root detection
    invoke-static {}, Lcom/secvault/security/RootChecker;->isDeviceCompromised()Z
    move-result v0
    if-eqz v0, :cond_root_ok

    const-string v1, "Security Alert: Rooted Device Detected"
    invoke-direct {p0, v1}, Lcom/secvault/MainActivity;->showSecurityAlert(Ljava/lang/String;)V
    invoke-virtual {p0}, Lcom/secvault/MainActivity;->finish()V
    return-void

:cond_root_ok
    invoke-direct {p0}, Lcom/secvault/MainActivity;->initVaultUI()V
    return-void
.end method

.method public verifyMasterPin(Ljava/lang/String;)Z
    .registers 5
    # Calculates MD5 hash of user input
    invoke-static {p1}, Lcom/secvault/crypto/CryptoHelper;->md5(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v0
    const-string v1, "e10adc3949ba59abbe56e057f20f883e"
    invoke-virtual {v0, v1}, Ljava/lang/String;->equalsIgnoreCase(Ljava/lang/String;)Z
    move-result v2
    if-eqz v2, :cond_invalid

    const/4 v0, 0x1
    iput-boolean v0, p0, Lcom/secvault/MainActivity;->isUserAuthenticated:Z
    return v0

:cond_invalid
    iget v0, p0, Lcom/secvault/MainActivity;->failedAttempts:I
    add-int/lit8 v0, v0, 0x1
    iput v0, p0, Lcom/secvault/MainActivity;->failedAttempts:I
    const/4 v1, 0x0
    return v1
.end method

.method public isPremiumSubscriber()Z
    .registers 3
    # Check in-app billing subscription state
    invoke-static {}, Lcom/secvault/billing/BillingManager;->hasActiveLicense()Z
    move-result v0
    return v0
.end method`
                  },
                  {
                    id: 'f-smali-root',
                    name: 'RootChecker.smali',
                    path: 'smali/com/secvault/security/RootChecker.smali',
                    type: 'file',
                    extension: 'smali',
                    size: 2190,
                    content: `.class public Lcom/secvault/security/RootChecker;
.super Ljava/lang/Object;
.source "RootChecker.java"

.method public constructor <init>()V
    .registers 1
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    return-void
.end method

.method public static isDeviceCompromised()Z
    .registers 3
    # Scans system binaries for su and busybox
    invoke-static {}, Lcom/secvault/security/RootChecker;->checkSuFiles()Z
    move-result v0
    if-nez v0, :cond_found
    invoke-static {}, Lcom/secvault/security/RootChecker;->checkBuildTags()Z
    move-result v1
    if-eqz v1, :cond_clean

:cond_found
    const/4 v2, 0x1
    return v2

:cond_clean
    const/4 v2, 0x0
    return v2
.end method

.method private static checkSuFiles()Z
    .registers 6
    const/4 v0, 0x3
    new-array v1, v0, [Ljava/lang/String;
    const/4 v2, 0x0
    const-string v3, "/system/bin/su"
    aput-object v3, v1, v2
    const/4 v2, 0x1
    const-string v3, "/system/xbin/su"
    aput-object v3, v1, v2
    const/4 v2, 0x2
    const-string v3, "/sbin/su"
    aput-object v3, v1, v2

    # Loop checking file exists
    const/4 v4, 0x0
    return v4
.end method`
                  },
                  {
                    id: 'f-smali-crypto',
                    name: 'CryptoHelper.smali',
                    path: 'smali/com/secvault/crypto/CryptoHelper.smali',
                    type: 'file',
                    extension: 'smali',
                    size: 1980,
                    content: `.class public Lcom/secvault/crypto/CryptoHelper;
.super Ljava/lang/Object;
.source "CryptoHelper.java"

# static fields
.field private static final HARDCODED_IV:[B

.method static constructor <clinit>()V
    .registers 1
    const/16 v0, 0x10
    new-array v0, v0, [B
    fill-array-data v0, :array_iv
    sput-object v0, Lcom/secvault/crypto/CryptoHelper;->HARDCODED_IV:[B
    return-void

:array_iv
    .array-data 1
        0x01t 0x02t 0x03t 0x04t 0x05t 0x06t 0x07t 0x08t
        0x09t 0x0at 0x0bt 0x0ct 0x0dt 0x0et 0x0ft 0x10t
    .end array-data
.end method

.method public static md5(Ljava/lang/String;)Ljava/lang/String;
    .registers 5
    :try_start_0
    const-string v0, "MD5"
    invoke-static {v0}, Ljava/security/MessageDigest;->getInstance(Ljava/lang/String;)Ljava/security/MessageDigest;
    move-result-object v1
    invoke-virtual {p0}, Ljava/lang/String;->getBytes()[B
    move-result-object v2
    invoke-virtual {v1, v2}, Ljava/security/MessageDigest;->digest([B)[B
    move-result-object v3
    invoke-static {v3}, Lcom/secvault/crypto/CryptoHelper;->bytesToHex([B)Ljava/lang/String;
    move-result-object v0
    return-object v0
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

:catch_0
    const-string v0, ""
    return-object v0
.end method`
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'f-res-dir',
        name: 'res',
        path: 'res',
        type: 'folder',
        children: [
          {
            id: 'f-res-values',
            name: 'values',
            path: 'res/values',
            type: 'folder',
            children: [
              {
                id: 'f-res-strings',
                name: 'strings.xml',
                path: 'res/values/strings.xml',
                type: 'file',
                extension: 'xml',
                size: 1120,
                content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">SecureVault Pro</string>
    <string name="login_title">Enter Master Passcode</string>
    <string name="hint_pin">6-digit PIN</string>
    <string name="btn_unlock">Unlock Vault</string>
    <string name="msg_unlocked">Vault decrypted successfully</string>
    <string name="msg_denied">Invalid passcode</string>
    <string name="api_secret_key">sk_live_89a7f34bc0991244ae7d01878b209e</string>
    <string name="sync_server_url">http://api.secvault.internal/v1</string>
</resources>`
              },
              {
                id: 'f-res-colors',
                name: 'colors.xml',
                path: 'res/values/colors.xml',
                type: 'file',
                extension: 'xml',
                size: 640,
                content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#1A73E8</color>
    <color name="colorPrimaryDark">#1557B0</color>
    <color name="colorAccent">#00E676</color>
    <color name="vaultBackground">#121212</color>
    <color name="vaultSurface">#1E1E1E</color>
</resources>`
              }
            ]
          },
          {
            id: 'f-res-layout',
            name: 'layout',
            path: 'res/layout',
            type: 'folder',
            children: [
              {
                id: 'f-res-main-layout',
                name: 'activity_main.xml',
                path: 'res/layout/activity_main.xml',
                type: 'file',
                extension: 'xml',
                size: 1540,
                content: `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="24dp"
    android:background="@color/vaultBackground">

    <ImageView
        android:id="@+id/imgLock"
        android:layout_width="96dp"
        android:layout_height="96dp"
        android:src="@drawable/ic_vault_shield" />

    <TextView
        android:id="@+id/txtTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="@string/login_title"
        android:textColor="#FFFFFF"
        android:textSize="22sp"
        android:textStyle="bold"
        android:layout_marginTop="20dp" />

    <EditText
        android:id="@+id/edtPin"
        android:layout_width="match_parent"
        android:layout_height="56dp"
        android:hint="@string/hint_pin"
        android:inputType="numberPassword"
        android:textColor="#FFFFFF"
        android:layout_marginTop="16dp" />

    <Button
        android:id="@+id/btnUnlock"
        android:layout_width="match_parent"
        android:layout_height="54dp"
        android:text="@string/btn_unlock"
        android:layout_marginTop="24dp"
        android:backgroundTint="@color/colorPrimary" />

</LinearLayout>`
              }
            ]
          }
        ]
      },
      {
        id: 'f-assets-dir',
        name: 'assets',
        path: 'assets',
        type: 'folder',
        children: [
          {
            id: 'f-asset-config',
            name: 'app_config.json',
            path: 'assets/app_config.json',
            type: 'file',
            extension: 'json',
            size: 420,
            content: `{
  "environment": "production",
  "enableBiometrics": true,
  "cloudBackupEnabled": true,
  "maxFailedAttempts": 5,
  "cryptoStandard": "AES-256-GCM"
}`
          }
        ]
      }
    ]
  },
  {
    id: 'proj-media-tool',
    name: 'MediaStreamer_v1.0.apk',
    packageName: 'com.hyperstream.mediaplayer',
    versionName: '1.0.8',
    versionCode: 108,
    minSdk: 24,
    targetSdk: 34,
    fileCount: 19,
    smaliClassCount: 8,
    sizeBytes: 5240000,
    lastModified: '2026-08-14 02:20 PM',
    createdDate: '2026-08-12 11:00 AM',
    isBackupAvailable: true,
    vulnerabilitiesCount: {
      critical: 0,
      high: 1,
      medium: 2,
      low: 2,
    },
    files: [
      {
        id: 'f2-manifest',
        name: 'AndroidManifest.xml',
        path: 'AndroidManifest.xml',
        type: 'file',
        extension: 'xml',
        size: 1820,
        content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.hyperstream.mediaplayer"
    android:versionCode="108"
    android:versionName="1.0.8">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />

    <application
        android:allowBackup="false"
        android:label="HyperStream Player"
        android:supportsRtl="true"
        android:theme="@style/Theme.HyperStream">

        <activity
            android:name=".PlayerActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>
</manifest>`
      },
      {
        id: 'f2-smali-dir',
        name: 'smali',
        path: 'smali',
        type: 'folder',
        children: [
          {
            id: 'f2-smali-player',
            name: 'PlayerActivity.smali',
            path: 'smali/com/hyperstream/PlayerActivity.smali',
            type: 'file',
            extension: 'smali',
            size: 2400,
            content: `.class public Lcom/hyperstream/PlayerActivity;
.super Landroid/app/Activity;
.source "PlayerActivity.java"

.method public checkAdRemovalStatus()Z
    .registers 2
    # Returns false by default, showing interstitial ads
    const/4 v0, 0x0
    return v0
.end method`
          }
        ]
      }
    ]
  }
];
