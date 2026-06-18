package com.atelier.android.feature.redesign

import com.atelier.android.core.model.RedesignDto

data class GeneratingUiState(
    val isGenerating: Boolean = false,
    val statusText: String = STATUS_MESSAGES.first(),
    val errorMessage: String? = null,
    val redesign: RedesignDto? = null,
) {
    companion object {
        val STATUS_MESSAGES = listOf(
            "Analyzing your room…",
            "Matching shoppable products…",
            "Staging only inventory items…",
            "Checking product accuracy…",
            "Almost there…",
        )
    }
}
