package com.atelier.android.feature.styles

import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.atelier.android.BuildConfig
import com.atelier.android.core.design.AtelierColors
import com.atelier.android.core.design.AtelierShapes
import com.atelier.android.core.model.StyleDto
import com.atelier.android.core.network.NetworkModule
import com.atelier.android.core.session.SelectedRoomState

@Composable
fun StyleSelectionScreen(
    selectedRoomState: SelectedRoomState,
    viewModel: StyleSelectionViewModel,
    onContinue: (StyleDto) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        Column(
            modifier = Modifier
                .weight(1f)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 16.dp),
        ) {
            RoomContextCard(selectedRoomState = selectedRoomState)

            Text(
                "Choose your style",
                modifier = Modifier.padding(top = 24.dp),
                style = MaterialTheme.typography.headlineMedium,
            )
            Text(
                "Pick the mood you want for your redesign.",
                modifier = Modifier.padding(top = 8.dp),
                color = AtelierColors.Muted,
                style = MaterialTheme.typography.bodyLarge,
            )

            when {
                state.isLoading -> {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 48.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator()
                    }
                }

                state.errorMessage != null -> {
                    ErrorState(
                        message = state.errorMessage.orEmpty(),
                        onRetry = viewModel::loadStyles,
                    )
                }

                state.styles.isEmpty() -> {
                    EmptyState()
                }

                else -> {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 24.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        state.styles.chunked(2).forEach { rowStyles ->
                            Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                                rowStyles.forEach { style ->
                                    StyleCard(
                                        style = style,
                                        isSelected = style.id == state.selectedStyleId,
                                        onSelect = { viewModel.selectStyle(style.id) },
                                        modifier = Modifier.weight(1f),
                                    )
                                }
                                if (rowStyles.size == 1) {
                                    Box(modifier = Modifier.weight(1f))
                                }
                            }
                        }
                    }
                }
            }
        }

        Surface(color = AtelierColors.Surface, shadowElevation = 8.dp) {
            Button(
                onClick = {
                    state.selectedStyle?.let(onContinue)
                },
                enabled = state.canContinue,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp, vertical = 12.dp),
                shape = CircleShape,
            ) {
                Text("Continue")
            }
        }
    }
}

@Composable
fun SummaryPlaceholderScreen(selectedRoomState: SelectedRoomState) {
    val room = selectedRoomState.room
    val style = selectedRoomState.selectedStyle

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        Text("Summary", style = MaterialTheme.typography.headlineMedium)
        Text(
            "This is the next handoff screen. It confirms the selected room and style were passed correctly.",
            color = AtelierColors.Muted,
            style = MaterialTheme.typography.bodyLarge,
        )

        RoomContextCard(selectedRoomState = selectedRoomState)

        Surface(
            shape = AtelierShapes.roundedSurface,
            color = AtelierColors.Surface,
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text("Selected style", color = AtelierColors.Muted, style = MaterialTheme.typography.labelMedium)
                Text(style?.name ?: "No style selected", fontWeight = FontWeight.SemiBold)
                if (style != null) {
                    Text(style.description, color = AtelierColors.Muted, style = MaterialTheme.typography.bodySmall)
                }
                Text(
                    room?.name?.let { "Ready to redesign $it." } ?: "Select a room before continuing.",
                    color = AtelierColors.Muted,
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }
    }
}

@Composable
private fun RoomContextCard(selectedRoomState: SelectedRoomState) {
    val room = selectedRoomState.room
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = AtelierShapes.roundedSurface,
        color = AtelierColors.Surface,
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            RoomPreview(selectedRoomState = selectedRoomState)
            Column(modifier = Modifier.weight(1f)) {
                Text("Your room", fontWeight = FontWeight.SemiBold)
                Text(
                    room?.name ?: "No room selected",
                    color = if (room == null) AtelierColors.Muted else AtelierColors.Ink,
                    style = MaterialTheme.typography.bodyMedium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@Composable
private fun RoomPreview(selectedRoomState: SelectedRoomState) {
    val localUri = selectedRoomState.localImageUri?.let(Uri::parse)
    val remoteUrl = selectedRoomState.room?.originalImageUrl?.let {
        NetworkModule.absoluteUrl(BuildConfig.BASE_URL, it)
    }
    val model = localUri ?: remoteUrl

    if (model == null) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(AtelierShapes.roundedSurface)
                .background(AtelierColors.Canvas),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                "Room",
                color = AtelierColors.Muted,
                style = MaterialTheme.typography.bodySmall,
            )
        }
        return
    }

    AsyncImage(
        model = model,
        contentDescription = selectedRoomState.room?.name ?: "Selected room",
        modifier = Modifier
            .size(64.dp)
            .clip(AtelierShapes.roundedSurface),
        contentScale = ContentScale.Crop,
    )
}

@Composable
private fun StyleCard(
    style: StyleDto,
    isSelected: Boolean,
    onSelect: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val gradient = styleGradient(style.id)
    Surface(
        onClick = onSelect,
        modifier = modifier,
        shape = AtelierShapes.roundedSurface,
        color = AtelierColors.Surface,
        tonalElevation = if (isSelected) 3.dp else 1.dp,
        border = BorderStroke(
            width = if (isSelected) 2.dp else 1.dp,
            color = if (isSelected) AtelierColors.AppleBlue else AtelierColors.Border,
        ),
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(88.dp)
                    .clip(AtelierShapes.roundedSurface)
                    .background(Brush.linearGradient(gradient)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    style.name.take(1),
                    color = AtelierColors.Ink.copy(alpha = 0.55f),
                    style = MaterialTheme.typography.headlineMedium,
                )
                if (isSelected) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(8.dp)
                            .size(24.dp)
                            .clip(CircleShape)
                            .background(AtelierColors.AppleBlue),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            "OK",
                            color = Color.White,
                            textAlign = TextAlign.Center,
                            style = MaterialTheme.typography.labelSmall,
                        )
                    }
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(style.name, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    style.description,
                    color = AtelierColors.Muted,
                    style = MaterialTheme.typography.bodySmall,
                    minLines = 2,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@Composable
private fun ErrorState(
    message: String,
    onRetry: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(message, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
        OutlinedButton(onClick = onRetry, shape = CircleShape) {
            Text("Try again")
        }
    }
}

@Composable
private fun EmptyState() {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 24.dp),
        shape = AtelierShapes.roundedSurface,
        color = AtelierColors.Surface,
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("No styles available", fontWeight = FontWeight.SemiBold)
            Text(
                "The Atelier API did not return any styles.",
                modifier = Modifier.padding(top = 6.dp),
                color = AtelierColors.Muted,
                textAlign = TextAlign.Center,
            )
        }
    }
}

private fun styleGradient(styleId: String): List<Color> =
    when (styleId) {
        "modern" -> listOf(Color(0xFFEBEDF2), Color(0xFFC7CCD6))
        "cozy" -> listOf(Color(0xFFF5E6D6), Color(0xFFDBBDA3))
        "minimal" -> listOf(Color(0xFFF7F7FA), Color(0xFFE0E0E6))
        "scandinavian" -> listOf(Color(0xFFF0F5ED), Color(0xFFD1E0CC))
        "industrial" -> listOf(Color(0xFFDBDBD9), Color(0xFF9E9E99))
        "luxe" -> listOf(Color(0xFFEDE6D6), Color(0xFFC2AD8F))
        else -> listOf(AtelierColors.Canvas, AtelierColors.Surface)
    }
