package com.atelier.android.core.upload

import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody

object RoomUploadPreparer {
    private val TextMediaType = "text/plain".toMediaType()
    private val JpegMediaType = "image/jpeg".toMediaType()

    fun nameBody(name: String): RequestBody =
        name.trim().toRequestBody(TextMediaType)

    fun imagePart(bytes: ByteArray, filename: String = "room.jpg"): MultipartBody.Part =
        MultipartBody.Part.createFormData("image", filename, bytes.toRequestBody(JpegMediaType))

    fun validate(name: String, imageBytes: ByteArray?): String? =
        when {
            name.trim().isEmpty() -> "Room name is required."
            imageBytes == null -> "Room photo is required."
            imageBytes.isEmpty() -> "Room photo is invalid."
            imageBytes.size > 12 * 1024 * 1024 -> "Photo is too large. Try a different image."
            else -> null
        }
}
