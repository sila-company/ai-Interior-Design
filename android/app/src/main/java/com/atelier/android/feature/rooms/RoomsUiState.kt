package com.atelier.android.feature.rooms

import android.net.Uri
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.model.RoomDto

data class RoomsUiState(
    val isLoading: Boolean = true,
    val rooms: List<RoomDto> = emptyList(),
    val redesigns: List<RedesignDto> = emptyList(),
    val errorMessage: String? = null,
) {
    val isEmpty: Boolean
        get() = !isLoading && errorMessage == null && rooms.isEmpty()

    val recentRedesigns: List<RedesignDto>
        get() = redesigns.take(6)
}

data class RoomDetailUiState(
    val isLoading: Boolean = true,
    val redesigns: List<RedesignDto> = emptyList(),
    val errorMessage: String? = null,
)

data class AddRoomUiState(
    val name: String = "",
    val selectedImageUri: Uri? = null,
    val compressedImageBytes: ByteArray? = null,
    val isPreparingImage: Boolean = false,
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null,
) {
    val canSubmit: Boolean
        get() = name.trim().isNotEmpty() &&
            compressedImageBytes != null &&
            !isPreparingImage &&
            !isSubmitting

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is AddRoomUiState) return false
        val bytesAreEqual = if (compressedImageBytes == null) {
            other.compressedImageBytes == null
        } else {
            val bytes = compressedImageBytes
            val otherBytes = other.compressedImageBytes
            otherBytes != null && bytes.contentEquals(otherBytes)
        }
        return name == other.name &&
            selectedImageUri == other.selectedImageUri &&
            bytesAreEqual &&
            isPreparingImage == other.isPreparingImage &&
            isSubmitting == other.isSubmitting &&
            errorMessage == other.errorMessage
    }

    override fun hashCode(): Int {
        var result = name.hashCode()
        result = 31 * result + (selectedImageUri?.hashCode() ?: 0)
        result = 31 * result + (compressedImageBytes?.contentHashCode() ?: 0)
        result = 31 * result + isPreparingImage.hashCode()
        result = 31 * result + isSubmitting.hashCode()
        result = 31 * result + (errorMessage?.hashCode() ?: 0)
        return result
    }
}
