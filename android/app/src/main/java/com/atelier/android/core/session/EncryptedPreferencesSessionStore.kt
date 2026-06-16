package com.atelier.android.core.session

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class EncryptedPreferencesSessionStore(context: Context) : SessionStore {
    private val appContext = context.applicationContext

    private val preferences by lazy {
        val masterKey = MasterKey.Builder(appContext)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        EncryptedSharedPreferences.create(
            appContext,
            "atelier_session",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }

    override suspend fun saveToken(token: String) = withContext(Dispatchers.IO) {
        preferences.edit().putString(KEY_TOKEN, token).apply()
    }

    override suspend fun loadToken(): String? = withContext(Dispatchers.IO) {
        preferences.getString(KEY_TOKEN, null)
    }

    override suspend fun clearToken() = withContext(Dispatchers.IO) {
        preferences.edit().remove(KEY_TOKEN).apply()
    }

    private companion object {
        const val KEY_TOKEN = "bearer_token"
    }
}
