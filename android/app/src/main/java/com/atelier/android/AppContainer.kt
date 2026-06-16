package com.atelier.android

import android.content.Context
import coil.ImageLoader
import com.atelier.android.core.auth.AuthRepository
import com.atelier.android.core.auth.NetworkAuthRepository
import com.atelier.android.core.network.AtelierApi
import com.atelier.android.core.network.NetworkModule
import com.atelier.android.core.network.NetworkRedesignRepository
import com.atelier.android.core.network.NetworkRoomsRepository
import com.atelier.android.core.network.NetworkStylesRepository
import com.atelier.android.core.network.RedesignRepository
import com.atelier.android.core.network.RoomsRepository
import com.atelier.android.core.network.StylesRepository
import com.atelier.android.core.network.authenticatedImageLoader
import com.atelier.android.core.session.EncryptedPreferencesSessionStore
import com.atelier.android.core.session.SessionStore
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import okhttp3.OkHttpClient

class AppContainer(val context: Context) {
    private val sessionExpiredEvents = MutableSharedFlow<Unit>(extraBufferCapacity = 1)

    val sessionEvents: SharedFlow<Unit> = sessionExpiredEvents
    val sessionStore: SessionStore = EncryptedPreferencesSessionStore(context)
    val okHttpClient: OkHttpClient = NetworkModule.okHttpClient(sessionStore) {
        sessionExpiredEvents.tryEmit(Unit)
    }
    val api: AtelierApi = NetworkModule.atelierApi(BuildConfig.BASE_URL, okHttpClient)
    val authRepository: AuthRepository = NetworkAuthRepository(api, sessionStore)
    val roomsRepository: RoomsRepository = NetworkRoomsRepository(api)
    val redesignRepository: RedesignRepository = NetworkRedesignRepository(api)
    val stylesRepository: StylesRepository = NetworkStylesRepository(api)
    val imageLoader: ImageLoader = authenticatedImageLoader(context, sessionStore) {
        sessionExpiredEvents.tryEmit(Unit)
    }
}
