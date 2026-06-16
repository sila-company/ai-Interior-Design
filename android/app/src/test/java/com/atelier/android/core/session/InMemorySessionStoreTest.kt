package com.atelier.android.core.session

import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class InMemorySessionStoreTest {
    @Test
    fun saveLoadAndClearToken() = runTest {
        val store = InMemorySessionStore()

        assertNull(store.loadToken())
        store.saveToken("token-123")
        assertEquals("token-123", store.loadToken())
        store.clearToken()
        assertNull(store.loadToken())
    }
}
