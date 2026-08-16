package com.apkforge.nativeapp.model

/**
 * One real entry read from an opened APK/ZIP archive.
 * `bytes` holds the raw uncompressed content exactly as read from the archive
 * (binary entries are kept byte-for-byte so re-exporting never corrupts them).
 */
data class ZipRecord(
    val path: String,
    val isDirectory: Boolean,
    val bytes: ByteArray,
    val isText: Boolean,
)
