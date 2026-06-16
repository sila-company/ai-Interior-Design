package com.atelier.android.feature.rooms

import android.content.ContentResolver
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.atelier.android.core.auth.AuthRepository
import com.atelier.android.core.model.RoomDto
import com.atelier.android.core.network.RoomsRepository
import com.atelier.android.core.network.userMessage
import com.atelier.android.core.upload.ImageCompressor
import com.atelier.android.core.upload.RoomUploadPreparer
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class RoomsViewModel(
    private val roomsRepository: RoomsRepository,
    private val authRepository: AuthRepository,
    private val onLoggedOut: () -> Unit,
) : ViewModel() {
    private val _uiState = MutableStateFlow(RoomsUiState())
    val uiState: StateFlow<RoomsUiState> = _uiState.asStateFlow()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            runCatching { roomsRepository.listRooms() }
                .onSuccess { rooms -> _uiState.value = RoomsUiState(isLoading = false, rooms = rooms) }
                .onFailure { error ->
                    _uiState.update { it.copy(isLoading = false, errorMessage = error.userMessage()) }
                }
        }
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            onLoggedOut()
        }
    }

    class Factory(
        private val roomsRepository: RoomsRepository,
        private val authRepository: AuthRepository,
        private val onLoggedOut: () -> Unit,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            RoomsViewModel(roomsRepository, authRepository, onLoggedOut) as T
    }
}

class AddRoomViewModel(
    private val roomsRepository: RoomsRepository,
    private val contentResolver: ContentResolver,
    private val onRoomCreated: (RoomDto, Uri?) -> Unit,
) : ViewModel() {
    private val _uiState = MutableStateFlow(AddRoomUiState())
    val uiState: StateFlow<AddRoomUiState> = _uiState.asStateFlow()

    fun onNameChanged(value: String) {
        _uiState.update { it.copy(name = value, errorMessage = null) }
    }

    fun onImageSelected(uri: Uri?) {
        if (uri == null) return
        viewModelScope.launch {
            _uiState.update {
                it.copy(
                    selectedImageUri = uri,
                    compressedImageBytes = null,
                    isPreparingImage = true,
                    errorMessage = null,
                )
            }
            runCatching { ImageCompressor.jpegForUpload(contentResolver, uri) }
                .onSuccess { bytes ->
                    val validation = RoomUploadPreparer.validate(_uiState.value.name, bytes)
                    _uiState.update {
                        it.copy(
                            compressedImageBytes = bytes,
                            isPreparingImage = false,
                            errorMessage = validation?.takeIf { message -> message.contains("Photo") },
                        )
                    }
                }
                .onFailure { error ->
                    _uiState.update {
                        it.copy(isPreparingImage = false, errorMessage = error.userMessage())
                    }
                }
        }
    }

    fun submit() {
        val state = _uiState.value
        val validation = RoomUploadPreparer.validate(state.name, state.compressedImageBytes)
        if (validation != null) {
            _uiState.update { it.copy(errorMessage = validation) }
            return
        }

        val bytes = state.compressedImageBytes ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
            runCatching {
                roomsRepository.createRoom(
                    name = RoomUploadPreparer.nameBody(state.name),
                    image = RoomUploadPreparer.imagePart(bytes),
                )
            }
                .onSuccess { room -> onRoomCreated(room, state.selectedImageUri) }
                .onFailure { error ->
                    _uiState.update {
                        it.copy(isSubmitting = false, errorMessage = error.userMessage())
                    }
                }
        }
    }

    class Factory(
        private val roomsRepository: RoomsRepository,
        private val contentResolver: ContentResolver,
        private val onRoomCreated: (RoomDto, Uri?) -> Unit,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            AddRoomViewModel(roomsRepository, contentResolver, onRoomCreated) as T
    }
}
