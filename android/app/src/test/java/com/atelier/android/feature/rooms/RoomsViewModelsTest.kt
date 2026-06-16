package com.atelier.android.feature.rooms

import com.atelier.android.MainDispatcherRule
import com.atelier.android.core.auth.AuthRepository
import com.atelier.android.core.model.RoomDetailResponseDto
import com.atelier.android.core.model.RoomDto
import com.atelier.android.core.model.UserDto
import com.atelier.android.core.network.RoomsRepository
import kotlinx.coroutines.test.runTest
import okhttp3.MultipartBody
import okhttp3.RequestBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class RoomsViewModelsTest {
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun roomsListMapsEmptyState() = runTest {
        val viewModel = RoomsViewModel(FakeRoomsRepository(emptyList()), FakeAuthRepository()) {}

        assertFalse(viewModel.uiState.value.isLoading)
        assertTrue(viewModel.uiState.value.isEmpty)
    }

    @Test
    fun roomsListMapsPopulatedState() = runTest {
        val rooms = listOf(room("r1", "Living room"))
        val viewModel = RoomsViewModel(FakeRoomsRepository(rooms), FakeAuthRepository()) {}

        assertEquals(rooms, viewModel.uiState.value.rooms)
        assertFalse(viewModel.uiState.value.isEmpty)
    }

    @Test
    fun logoutClearsLocalSession() = runTest {
        val authRepository = FakeAuthRepository()
        var routedOut = false
        val viewModel = RoomsViewModel(FakeRoomsRepository(emptyList()), authRepository) {
            routedOut = true
        }

        viewModel.logout()

        assertTrue(authRepository.didLogout)
        assertTrue(routedOut)
    }
}

private fun room(id: String, name: String): RoomDto =
    RoomDto(
        id = id,
        name = name,
        originalImageUrl = "/api/uploads/u1/rooms/$id.jpg",
        createdAt = "2026-06-14T12:00:00.000Z",
        redesignCount = 0,
    )

private class FakeRoomsRepository(private val rooms: List<RoomDto>) : RoomsRepository {
    override suspend fun listRooms(): List<RoomDto> = rooms
    override suspend fun roomDetail(roomId: String): RoomDetailResponseDto =
        RoomDetailResponseDto(room(roomId, "Room"), emptyList())
    override suspend fun createRoom(name: RequestBody, image: MultipartBody.Part): RoomDto =
        room("created", "Created")
}

private class FakeAuthRepository : AuthRepository {
    var didLogout = false
    override suspend fun getCurrentUser(): UserDto = UserDto("u", "e", "n")
    override suspend fun restoreSession(): UserDto? = null
    override suspend fun register(name: String, email: String, password: String): UserDto = getCurrentUser()
    override suspend fun login(email: String, password: String): UserDto = getCurrentUser()
    override suspend fun logout() {
        didLogout = true
    }
}
