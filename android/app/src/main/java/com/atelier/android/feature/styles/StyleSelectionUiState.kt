package com.atelier.android.feature.styles

import com.atelier.android.core.model.StyleDto

data class StyleSelectionUiState(
    val isLoading: Boolean = true,
    val styles: List<StyleDto> = emptyList(),
    val selectedStyleId: String? = null,
    val pickMode: StylePickMode = StylePickMode.Catalog,
    val customDescription: String = "",
    val errorMessage: String? = null,
) {
    val selectedStyle: StyleDto?
        get() = styles.firstOrNull { it.id == selectedStyleId }

    val canContinue: Boolean
        get() = when (pickMode) {
            StylePickMode.Catalog -> selectedStyle != null
            StylePickMode.Custom -> trimmedCustomDescription.length >= 3
        }

    val trimmedCustomDescription: String
        get() = customDescription.trim()
}

enum class StylePickMode(val label: String) {
    Catalog("Curated styles"),
    Custom("Describe yours"),
}
