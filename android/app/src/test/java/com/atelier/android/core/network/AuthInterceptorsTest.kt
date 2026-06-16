package com.atelier.android.core.network

import com.atelier.android.core.session.InMemorySessionStore
import kotlinx.coroutines.test.runTest
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class AuthInterceptorsTest {
    @Test
    fun authHeaderInterceptorInjectsBearerToken() = runTest {
        val server = MockWebServer()
        server.enqueue(MockResponse().setResponseCode(200).setBody("{}"))
        server.start()

        try {
            val client = OkHttpClient.Builder()
                .addInterceptor(AuthHeaderInterceptor(InMemorySessionStore("abc")))
                .build()
            client.newCall(Request.Builder().url(server.url("/api/rooms")).build()).execute().close()

            assertEquals("Bearer abc", server.takeRequest().getHeader("Authorization"))
        } finally {
            server.shutdown()
        }
    }

    @Test
    fun authHeaderInterceptorSkipsBlankToken() = runTest {
        val server = MockWebServer()
        server.enqueue(MockResponse().setResponseCode(200).setBody("{}"))
        server.start()

        try {
            val client = OkHttpClient.Builder()
                .addInterceptor(AuthHeaderInterceptor(InMemorySessionStore()))
                .build()
            client.newCall(Request.Builder().url(server.url("/api/rooms")).build()).execute().close()

            assertNull(server.takeRequest().getHeader("Authorization"))
        } finally {
            server.shutdown()
        }
    }

    @Test
    fun sessionResetInterceptorClearsTokenAndSignalsOn401() = runTest {
        val server = MockWebServer()
        server.enqueue(MockResponse().setResponseCode(401).setBody("""{"message":"expired"}"""))
        server.start()

        try {
            var resetCount = 0
            val store = InMemorySessionStore("stale")
            val client = OkHttpClient.Builder()
                .addInterceptor(SessionResetInterceptor(store) { resetCount += 1 })
                .build()
            client.newCall(Request.Builder().url(server.url("/api/auth/me")).build()).execute().close()

            assertNull(store.loadToken())
            assertEquals(1, resetCount)
        } finally {
            server.shutdown()
        }
    }
}
