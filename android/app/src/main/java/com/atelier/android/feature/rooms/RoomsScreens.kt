package com.atelier.android.feature.rooms

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.atelier.android.BuildConfig
import com.atelier.android.core.design.AtelierColors
import com.atelier.android.core.design.AtelierShapes
import com.atelier.android.core.model.RoomDto
import com.atelier.android.core.network.NetworkModule

@Composable
fun RoomsScreen(
    userName: String,
    viewModel: RoomsViewModel,
    onAddRoom: () -> Unit,
    onRoomSelected: (RoomDto) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("ATELIER", color = AtelierColors.Muted, style = MaterialTheme.typography.labelMedium)
                    Text("Hi, ${userName.firstName()}", style = MaterialTheme.typography.headlineMedium)
                }
                OutlinedButton(onClick = viewModel::logout, shape = CircleShape) {
                    Text("Sign out")
                }
            }
        }
        item {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatTile("Rooms", if (state.isLoading) "..." else state.rooms.size.toString(), true, Modifier.weight(1f))
                val redesigns = state.rooms.sumOf { it.redesignCount }
                StatTile("Saved redesigns", if (state.isLoading) "..." else redesigns.toString(), false, Modifier.weight(1f))
            }
        }
        item {
            Button(onClick = onAddRoom, modifier = Modifier.fillMaxWidth(), shape = CircleShape) {
                Text("Add a room")
            }
        }
        item {
            Text("Your rooms", style = MaterialTheme.typography.headlineSmall)
            Text(
                "Open a room to see every saved redesign.",
                color = AtelierColors.Muted,
                style = MaterialTheme.typography.bodyMedium,
            )
        }
        when {
            state.isLoading -> item {
                Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            state.errorMessage != null -> item {
                Text(state.errorMessage.orEmpty(), color = MaterialTheme.colorScheme.error)
                OutlinedButton(onClick = viewModel::refresh, shape = CircleShape) {
                    Text("Try again")
                }
            }
            state.isEmpty -> item {
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = AtelierShapes.roundedSurface,
                    color = AtelierColors.Surface,
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text("No rooms yet", fontWeight = FontWeight.SemiBold)
                        Text(
                            "Add your first room to start redesigning.",
                            color = AtelierColors.Muted,
                            modifier = Modifier.padding(top = 6.dp),
                        )
                    }
                }
            }
            else -> items(state.rooms, key = { it.id }) { room ->
                RoomCard(room = room, onClick = { onRoomSelected(room) })
            }
        }
    }
}

@Composable
fun AddRoomScreen(
    viewModel: AddRoomViewModel,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val photoPicker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        viewModel.onImageSelected(uri)
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item {
            Text("Name your room", style = MaterialTheme.typography.headlineMedium)
            Text(
                "Give it a name you'll recognize, like \"Living room\" or \"Bedroom\".",
                color = AtelierColors.Muted,
                modifier = Modifier.padding(top = 8.dp),
            )
        }
        item {
            OutlinedTextField(
                value = state.name,
                onValueChange = viewModel::onNameChanged,
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Living room") },
                singleLine = true,
            )
        }
        item {
            PhotoPreview(uri = state.selectedImageUri, isPreparing = state.isPreparingImage)
        }
        item {
            OutlinedButton(
                onClick = {
                    photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                },
                modifier = Modifier.fillMaxWidth(),
                shape = CircleShape,
            ) {
                Text("Choose photo")
            }
        }
        if (state.errorMessage != null) {
            item {
                Text(state.errorMessage.orEmpty(), color = MaterialTheme.colorScheme.error)
            }
        }
        item {
            Button(
                onClick = viewModel::submit,
                enabled = state.canSubmit,
                modifier = Modifier.fillMaxWidth(),
                shape = CircleShape,
            ) {
                Text(if (state.isSubmitting) "Saving room..." else "Save and continue")
            }
        }
    }
}

@Composable
private fun StatTile(label: String, value: String, primary: Boolean, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = AtelierShapes.roundedSurface,
        color = if (primary) MaterialTheme.colorScheme.primary else AtelierColors.Surface,
    ) {
        Column(Modifier.padding(16.dp)) {
            Text(label, color = if (primary) MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f) else AtelierColors.Muted)
            Text(value, color = if (primary) MaterialTheme.colorScheme.onPrimary else AtelierColors.Ink, style = MaterialTheme.typography.headlineMedium)
        }
    }
}

@Composable
private fun RoomCard(room: RoomDto, onClick: () -> Unit) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = AtelierShapes.roundedSurface,
        color = AtelierColors.Surface,
        tonalElevation = 1.dp,
    ) {
        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            AsyncImage(
                model = NetworkModule.absoluteUrl(BuildConfig.BASE_URL, room.originalImageUrl),
                contentDescription = room.name,
                modifier = Modifier.size(72.dp),
                contentScale = ContentScale.Crop,
            )
            Column(modifier = Modifier.padding(start = 14.dp).weight(1f)) {
                Text(room.name, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    "${room.redesignCount} saved redesign${if (room.redesignCount == 1) "" else "s"}",
                    color = AtelierColors.Muted,
                    style = MaterialTheme.typography.bodySmall,
                )
            }
        }
    }
}

@Composable
private fun PhotoPreview(uri: Uri?, isPreparing: Boolean) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16f / 10f),
        shape = AtelierShapes.roundedSurface,
        color = AtelierColors.Surface,
    ) {
        Box(contentAlignment = Alignment.Center) {
            if (uri == null) {
                Text("Add room photo", color = AtelierColors.Muted)
            } else {
                AsyncImage(
                    model = uri,
                    contentDescription = "Selected room photo",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop,
                )
            }
            if (isPreparing) {
                CircularProgressIndicator()
            }
        }
    }
}

private fun String.firstName(): String =
    trim().split(" ").firstOrNull()?.takeIf { it.isNotBlank() } ?: "there"
