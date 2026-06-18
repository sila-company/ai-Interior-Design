package com.atelier.android.feature.styles

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.atelier.android.core.network.StylesRepository
import com.atelier.android.core.network.userMessage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class StyleSelectionViewModel(
    private val stylesRepository: StylesRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(StyleSelectionUiState())
    val uiState: StateFlow<StyleSelectionUiState> = _uiState.asStateFlow()

    init {
        loadStyles()
    }

    fun loadStyles() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            runCatching { stylesRepository.styles() }
                .onSuccess { styles ->
                    _uiState.update { current ->
                        current.copy(
                            isLoading = false,
                            styles = styles,
                            selectedStyleId = current.selectedStyleId?.takeIf { selectedId ->
                                styles.any { it.id == selectedId }
                            },
                        )
                    }
                }
                .onFailure { error ->
                    _uiState.update {
                        it.copy(isLoading = false, errorMessage = error.userMessage())
                    }
                }
        }
    }

    fun selectStyle(styleId: String) {
        _uiState.update { it.copy(selectedStyleId = styleId, customDescription = "", errorMessage = null) }
    }

    fun selectPickMode(mode: StylePickMode) {
        _uiState.update {
            when (mode) {
                StylePickMode.Catalog -> it.copy(pickMode = mode, customDescription = "", errorMessage = null)
                StylePickMode.Custom -> it.copy(pickMode = mode, selectedStyleId = null, errorMessage = null)
            }
        }
    }

    fun updateCustomDescription(description: String) {
        _uiState.update { it.copy(customDescription = description, selectedStyleId = null, errorMessage = null) }
    }

    class Factory(
        private val stylesRepository: StylesRepository,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            StyleSelectionViewModel(stylesRepository) as T
    }
}
