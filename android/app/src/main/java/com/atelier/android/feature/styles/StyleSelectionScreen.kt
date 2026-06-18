package com.atelier.android.feature.styles

import android.net.Uri
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.atelier.android.BuildConfig
import com.atelier.android.core.design.AppBackground
import com.atelier.android.core.design.AtelierColors
import com.atelier.android.core.design.AtelierShapes
import com.atelier.android.core.design.StyleCatalog
import com.atelier.android.core.model.StyleDto
import com.atelier.android.core.network.NetworkModule
import com.atelier.android.core.session.SelectedRoomState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StyleSelectionScreen(
    selectedRoomState: SelectedRoomState,
    viewModel: StyleSelectionViewModel,
    onContinue: (StyleDto) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val selectedStyle = state.selectedStyle

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = { Text("Style") },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                )
            },
            bottomBar = {
                Column {
                    HorizontalDivider(color = AtelierColors.Border)
                    Button(
                        onClick = { selectedStyle?.let(onContinue) },
                        enabled = state.canContinue,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 12.dp),
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AtelierColors.AppleBlue,
                            contentColor = Color.White,
                            disabledContainerColor = AtelierColors.DisabledFill,
                            disabledContentColor = AtelierColors.MutedLight,
                        ),
                        contentPadding = androidx.compose.foundation.layout.PaddingValues(vertical = 14.dp),
                    ) {
                        Text("Continue", fontSize = 15.sp, fontWeight = FontWeight.Medium)
                    }
                }
            },
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp),
            ) {
                RoomContextCard(
                    selectedRoomState = selectedRoomState,
                    selectedStyleName = selectedStyle?.name,
                )

                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Choose your style", style = MaterialTheme.typography.headlineMedium)
                    Text("Pick the mood you want for your redesign.", style = MaterialTheme.typography.bodyLarge)
                }

                when {
                    state.isLoading -> {
                        Box(Modifier.fillMaxWidth().padding(vertical = 48.dp), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator()
                        }
                    }
                    state.errorMessage != null -> ErrorState(state.errorMessage.orEmpty(), viewModel::loadStyles)
                    state.styles.isEmpty() -> EmptyState()
                    else -> {
                        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
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
                                    if (rowStyles.size == 1) Box(Modifier.weight(1f))
                                }
                            }
                        }
                    }
                }
                Box(Modifier.height(80.dp))
            }
        }
    }
}

@Composable
private fun RoomContextCard(
    selectedRoomState: SelectedRoomState,
    selectedStyleName: String?,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(AtelierShapes.cardLarge)
            .background(AtelierColors.Surface)
            .border(BorderStroke(1.dp, AtelierColors.Border), AtelierShapes.cardLarge)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        RoomPreview(selectedRoomState)
        Column {
            Text("Your room", fontSize = 15.sp, fontWeight = FontWeight.SemiBold, color = AtelierColors.Ink)
            Text(
                selectedStyleName ?: "Select a style below",
                fontSize = 14.sp,
                color = if (selectedStyleName == null) AtelierColors.MutedLight else AtelierColors.AppleBlue,
            )
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
                .clip(AtelierShapes.cardSmall)
                .background(AtelierColors.SurfaceGray),
            contentAlignment = Alignment.Center,
        ) {
            Text("Room", color = AtelierColors.MutedLight, fontSize = 12.sp)
        }
        return
    }

    AsyncImage(
        model = model,
        contentDescription = selectedRoomState.room?.name,
        modifier = Modifier
            .size(64.dp)
            .clip(AtelierShapes.cardSmall),
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
    val scale by animateFloatAsState(if (isSelected) 1.02f else 1f, tween(200), label = "scale")
    val gradient = StyleCatalog.gradient(style.id)

    Surface(
        onClick = onSelect,
        modifier = modifier.scale(scale),
        shape = AtelierShapes.roundedSurface,
        color = AtelierColors.Surface,
        shadowElevation = if (isSelected) 16.dp else 10.dp,
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
                    .clip(AtelierShapes.cardMedium)
                    .background(Brush.linearGradient(gradient)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = StyleCatalog.icon(style.id),
                    contentDescription = null,
                    tint = AtelierColors.Ink.copy(alpha = 0.55f),
                    modifier = Modifier.size(28.dp),
                )
                if (isSelected) {
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = null,
                        tint = AtelierColors.AppleBlue,
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(8.dp)
                            .size(22.dp)
                            .background(Color.White, CircleShape),
                    )
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(style.name, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    style.description,
                    fontSize = 12.sp,
                    color = AtelierColors.SecondaryText,
                    minLines = 2,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@Composable
private fun ErrorState(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(message, color = MaterialTheme.colorScheme.error, textAlign = TextAlign.Center)
        OutlinedButton(onClick = onRetry, shape = CircleShape) { Text("Try again") }
    }
}

@Composable
private fun EmptyState() {
    Surface(
        modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
        shape = AtelierShapes.roundedSurface,
        color = AtelierColors.Surface,
    ) {
        Column(modifier = Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
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
