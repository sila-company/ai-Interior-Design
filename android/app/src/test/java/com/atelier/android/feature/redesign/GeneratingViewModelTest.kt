package com.atelier.android.feature.redesign

import com.atelier.android.MainDispatcherRule
import com.atelier.android.core.model.CreateRedesignRequestDto
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.network.RedesignRepository
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class GeneratingViewModelTest {
    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    @Test
    fun generateStoresSuccessfulRedesign() = runTest {
        val redesign = redesign()
        val repository = FakeRedesignRepository(Result.success(redesign))
        val viewModel = GeneratingViewModel(repository)

        viewModel.generate("room-1", "modern", "Living room")

        assertEquals("room-1", repository.lastBody?.roomId)
        assertEquals("modern", repository.lastBody?.styleId)
        assertTrue(repository.lastBody?.products?.isNotEmpty() == true)
        assertFalse(viewModel.uiState.value.isGenerating)
        assertEquals(redesign, viewModel.uiState.value.redesign)
        assertEquals(null, viewModel.uiState.value.errorMessage)
    }

    @Test
    fun generateMapsFailureToErrorState() = runTest {
        val viewModel = GeneratingViewModel(
            FakeRedesignRepository(Result.failure(IllegalStateException("Generation failed"))),
        )

        viewModel.generate("room-1", "modern", "Living room")

        assertFalse(viewModel.uiState.value.isGenerating)
        assertEquals("Generation failed", viewModel.uiState.value.errorMessage)
    }

    @Test
    fun generateCanUseCustomStyleDescription() = runTest {
        val repository = FakeRedesignRepository(Result.success(redesign(styleId = "custom")))
        val viewModel = GeneratingViewModel(repository)

        viewModel.generate("room-1", null, "Living room", "warm linen and walnut")

        assertEquals("room-1", repository.lastBody?.roomId)
        assertEquals(null, repository.lastBody?.styleId)
        assertEquals("warm linen and walnut", repository.lastBody?.customStyleDescription)
        assertTrue(repository.lastBody?.products?.isNotEmpty() == true)
    }

    @Test
    fun clearCompletedRedesignRemovesCompletionPayload() = runTest {
        val viewModel = GeneratingViewModel(FakeRedesignRepository(Result.success(redesign())))

        viewModel.generate("room-1", "modern", "Living room")
        assertNotNull(viewModel.uiState.value.redesign)

        viewModel.clearCompletedRedesign()

        assertTrue(viewModel.uiState.value.redesign == null)
    }
}

private fun redesign(styleId: String = "modern") = RedesignDto(
    id = "redesign-1",
    roomId = "room-1",
    styleId = styleId,
    mimeType = "image/jpeg",
    resultImageUrl = "/api/uploads/result.jpg",
    createdAt = "2026-06-16T00:00:00Z",
)

private class FakeRedesignRepository(
    private val result: Result<RedesignDto>,
) : RedesignRepository {
    var lastBody: CreateRedesignRequestDto? = null

    override suspend fun redesigns(): List<RedesignDto> = emptyList()

    override suspend fun createRedesign(body: CreateRedesignRequestDto): RedesignDto {
        lastBody = body
        return result.getOrThrow()
    }
}
