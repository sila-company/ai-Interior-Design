package com.atelier.android.feature.rooms

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.AddAPhoto
import androidx.compose.material.icons.rounded.Apps
import androidx.compose.material.icons.rounded.Home
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
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
fun HomeScreen(
    userName: String,
    viewModel: RoomsViewModel,
    onAddRoom: () -> Unit,
    onBrowseRooms: () -> Unit,
    onAccount: () -> Unit,
    onRoomSelected: (RoomDto) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .padding(top = 24.dp, bottom = 116.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            item {
                Column {
                    Text("ATELIER", color = AtelierColors.MutedLight, style = MaterialTheme.typography.labelMedium)
                    Text("Hi, ${userName.firstName()}", style = MaterialTheme.typography.headlineMedium)
                }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatTile("Rooms", if (state.isLoading) "..." else state.rooms.size.toString(), true, Modifier.weight(1f))
                    val redesigns = state.rooms.sumOf { it.redesignCount }
                    StatTile("Redesigns", if (state.isLoading) "..." else redesigns.toString(), false, Modifier.weight(1f))
                }
            }
            item {
                Button(onClick = onAddRoom, modifier = Modifier.fillMaxWidth(), shape = CircleShape) {
                    Text("Add a room")
                }
            }
            item {
                Text("Recent redesigns", style = MaterialTheme.typography.headlineSmall)
            }
            recentRoomItem(state, onRoomSelected)
            item {
                Text("Quick start", style = MaterialTheme.typography.headlineSmall)
            }
            item {
                QuickStartOption(
                    icon = Icons.Rounded.AddAPhoto,
                    title = "Photograph a room",
                    subtitle = "Save it with a name you'll remember.",
                    onClick = onAddRoom,
                )
            }
            item {
                QuickStartOption(
                    icon = Icons.Rounded.Apps,
                    title = "Browse your rooms",
                    subtitle = "Open a room and try a new style.",
                    onClick = onBrowseRooms,
                )
            }
        }
        AtelierBottomTabs(
            selected = MainTab.Home,
            onHome = {},
            onRooms = onBrowseRooms,
            onAccount = onAccount,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 24.dp),
        )
    }
}

private fun LazyListScope.recentRoomItem(
    state: RoomsUiState,
    onRoomSelected: (RoomDto) -> Unit,
) {
    when {
        state.isLoading -> item {
            Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
        state.errorMessage != null -> item {
            Text(state.errorMessage.orEmpty(), color = MaterialTheme.colorScheme.error)
        }
        state.rooms.isNotEmpty() -> item {
            RoomCard(room = state.rooms.first(), onClick = { onRoomSelected(state.rooms.first()) }, compact = true)
        }
    }
}

@Composable
fun RoomsScreen(
    viewModel: RoomsViewModel,
    onHome: () -> Unit,
    onAccount: () -> Unit,
    onAddRoom: () -> Unit,
    onRoomSelected: (RoomDto) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .padding(top = 24.dp, bottom = 116.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            item {
                Text("Rooms", style = MaterialTheme.typography.headlineMedium)
                Text(
                    "Open a room to see every saved redesign.",
                    color = AtelierColors.Muted,
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
            item {
                Button(onClick = onAddRoom, modifier = Modifier.fillMaxWidth(), shape = CircleShape) {
                    Text("Add a room")
                }
            }
            roomListItems(state, viewModel::refresh, onRoomSelected)
        }
        AtelierBottomTabs(
            selected = MainTab.Rooms,
            onHome = onHome,
            onRooms = {},
            onAccount = onAccount,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 24.dp),
        )
    }
}

private fun LazyListScope.roomListItems(
    state: RoomsUiState,
    onRetry: () -> Unit,
    onRoomSelected: (RoomDto) -> Unit,
) {
    when {
        state.isLoading -> item {
            Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        }
        state.errorMessage != null -> item {
            Text(state.errorMessage.orEmpty(), color = MaterialTheme.colorScheme.error)
            OutlinedButton(onClick = onRetry, shape = CircleShape) {
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

@Composable
fun AccountScreen(
    userName: String,
    onHome: () -> Unit,
    onRooms: () -> Unit,
    onLogout: () -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp)
                .padding(top = 24.dp, bottom = 116.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp),
        ) {
            Text("Account", style = MaterialTheme.typography.headlineMedium)
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = AtelierShapes.roundedSurface,
                color = AtelierColors.Surface,
            ) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(userName.ifBlank { "Atelier user" }, fontWeight = FontWeight.SemiBold)
                    Text("Manage your saved rooms and redesigns.", color = AtelierColors.Muted)
                }
            }
            OutlinedButton(onClick = onLogout, modifier = Modifier.fillMaxWidth(), shape = CircleShape) {
                Text("Sign out")
            }
        }
        AtelierBottomTabs(
            selected = MainTab.Account,
            onHome = onHome,
            onRooms = onRooms,
            onAccount = {},
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 24.dp),
        )
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
private fun QuickStartOption(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
) {
    Surface(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        color = AtelierColors.Surface,
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 18.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(AtelierColors.AppleBlue.copy(alpha = 0.10f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = AtelierColors.AppleBlue,
                    modifier = Modifier.size(24.dp),
                )
            }
            Column(modifier = Modifier.padding(start = 16.dp)) {
                Text(title, color = AtelierColors.Ink, fontWeight = FontWeight.SemiBold)
                Text(subtitle, color = AtelierColors.Muted, style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
}

private enum class MainTab {
    Home,
    Rooms,
    Account,
}

@Composable
private fun AtelierBottomTabs(
    selected: MainTab,
    onHome: () -> Unit,
    onRooms: () -> Unit,
    onAccount: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        shape = CircleShape,
        color = AtelierColors.Surface,
        tonalElevation = 8.dp,
        shadowElevation = 8.dp,
    ) {
        Row(
            modifier = Modifier.padding(8.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            TabButton(Icons.Rounded.Home, "Home", selected == MainTab.Home, onHome)
            TabButton(Icons.Rounded.Apps, "Rooms", selected == MainTab.Rooms, onRooms)
            TabButton(Icons.Rounded.AccountCircle, "Account", selected == MainTab.Account, onAccount)
        }
    }
}

@Composable
private fun TabButton(
    icon: ImageVector,
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val color = if (selected) AtelierColors.AppleBlue else AtelierColors.Ink
    Column(
        modifier = Modifier
            .width(88.dp)
            .clip(CircleShape)
            .clickable(onClick = onClick)
            .background(if (selected) AtelierColors.CanvasMuted else AtelierColors.Surface)
            .padding(vertical = 10.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = color,
            modifier = Modifier.size(26.dp),
        )
        Spacer(Modifier.height(2.dp))
        Text(label, color = color, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun RoomCard(room: RoomDto, onClick: () -> Unit, compact: Boolean = false) {
    Surface(
        onClick = onClick,
        modifier = if (compact) Modifier.fillMaxWidth(0.44f) else Modifier.fillMaxWidth(),
        shape = AtelierShapes.roundedSurface,
        color = AtelierColors.Surface,
        tonalElevation = 1.dp,
    ) {
        if (compact) {
            Column {
                AsyncImage(
                    model = NetworkModule.absoluteUrl(BuildConfig.BASE_URL, room.originalImageUrl),
                    contentDescription = room.name,
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1.18f),
                    contentScale = ContentScale.Crop,
                )
                Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 12.dp)) {
                    Text(room.name, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text(
                        "${room.redesignCount} saved redesign${if (room.redesignCount == 1) "" else "s"}",
                        color = AtelierColors.Muted,
                        style = MaterialTheme.typography.bodySmall,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
            return@Surface
        }
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
