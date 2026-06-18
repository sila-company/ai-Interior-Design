package com.atelier.android.feature.styles

import com.atelier.android.MainDispatcherRule
import com.atelier.android.core.model.StyleDto
import com.atelier.android.core.network.StylesRepository
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class StyleSelectionViewModelTest {
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun loadsStylesSuccessfully() = runTest {
        val styles = listOf(style("modern"), style("cozy"))
        val viewModel = StyleSelectionViewModel(FakeStylesRepository(result = Result.success(styles)))

        assertFalse(viewModel.uiState.value.isLoading)
        assertEquals(styles, viewModel.uiState.value.styles)
        assertEquals(null, viewModel.uiState.value.errorMessage)
    }

    @Test
    fun handlesLoadFailure() = runTest {
        val viewModel = StyleSelectionViewModel(
            FakeStylesRepository(result = Result.failure(IllegalStateException("Boom"))),
        )

        assertFalse(viewModel.uiState.value.isLoading)
        assertTrue(viewModel.uiState.value.styles.isEmpty())
        assertEquals("Boom", viewModel.uiState.value.errorMessage)
    }

    @Test
    fun retryReloadsStyles() = runTest {
        val repository = FakeStylesRepository(result = Result.failure(IllegalStateException("offline")))
        val viewModel = StyleSelectionViewModel(repository)

        repository.result = Result.success(listOf(style("modern")))
        viewModel.loadStyles()

        assertFalse(viewModel.uiState.value.isLoading)
        assertEquals(2, repository.calls)
        assertEquals(1, viewModel.uiState.value.styles.size)
        assertEquals(null, viewModel.uiState.value.errorMessage)
    }

    @Test
    fun selectingStyleEnablesContinue() = runTest {
        val styles = listOf(style("modern"), style("cozy"))
        val viewModel = StyleSelectionViewModel(FakeStylesRepository(result = Result.success(styles)))

        viewModel.selectStyle("cozy")

        assertEquals("cozy", viewModel.uiState.value.selectedStyleId)
        assertEquals(styles[1], viewModel.uiState.value.selectedStyle)
        assertTrue(viewModel.uiState.value.canContinue)
    }

    @Test
    fun customDescriptionEnablesContinueInCustomMode() = runTest {
        val viewModel = StyleSelectionViewModel(FakeStylesRepository(result = Result.success(listOf(style("modern")))))

        viewModel.selectPickMode(StylePickMode.Custom)
        viewModel.updateCustomDescription("  warm linen and walnut  ")

        assertEquals(StylePickMode.Custom, viewModel.uiState.value.pickMode)
        assertEquals("warm linen and walnut", viewModel.uiState.value.trimmedCustomDescription)
        assertTrue(viewModel.uiState.value.canContinue)
        assertEquals(null, viewModel.uiState.value.selectedStyle)
    }
}

private fun style(id: String) = StyleDto(
    id = id,
    name = id.replaceFirstChar(Char::titlecase),
    description = "$id description",
    icon = "sparkles",
)

private class FakeStylesRepository(
    var result: Result<List<StyleDto>>,
) : StylesRepository {
    var calls = 0

    override suspend fun styles(): List<StyleDto> {
        calls += 1
        return result.getOrThrow()
    }
}
