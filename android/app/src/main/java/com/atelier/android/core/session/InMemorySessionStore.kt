package com.atelier.android.core.session

class InMemorySessionStore(initialToken: String? = null) : SessionStore {
    private var token: String? = initialToken

    override suspend fun saveToken(token: String) {
        this.token = token
    }

    override suspend fun loadToken(): String? = token

    override suspend fun clearToken() {
        token = null
    }
}
