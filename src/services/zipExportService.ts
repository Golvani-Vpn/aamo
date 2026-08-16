import JSZip from 'jszip';
import { ANDROID_SOURCE_REPOSITORY } from '../data/androidSourceRepository';

export class ZipExportService {
  /**
   * Generates a complete, ready-to-open Android Studio Gradle project .zip
   */
  static async exportAndroidStudioProjectZip(): Promise<Blob> {
    const zip = new JSZip();

    // Add root and module files
    for (const file of ANDROID_SOURCE_REPOSITORY) {
      zip.file(file.path, file.content);
    }

    // Add gradlew wrapper script placeholders & gradle wrapper properties
    zip.file(
      'gradle/wrapper/gradle-wrapper.properties',
      `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10.2-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
    );

    zip.file(
      'gradlew',
      `#!/usr/bin/env sh
# Gradle wrapper script for APKForge AI
exec ./gradle "$@"
`
    );

    zip.file(
      'gradle.properties',
      `org.gradle.jvmargs=-Xmx4096m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
    );

    zip.file(
      'app/proguard-rules.pro',
      `# APKForge AI ProGuard Optimization Rules
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
-keep class com.apkforge.ai.data.entities.** { *; }
-dontwarn okhttp3.**
-dontwarn okio.**
`
    );

    zip.file(
      'app/src/main/res/values/strings.xml',
      `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">APKForge AI</string>
    <string name="title_dashboard">APKForge Studio</string>
    <string name="title_projects">APK Projects</string>
    <string name="title_chat">AI Engineer</string>
    <string name="title_editor">Smali &amp; XML Editor</string>
</resources>
`
    );

    zip.file(
      'app/src/main/res/xml/file_paths.xml',
      `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="." />
    <cache-path name="cache_files" path="." />
    <files-path name="internal_files" path="." />
</paths>
`
    );

    return await zip.generateAsync({ type: 'blob' });
  }

  static downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
