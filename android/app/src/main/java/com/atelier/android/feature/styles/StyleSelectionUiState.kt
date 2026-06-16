package com.atelier.android.feature.styles

import com.atelier.android.core.model.StyleDto

data class StyleSelectionUiState(
    val isLoading: Boolean = true,
    val styles: List<StyleDto> = emptyList(),
    val selectedStyleId: String? = null,
    val errorMessage: String? = null,
) {
    val selectedStyle: StyleDto?
        get() = styles.firstOrNull { it.id == selectedStyleId }

    val canContinue: Boolean
        get() = selectedStyle != null
}
