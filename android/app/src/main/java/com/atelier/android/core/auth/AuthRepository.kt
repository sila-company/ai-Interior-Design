package com.atelier.android.core.auth

import com.atelier.android.core.model.AuthRequestDto
import com.atelier.android.core.model.UserDto
import com.atelier.android.core.network.AtelierApi
import com.atelier.android.core.session.SessionStore

interface AuthRepository {
    suspend fun getCurrentUser(): UserDto
    suspend fun restoreSession(): UserDto?
    suspend fun register(name: String, email: String, password: String): UserDto
    suspend fun login(email: String, password: String): UserDto
    suspend fun logout()
}

class NetworkAuthRepository(
    private val api: AtelierApi,
    private val sessionStore: SessionStore,
) : AuthRepository {
    override suspend fun getCurrentUser(): UserDto = api.me().user

    override suspend fun restoreSession(): UserDto? {
        if (sessionStore.loadToken().isNullOrBlank()) return null
        return runCatching { api.me().user }
            .onFailure { sessionStore.clearToken() }
            .getOrNull()
    }

    override suspend fun register(name: String, email: String, password: String): UserDto {
        val response = api.register(AuthRequestDto(email = email, password = password, name = name))
        sessionStore.saveToken(response.token)
        return response.user
    }

    override suspend fun login(email: String, password: String): UserDto {
        val response = api.login(AuthRequestDto(email = email, password = password))
        sessionStore.saveToken(response.token)
        return response.user
    }

    override suspend fun logout() {
        runCatching { api.logout() }
        sessionStore.clearToken()
    }
}
