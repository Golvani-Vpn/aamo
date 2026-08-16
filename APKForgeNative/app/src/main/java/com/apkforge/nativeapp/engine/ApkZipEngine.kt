package com.apkforge.nativeapp.engine

import android.content.Context
import android.net.Uri
import com.apkforge.nativeapp.model.ZipRecord
import java.io.ByteArrayOutputStream
import java.nio.charset.CharacterCodingException
import java.nio.charset.CodingErrorAction
import java.nio.charset.StandardCharsets
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream

/**
 * Phase 1 engine: real, honest ZIP/APK handling.
 *
 * What this does for real, with the JVM's own java.util.zip (no shims, no
 * placeholder bytes):
 *  - Reads every entry of an APK/ZIP fully into memory, byte-for-byte.
 *  - Lets you view/edit entries that decode cleanly as UTF-8 text.
 *  - Re-packs everything into a new ZIP, leaving untouched binary entries
 *    (classes.dex, resources.arsc, images, ...) exactly as they were.
 *  - Strips any existing META-INF/ signature files on export, because a
 *    signature computed over the old bytes is invalid once content changes.
 *    It does NOT fabricate a fake signature in their place — the exported
 *    file is honestly unsigned until Phase 2 (real V1/V2/V3 signing via
 *    Google's own apksig library) is wired in.
 *
 * What this does NOT do (by design, not by oversight):
 *  - It does not decompile DEX to Smali or recompile Smali to DEX.
 *  - It does not recompile binary XML / resources.arsc (that's AAPT2's job).
 *  These need dedicated engines and are tracked as separate phases.
 */
object ApkZipEngine {

    private val TEXT_EXTENSIONS = setOf(
        "txt", "json", "js", "jsx", "ts", "tsx", "xml", "smali", "kt", "java",
        "gradle", "properties", "pro", "yml", "yaml", "md", "html", "css",
        "csv", "ini", "cfg", "conf", "toml", "proto"
    )

    fun looksLikeTextPath(path: String): Boolean {
        val ext = path.substringAfterLast('.', "").lowercase()
        return ext in TEXT_EXTENSIONS
    }

    /** Reads an APK/ZIP fully into memory as a list of real records. */
    fun openZip(context: Context, uri: Uri): List<ZipRecord> {
        val records = mutableListOf<ZipRecord>()
        context.contentResolver.openInputStream(uri)?.use { input ->
            ZipInputStream(input).use { zis ->
                var entry: ZipEntry? = zis.nextEntry
                while (entry != null) {
                    val name = entry.name
                    if (entry.isDirectory) {
                        records.add(ZipRecord(name.trimEnd('/'), true, ByteArray(0), false))
                    } else {
                        val bytes = zis.readBytesCompat()
                        val text = looksLikeTextPath(name) && tryDecodeUtf8(bytes) != null
                        records.add(ZipRecord(name, false, bytes, text))
                    }
                    zis.closeEntry()
                    entry = zis.nextEntry
                }
            }
        }
        return records
    }

    /** Decodes bytes as strict UTF-8, or returns null if they are not valid UTF-8 text. */
    fun tryDecodeUtf8(bytes: ByteArray): String? {
        return try {
            val decoder = StandardCharsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
            decoder.decode(java.nio.ByteBuffer.wrap(bytes)).toString()
        } catch (e: CharacterCodingException) {
            null
        }
    }

    /**
     * Writes a new ZIP to [destUri]. [edits] maps a record path to the new text
     * content the user typed; every other record is copied through unchanged,
     * byte-for-byte. Any previous META-INF signature files are dropped.
     */
    fun exportZip(
        context: Context,
        destUri: Uri,
        records: List<ZipRecord>,
        deletedPaths: Set<String>,
        edits: Map<String, String>,
    ) {
        val signatureFilePattern = Regex("^META-INF/(MANIFEST\\.MF|[^/]+\\.(SF|RSA|DSA))$", RegexOption.IGNORE_CASE)

        context.contentResolver.openOutputStream(destUri)?.use { output ->
            ZipOutputStream(output).use { zos ->
                for (record in records) {
                    if (record.isDirectory) continue
                    if (record.path in deletedPaths) continue
                    if (signatureFilePattern.matches(record.path)) continue

                    val bytes = if (edits.containsKey(record.path)) {
                        edits.getValue(record.path).toByteArray(StandardCharsets.UTF_8)
                    } else {
                        record.bytes
                    }

                    val entry = ZipEntry(record.path)
                    zos.putNextEntry(entry)
                    zos.write(bytes)
                    zos.closeEntry()
                }
            }
        }
    }

    private fun ZipInputStream.readBytesCompat(): ByteArray {
        val out = ByteArrayOutputStream()
        val buffer = ByteArray(8192)
        while (true) {
            val read = this.read(buffer)
            if (read == -1) break
            out.write(buffer, 0, read)
        }
        return out.toByteArray()
    }
}
