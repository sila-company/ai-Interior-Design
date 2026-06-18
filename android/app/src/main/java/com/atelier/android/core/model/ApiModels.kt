package com.atelier.android.core.model

import kotlinx.serialization.Serializable

@Serializable
data class ApiErrorDto(val message: String)

@Serializable
data class AuthRequestDto(val email: String, val password: String, val name: String? = null)

@Serializable
data class AuthResponseDto(val token: String, val user: UserDto)

@Serializable
data class MeResponseDto(val user: UserDto)

@Serializable
data class UserDto(val id: String, val email: String, val name: String)

@Serializable
data class RoomDto(
    val id: String,
    val name: String,
    val originalImageUrl: String,
    val createdAt: String,
    val redesignCount: Int,
)

@Serializable
data class RoomDetailResponseDto(val room: RoomDto, val redesigns: List<RedesignDto>)

@Serializable
data class RedesignDto(
    val id: String,
    val roomId: String,
    val styleId: String,
    val mimeType: String,
    val resultImageUrl: String,
    val originalImageUrl: String? = null,
    val imageBase64: String? = null,
    val createdAt: String,
)

@Serializable
data class CreateRedesignRequestDto(
    val roomId: String,
    val styleId: String? = null,
    val customStyleDescription: String? = null,
    val products: List<RedesignProductDto> = emptyList(),
)

@Serializable
data class RedesignProductDto(
    val category: String,
    val title: String,
    val price: String? = null,
    val retailer: String,
    val imageUrl: String? = null,
    val color: String? = null,
    val material: String? = null,
    val dimensions: String? = null,
    val visualDescription: String? = null,
)

@Serializable
data class StyleDto(val id: String, val name: String, val description: String, val icon: String)

sealed interface RedesignImageSource {
    data class Base64(val value: String, val mimeType: String) : RedesignImageSource
    data class Url(val value: String) : RedesignImageSource
    data object Missing : RedesignImageSource
}

fun RedesignDto.preferredImageSource(): RedesignImageSource =
    if (!imageBase64.isNullOrBlank()) {
        RedesignImageSource.Base64(imageBase64, mimeType)
    } else if (resultImageUrl.isNotBlank()) {
        RedesignImageSource.Url(resultImageUrl)
    } else {
        RedesignImageSource.Missing
    }
