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
                    _uiState.value = StyleSelectionUiState(
                        isLoading = false,
                        styles = styles,
                        selectedStyleId = _uiState.value.selectedStyleId?.takeIf { selectedId ->
                            styles.any { it.id == selectedId }
                        },
                    )
                }
                .onFailure { error ->
                    _uiState.update {
                        it.copy(isLoading = false, errorMessage = error.userMessage())
                    }
                }
        }
    }

    fun selectStyle(styleId: String) {
        _uiState.update { it.copy(selectedStyleId = styleId, errorMessage = null) }
    }

    class Factory(
        private val stylesRepository: StylesRepository,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            StyleSelectionViewModel(stylesRepository) as T
    }
}
