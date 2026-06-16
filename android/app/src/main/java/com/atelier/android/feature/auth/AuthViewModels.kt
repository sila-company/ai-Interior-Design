package com.atelier.android.feature.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.atelier.android.core.auth.AuthRepository
import com.atelier.android.core.model.UserDto
import com.atelier.android.core.network.userMessage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class LoginViewModel(
    private val authRepository: AuthRepository,
    private val onAuthenticated: (UserDto) -> Unit,
) : ViewModel() {
    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()

    fun onEmailChanged(value: String) = _uiState.update { it.copy(email = value, errorMessage = null) }
    fun onPasswordChanged(value: String) = _uiState.update { it.copy(password = value, errorMessage = null) }

    fun submit() {
        val state = _uiState.value
        if (!state.canSubmit) return
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
            runCatching { authRepository.login(state.email.trim(), state.password) }
                .onSuccess { user ->
                    _uiState.update { it.copy(isSubmitting = false) }
                    onAuthenticated(user)
                }
                .onFailure { error ->
                    _uiState.update { it.copy(isSubmitting = false, errorMessage = error.userMessage()) }
                }
        }
    }

    class Factory(
        private val authRepository: AuthRepository,
        private val onAuthenticated: (UserDto) -> Unit,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            LoginViewModel(authRepository, onAuthenticated) as T
    }
}

class RegisterViewModel(
    private val authRepository: AuthRepository,
    private val onAuthenticated: (UserDto) -> Unit,
) : ViewModel() {
    private val _uiState = MutableStateFlow(RegisterUiState())
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()

    fun onNameChanged(value: String) = _uiState.update { it.copy(name = value, errorMessage = null) }
    fun onEmailChanged(value: String) = _uiState.update { it.copy(email = value, errorMessage = null) }
    fun onPasswordChanged(value: String) = _uiState.update { it.copy(password = value, errorMessage = null) }

    fun submit() {
        val state = _uiState.value
        if (!state.canSubmit) return
        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
            runCatching { authRepository.register(state.name.trim(), state.email.trim(), state.password) }
                .onSuccess { user ->
                    _uiState.update { it.copy(isSubmitting = false) }
                    onAuthenticated(user)
                }
                .onFailure { error ->
                    _uiState.update { it.copy(isSubmitting = false, errorMessage = error.userMessage()) }
                }
        }
    }

    class Factory(
        private val authRepository: AuthRepository,
        private val onAuthenticated: (UserDto) -> Unit,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            RegisterViewModel(authRepository, onAuthenticated) as T
    }
}
