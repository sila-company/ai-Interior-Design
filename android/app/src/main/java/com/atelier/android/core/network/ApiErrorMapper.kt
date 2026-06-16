package com.atelier.android.core.network

import com.atelier.android.core.model.ApiErrorDto
import kotlinx.serialization.decodeFromString
import retrofit2.HttpException
import java.io.IOException

fun Throwable.userMessage(): String {
    if (this is ApiException) return message ?: "Request failed."
    if (this is HttpException) {
        val body = response()?.errorBody()?.string()
        val apiMessage = body?.let {
            runCatching { NetworkModule.json.decodeFromString<ApiErrorDto>(it).message }.getOrNull()
        }
        return apiMessage ?: "Request failed (${code()})."
    }
    if (this is IOException) return "Could not reach the Atelier API."
    return message ?: "Something went wrong."
}
