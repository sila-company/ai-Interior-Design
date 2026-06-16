package com.atelier.android.core.network

import android.content.Context
import coil.ImageLoader
import com.atelier.android.core.session.SessionStore

fun authenticatedImageLoader(context: Context, sessionStore: SessionStore): ImageLoader =
    ImageLoader.Builder(context)
        .okHttpClient {
            NetworkModule.okHttpClient(sessionStore = sessionStore, onSessionExpired = {})
        }
        .build()

fun authenticatedImageLoader(
    context: Context,
    sessionStore: SessionStore,
    onSessionExpired: () -> Unit,
): ImageLoader =
    ImageLoader.Builder(context)
        .okHttpClient {
            NetworkModule.okHttpClient(sessionStore = sessionStore, onSessionExpired = onSessionExpired)
        }
        .build()
