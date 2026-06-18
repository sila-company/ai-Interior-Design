package com.atelier.android.feature.shell

import com.atelier.android.MainDispatcherRule
import com.atelier.android.core.auth.AuthRepository
import com.atelier.android.core.model.RoomDto
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.model.StyleDto
import com.atelier.android.core.model.UserDto
import com.atelier.android.core.session.SessionState
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ShellViewModelTest {
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun restoreSessionAuthenticatesWhenCurrentUserExists() = runTest {
        val user = UserDto("u1", "a@example.com", "Ada")
        val viewModel = ShellViewModel(FakeAuthRepository(restoredUser = user), MutableSharedFlow())

        assertEquals(SessionState.Authenticated(user), viewModel.sessionState.value)
    }

    @Test
    fun sessionInvalidationRoutesBackToAuthAndClearsSelectedRoom() = runTest {
        val events = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
        val viewModel = ShellViewModel(FakeAuthRepository(UserDto("u1", "a@example.com", "Ada")), events)

        events.tryEmit(Unit)

        assertEquals(SessionState.Unauthenticated, viewModel.sessionState.value)
        assertTrue(viewModel.selectedRoomState.value.room == null)
    }

    @Test
    fun selectedStyleIsStoredAgainstCurrentRoom() = runTest {
        val viewModel = ShellViewModel(FakeAuthRepository(UserDto("u1", "a@example.com", "Ada")), MutableSharedFlow())
        val room = RoomDto("r1", "Living room", "/api/uploads/r1.jpg", "2026-06-15T00:00:00Z", 0)
        val style = StyleDto("modern", "Modern", "Clean lines", "square.grid.2x2")

        viewModel.selectRoom(room, "content://room")
        viewModel.selectStyle(style)

        assertEquals(room, viewModel.selectedRoomState.value.room)
        assertEquals(style, viewModel.selectedRoomState.value.selectedStyle)
    }

    @Test
    fun generatedRedesignIsStoredForResultsHandoff() = runTest {
        val viewModel = ShellViewModel(FakeAuthRepository(UserDto("u1", "a@example.com", "Ada")), MutableSharedFlow())
        val redesign = RedesignDto(
            id = "d1",
            roomId = "r1",
            styleId = "modern",
            mimeType = "image/jpeg",
            resultImageUrl = "/api/uploads/result.jpg",
            createdAt = "2026-06-16T00:00:00Z",
        )

        viewModel.completeGeneration(redesign)

        assertEquals(redesign, viewModel.selectedRoomState.value.redesign)
    }
}

private class FakeAuthRepository(
    private val restoredUser: UserDto?,
) : AuthRepository {
    override suspend fun getCurrentUser(): UserDto = restoredUser ?: error("No user")
    override suspend fun restoreSession(): UserDto? = restoredUser
    override suspend fun register(name: String, email: String, password: String): UserDto = getCurrentUser()
    override suspend fun login(email: String, password: String): UserDto = getCurrentUser()
    override suspend fun logout() = Unit
}
