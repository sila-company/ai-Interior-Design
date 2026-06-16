package com.atelier.android.core.session

import com.atelier.android.core.model.UserDto

sealed interface SessionState {
    data object Loading : SessionState
    data object Unauthenticated : SessionState
    data class Authenticated(val user: UserDto) : SessionState
}

sealed interface AuthState {
    data object Idle : AuthState
    data object Loading : AuthState
    data class Failed(val message: String) : AuthState
}

enum class AppDestination(val route: String) {
    Splash("splash"),
    Landing("landing"),
    Login("login"),
    Register("register"),
    Rooms("rooms"),
    AddRoom("rooms/new"),
    StyleSelection("styles"),
    Summary("summary"),
}

interface SessionStore {
    suspend fun saveToken(token: String)
    suspend fun loadToken(): String?
    suspend fun clearToken()
}
