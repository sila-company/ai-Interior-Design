package com.atelier.android.core.network

import com.atelier.android.core.session.SessionStore
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

object NetworkModule {
    val json: Json = Json {
        ignoreUnknownKeys = true
    }

    fun okHttpClient(sessionStore: SessionStore, onSessionExpired: () -> Unit): OkHttpClient =
        OkHttpClient.Builder()
            .addInterceptor(AuthHeaderInterceptor(sessionStore))
            .addInterceptor(SessionResetInterceptor(sessionStore, onSessionExpired))
            .build()

    fun atelierApi(baseUrl: String, okHttpClient: OkHttpClient): AtelierApi =
        Retrofit.Builder()
            .baseUrl(normalizeBaseUrl(baseUrl))
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(AtelierApi::class.java)

    fun normalizeBaseUrl(baseUrl: String): String =
        if (baseUrl.endsWith("/")) baseUrl else "$baseUrl/"

    fun absoluteUrl(baseUrl: String, pathOrUrl: String): String {
        if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
            return pathOrUrl
        }
        val base = normalizeBaseUrl(baseUrl).trimEnd('/')
        val path = pathOrUrl.trimStart('/')
        return "$base/$path"
    }
}
