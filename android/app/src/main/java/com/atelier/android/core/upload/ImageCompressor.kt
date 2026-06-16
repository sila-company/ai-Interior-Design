package com.atelier.android.core.upload

import android.content.ContentResolver
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream

object ImageCompressor {
    private const val MaxDimension = 1800
    private const val JpegQuality = 86

    suspend fun jpegForUpload(contentResolver: ContentResolver, uri: Uri): ByteArray =
        withContext(Dispatchers.IO) {
            val originalBytes = contentResolver.openInputStream(uri)?.use { it.readBytes() }
                ?: throw IllegalArgumentException("Could not read selected photo.")
            val bitmap = BitmapFactory.decodeByteArray(originalBytes, 0, originalBytes.size)
                ?: throw IllegalArgumentException("Could not decode selected photo.")
            val scaled = bitmap.scaleToMaxDimension(MaxDimension)
            ByteArrayOutputStream().use { output ->
                scaled.compress(Bitmap.CompressFormat.JPEG, JpegQuality, output)
                output.toByteArray()
            }
        }

    private fun Bitmap.scaleToMaxDimension(maxDimension: Int): Bitmap {
        val largest = maxOf(width, height)
        if (largest <= maxDimension) return this
        val scale = maxDimension.toFloat() / largest.toFloat()
        return Bitmap.createScaledBitmap(this, (width * scale).toInt(), (height * scale).toInt(), true)
    }
}
