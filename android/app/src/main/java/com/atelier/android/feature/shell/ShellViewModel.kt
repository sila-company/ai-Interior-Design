package com.atelier.android.feature.shell

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.atelier.android.core.auth.AuthRepository
import com.atelier.android.core.catalog.ProductCatalog
import com.atelier.android.core.design.StyleCatalog
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.model.RoomDto
import com.atelier.android.core.model.StyleDto
import com.atelier.android.core.model.UserDto
import com.atelier.android.core.session.SelectedRoomState
import com.atelier.android.core.session.SessionState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class ShellViewModel(
    private val authRepository: AuthRepository,
    sessionExpiredEvents: SharedFlow<Unit>,
) : ViewModel() {
    private val _sessionState = MutableStateFlow<SessionState>(SessionState.Loading)
    val sessionState: StateFlow<SessionState> = _sessionState.asStateFlow()

    private val _selectedRoomState = MutableStateFlow(SelectedRoomState())
    val selectedRoomState: StateFlow<SelectedRoomState> = _selectedRoomState.asStateFlow()

    init {
        restoreSession()
        viewModelScope.launch {
            sessionExpiredEvents.collect {
                setUnauthenticated()
            }
        }
    }

    fun restoreSession() {
        viewModelScope.launch {
            _sessionState.value = SessionState.Loading
            val user = authRepository.restoreSession()
            _sessionState.value = if (user == null) {
                SessionState.Unauthenticated
            } else {
                SessionState.Authenticated(user)
            }
        }
    }

    fun setAuthenticated(user: UserDto) {
        _sessionState.value = SessionState.Authenticated(user)
    }

    fun setUnauthenticated() {
        _selectedRoomState.value = SelectedRoomState()
        _sessionState.value = SessionState.Unauthenticated
    }

    fun logout() {
        viewModelScope.launch {
            authRepository.logout()
            setUnauthenticated()
        }
    }

    fun openRoom(room: RoomDto, localImageUri: String? = null) {
        _selectedRoomState.value = SelectedRoomState(
            room = room,
            localImageUri = localImageUri,
        )
    }

    fun beginWithRoom(room: RoomDto, localImageUri: String? = null) {
        _selectedRoomState.value = SelectedRoomState(
            room = room,
            localImageUri = localImageUri,
        )
    }

    fun beginNewRedesign() {
        val current = _selectedRoomState.value
        _selectedRoomState.value = current.copy(
            selectedStyle = null,
            customStyleDescription = null,
            selectedProducts = emptyList(),
            redesign = null,
        )
    }

    fun selectStyle(style: StyleDto) {
        val roomName = _selectedRoomState.value.room?.name
        _selectedRoomState.value = _selectedRoomState.value.copy(
            selectedStyle = style,
            customStyleDescription = null,
            selectedProducts = ProductCatalog.bundle(roomName, style.id),
            redesign = null,
        )
    }

    fun selectCustomStyle(description: String) {
        _selectedRoomState.value = _selectedRoomState.value.copy(
            selectedStyle = null,
            customStyleDescription = description.trim(),
            selectedProducts = ProductCatalog.bundle(_selectedRoomState.value.room?.name, "custom"),
            redesign = null,
        )
    }

    fun completeGeneration(redesign: RedesignDto) {
        _selectedRoomState.value = _selectedRoomState.value.copy(redesign = redesign)
    }

    fun viewSavedRedesign(redesign: RedesignDto, styleId: String) {
        val style = StyleCatalog.styleFor(styleId)
            ?: StyleDto(styleId, styleId.replaceFirstChar { it.uppercase() }, "", "")
        val roomName = _selectedRoomState.value.room?.name
        _selectedRoomState.value = _selectedRoomState.value.copy(
            selectedStyle = style,
            customStyleDescription = null,
            selectedProducts = ProductCatalog.bundle(roomName, style.id),
            redesign = redesign,
        )
    }

    fun startOver() {
        _selectedRoomState.value = SelectedRoomState()
    }

    class Factory(
        private val authRepository: AuthRepository,
        private val sessionExpiredEvents: SharedFlow<Unit>,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            ShellViewModel(authRepository, sessionExpiredEvents) as T
    }
}
