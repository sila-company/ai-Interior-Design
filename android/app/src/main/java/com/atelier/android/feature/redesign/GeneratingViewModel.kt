package com.atelier.android.feature.redesign

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.atelier.android.core.catalog.ProductCatalog
import com.atelier.android.core.model.CreateRedesignRequestDto
import com.atelier.android.core.network.RedesignRepository
import com.atelier.android.core.network.userMessage
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class GeneratingViewModel(
    private val redesignRepository: RedesignRepository,
) : ViewModel() {
    private val _uiState = MutableStateFlow(GeneratingUiState())
    val uiState: StateFlow<GeneratingUiState> = _uiState.asStateFlow()

    private var rotationJob: Job? = null

    fun generate(roomId: String, styleId: String?, roomName: String?, customStyleDescription: String? = null) {
        if (_uiState.value.isGenerating) return

        _uiState.value = GeneratingUiState(isGenerating = true)
        startStatusRotation()

        val effectiveStyleId = styleId ?: "custom"
        val products = ProductCatalog.bundle(roomName, effectiveStyleId)

        viewModelScope.launch {
            runCatching {
                redesignRepository.createRedesign(
                    CreateRedesignRequestDto(
                        roomId = roomId,
                        styleId = styleId,
                        customStyleDescription = customStyleDescription?.trim()?.takeIf { it.isNotEmpty() },
                        products = ProductCatalog.promptBrief(products),
                    ),
                )
            }
                .onSuccess { redesign ->
                    stopStatusRotation()
                    _uiState.value = GeneratingUiState(
                        isGenerating = false,
                        redesign = redesign,
                        statusText = GeneratingUiState.STATUS_MESSAGES.last(),
                    )
                }
                .onFailure { error ->
                    stopStatusRotation()
                    _uiState.value = GeneratingUiState(
                        isGenerating = false,
                        errorMessage = error.userMessage(),
                    )
                }
        }
    }

    fun clearCompletedRedesign() {
        _uiState.update { it.copy(redesign = null) }
    }

    private fun startStatusRotation() {
        rotationJob?.cancel()
        rotationJob = viewModelScope.launch {
            var index = 0
            while (true) {
                delay(3000)
                index = (index + 1) % GeneratingUiState.STATUS_MESSAGES.size
                _uiState.update { current ->
                    if (!current.isGenerating) current
                    else current.copy(statusText = GeneratingUiState.STATUS_MESSAGES[index])
                }
            }
        }
    }

    private fun stopStatusRotation() {
        rotationJob?.cancel()
        rotationJob = null
    }

    override fun onCleared() {
        stopStatusRotation()
    }

    class Factory(
        private val redesignRepository: RedesignRepository,
    ) : ViewModelProvider.Factory {
        @Suppress("UNCHECKED_CAST")
        override fun <T : ViewModel> create(modelClass: Class<T>): T =
            GeneratingViewModel(redesignRepository) as T
    }
}
