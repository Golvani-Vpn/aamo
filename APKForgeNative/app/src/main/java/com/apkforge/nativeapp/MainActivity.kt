package com.apkforge.nativeapp

import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Save
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.apkforge.nativeapp.engine.ApkZipEngine
import com.apkforge.nativeapp.model.ZipRecord

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    ApkWorkspaceScreen()
                }
            }
        }
    }
}

@Composable
fun ApkWorkspaceScreen() {
    val context = androidx.compose.ui.platform.LocalContext.current

    var sourceUri by remember { mutableStateOf<Uri?>(null) }
    var sourceName by remember { mutableStateOf("") }
    var records by remember { mutableStateOf<List<ZipRecord>>(emptyList()) }
    var edits by remember { mutableStateOf<Map<String, String>>(emptyMap()) }
    var selectedPath by remember { mutableStateOf<String?>(null) }
    var editorText by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("یک APK یا ZIP باز کن.") }

    val openLauncher = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        try {
            val opened = ApkZipEngine.openZip(context, uri)
            sourceUri = uri
            sourceName = queryDisplayName(context, uri) ?: "archive.apk"
            records = opened
            edits = emptyMap()
            selectedPath = null
            editorText = ""
            val fileCount = opened.count { !it.isDirectory }
            message = "$fileCount فایل باز شد از $sourceName"
        } catch (e: Exception) {
            message = "خطا در باز کردن فایل: ${e.message}"
        }
    }

    val saveLauncher = rememberLauncherForActivityResult(ActivityResultContracts.CreateDocument("application/vnd.android.package-archive")) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        try {
            ApkZipEngine.exportZip(context, uri, records, emptySet(), edits)
            message = "خروجی ذخیره شد (بدون امضا — Phase 2 امضای واقعی را اضافه می‌کند)."
        } catch (e: Exception) {
            message = "خطا در ذخیره: ${e.message}"
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("APKForge Native") },
            )
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding).padding(12.dp)) {

            Column(modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { openLauncher.launch(arrayOf("*/*")) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Filled.FolderOpen, contentDescription = null)
                    Text("  باز کردن APK / ZIP", modifier = Modifier.padding(start = 6.dp))
                }
            }

            Text(message, modifier = Modifier.padding(vertical = 8.dp))

            if (selectedPath == null) {
                val visible = records.filter { !it.isDirectory }
                LazyColumn(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                    items(visible) { record ->
                        FileRow(
                            record = record,
                            modified = edits.containsKey(record.path),
                            onClick = {
                                selectedPath = record.path
                                editorText = edits[record.path]
                                    ?: ApkZipEngine.tryDecodeUtf8(record.bytes)
                                    ?: ""
                            }
                        )
                    }
                }
            } else {
                val path = selectedPath!!
                val record = records.firstOrNull { it.path == path }

                Column(modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)) {
                    IconButton(onClick = { selectedPath = null }) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "برگشت")
                    }
                    Text(path, style = MaterialTheme.typography.labelMedium)
                }

                if (record?.isText == true) {
                    OutlinedTextField(
                        value = editorText,
                        onValueChange = { editorText = it },
                        modifier = Modifier.fillMaxSize(),
                        textStyle = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Ascii),
                    )
                    Button(
                        onClick = {
                            edits = edits + (path to editorText)
                            message = "ذخیره شد در حافظه‌ی موقت: $path (برای فایل نهایی، «خروجی APK» را بزن)"
                        },
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                    ) {
                        Text("ذخیره تغییر این فایل")
                    }
                } else {
                    Text("این فایل باینری است و بدون تغییر نگه داشته می‌شود.")
                }
            }

            if (sourceUri != null) {
                Button(
                    onClick = {
                        val suggested = (sourceName.substringBeforeLast('.', sourceName)) + "-edited.apk"
                        saveLauncher.launch(suggested)
                    },
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    colors = ButtonDefaults.buttonColors()
                ) {
                    Icon(Icons.Filled.Save, contentDescription = null)
                    Text("  خروجی APK (unsigned)", modifier = Modifier.padding(start = 6.dp))
                }
            }
        }
    }
}

@Composable
private fun FileRow(record: ZipRecord, modified: Boolean, onClick: () -> Unit) {
    Surface(onClick = onClick, modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp)) {
            Column {
                Text(
                    text = (if (modified) "● " else "") + record.path,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}

private fun queryDisplayName(context: android.content.Context, uri: Uri): String? {
    val cursor = context.contentResolver.query(uri, null, null, null, null) ?: return null
    cursor.use {
        val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
        if (nameIndex >= 0 && it.moveToFirst()) {
            return it.getString(nameIndex)
        }
    }
    return null
}
