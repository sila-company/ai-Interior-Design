package com.atelier.android.feature.redesign

import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.session.SelectedRoomState
import com.atelier.android.core.ui.RedesignImage
import com.atelier.android.core.network.NetworkModule

@Composable
fun SummaryScreen(
    selectedRoomState: SelectedRoomState,
    onGenerate: () -> Unit,
) {
    val room = selectedRoomState.room
    val style = selectedRoomState.selectedStyle

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp),
    ) {
        Text("Ready to redesign", style = MaterialTheme.typography.headlineMedium)

        if (room != null && style != null) {
            Text(
                "We will redesign ${room.name} in a ${style.name.lowercase()} style and save it to your account.",
                color = AtelierColors.Muted,
                style = MaterialTheme.typography.bodyLarge,
            )
        } else {
            Text(
                "Select a room and style before generating a redesign.",
                color = AtelierColors.Muted,
                style = MaterialTheme.typography.bodyLarge,
            )
        }

        SummaryCard(title = "Your room") {
            RoomImage(selectedRoomState = selectedRoomState, large = true)
            if (room != null) {
                Text(room.name, fontWeight = FontWeight.SemiBold)
            }
        }

        if (style != null) {
            SummaryCard(title = "Style") {
                Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(AtelierShapes.roundedSurface)
                            .background(Brush.linearGradient(styleGradient(style.id))),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(style.name.take(1), color = AtelierColors.Ink.copy(alpha = 0.60f), style = MaterialTheme.typography.titleLarge)
                    }
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(style.name, fontWeight = FontWeight.SemiBold)
                        Text(style.description, color = AtelierColors.Muted, style = MaterialTheme.typography.bodySmall)
                    }
                }
            }
        }

        Button(
            onClick = onGenerate,
            enabled = room != null && style != null,
            modifier = Modifier.fillMaxWidth(),
            shape = CircleShape,
        ) {
            Text("Generate redesign")
        }
    }
}

@Composable
fun GeneratingScreen(
    selectedRoomState: SelectedRoomState,
    viewModel: GeneratingViewModel,
    onComplete: (RedesignDto) -> Unit,
) {
    val room = selectedRoomState.room
    val style = selectedRoomState.selectedStyle
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(room?.id, style?.id) {
        if (room != null && style != null && state.redesign == null && !state.isGenerating && state.errorMessage == null) {
            viewModel.generate(room.id, style.id)
        }
    }

    LaunchedEffect(state.redesign?.id) {
        val redesign = state.redesign ?: return@LaunchedEffect
        onComplete(redesign)
        viewModel.clearCompletedRedesign()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        if (state.errorMessage != null) {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = AtelierShapes.roundedSurface,
                color = AtelierColors.Surface,
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("Generation failed", style = MaterialTheme.typography.headlineSmall)
                    Text(
                        state.errorMessage.orEmpty(),
                        color = AtelierColors.Muted,
                        textAlign = TextAlign.Center,
                    )
                    Button(
                        onClick = {
                            if (room != null && style != null) {
                                viewModel.generate(room.id, style.id)
                            }
                        },
                        shape = CircleShape,
                    ) {
                        Text("Try again")
                    }
                }
            }
        } else {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = AtelierShapes.roundedSurface,
                color = AtelierColors.Surface,
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(18.dp),
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Surface(
                            modifier = Modifier.size(72.dp),
                            shape = CircleShape,
                            color = Color.Transparent,
                            border = androidx.compose.foundation.BorderStroke(4.dp, AtelierColors.BorderStrong),
                        ) {}
                        androidx.compose.material3.CircularProgressIndicator(modifier = Modifier.size(32.dp), strokeWidth = 3.dp)
                    }
                    Text("Creating your redesign", style = MaterialTheme.typography.headlineSmall)
                    Text(state.statusText, color = AtelierColors.Muted, textAlign = TextAlign.Center)
                    if (style != null) {
                        Surface(
                            shape = CircleShape,
                            color = AtelierColors.AppleBlue.copy(alpha = 0.08f),
                        ) {
                            Text(
                                style.name,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                color = AtelierColors.AppleBlue,
                                style = MaterialTheme.typography.labelLarge,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ResultsScreen(
    selectedRoomState: SelectedRoomState,
    onBackToHome: () -> Unit,
    onTryAnotherStyle: () -> Unit,
) {
    val room = selectedRoomState.room
    val style = selectedRoomState.selectedStyle
    val redesign = selectedRoomState.redesign

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp),
    ) {
        Text("Your redesign", style = MaterialTheme.typography.headlineMedium)
        if (style != null) {
            Text("${style.name} style applied to your room.", color = AtelierColors.Muted)
        }

        SummaryCard(title = "Result") {
            if (redesign != null) {
                RedesignImage(
                    redesign = redesign,
                    contentDescription = room?.name ?: "Redesign result",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp)
                        .clip(AtelierShapes.roundedSurface),
                )
            } else {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp)
                        .clip(AtelierShapes.roundedSurface)
                        .background(AtelierColors.CanvasMuted),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("No redesign available", color = AtelierColors.Muted)
                }
            }
        }

        Button(onClick = onTryAnotherStyle, modifier = Modifier.fillMaxWidth(), shape = CircleShape) {
            Text("Try another style")
        }
        OutlinedButton(onClick = onBackToHome, modifier = Modifier.fillMaxWidth(), shape = CircleShape) {
            Text("Back to home")
        }
    }
}

@Composable
private fun SummaryCard(
    title: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Surface(
        shape = AtelierShapes.roundedSurface,
        color = AtelierColors.Surface,
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            content = content,
        )
    }
}

@Composable
private fun RoomImage(
    selectedRoomState: SelectedRoomState,
    large: Boolean,
) {
    val localUri = selectedRoomState.localImageUri?.let(Uri::parse)
    val remoteUrl = selectedRoomState.room?.originalImageUrl?.let {
        NetworkModule.absoluteUrl(BuildConfig.BASE_URL, it)
    }
    val model = localUri ?: remoteUrl

    if (model == null) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(if (large) 180.dp else 64.dp)
                .clip(AtelierShapes.roundedSurface)
                .background(AtelierColors.CanvasMuted),
            contentAlignment = Alignment.Center,
        ) {
            Text("No room image", color = AtelierColors.Muted)
        }
        return
    }

    AsyncImage(
        model = model,
        contentDescription = selectedRoomState.room?.name ?: "Room image",
        modifier = Modifier
            .fillMaxWidth()
            .height(if (large) 180.dp else 64.dp)
            .clip(AtelierShapes.roundedSurface),
        contentScale = ContentScale.Crop,
    )
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
