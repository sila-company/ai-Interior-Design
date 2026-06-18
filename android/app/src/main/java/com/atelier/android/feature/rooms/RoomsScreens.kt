package com.atelier.android.feature.rooms

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
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
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.model.RoomDto
import com.atelier.android.core.network.NetworkModule
import com.atelier.android.core.session.SelectedRoomState
import com.atelier.android.core.ui.GrayCapsuleButton
import com.atelier.android.core.ui.PrimaryCapsuleButton
import com.atelier.android.core.ui.SignOutCapsuleButton

@Composable
fun RoomsScreen(
    userName: String,
    viewModel: RoomsViewModel,
    onAddRoom: () -> Unit,
    onSignOut: () -> Unit,
    onRoomSelected: (RoomDto) -> Unit,
    onRecentRedesignSelected: (RoomDto, RedesignDto) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("ATELIER", style = MaterialTheme.typography.labelMedium)
                    Text(
                        "Hi, ${userName.firstName()}",
                        style = MaterialTheme.typography.headlineMedium,
                    )
                }
                Spacer(Modifier.weight(1f))
                SignOutCapsuleButton(text = "Sign out", onClick = onSignOut)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatTile(
                    label = "Rooms",
                    value = if (state.isLoading) "…" else state.rooms.size.toString(),
                    primary = true,
                    modifier = Modifier.weight(1f),
                )
                StatTile(
                    label = "Saved redesigns",
                    value = if (state.isLoading) "…" else state.redesigns.size.toString(),
                    primary = false,
                    modifier = Modifier.weight(1f),
                )
            }

            PrimaryCapsuleButton(text = "Add a room", onClick = onAddRoom)

            if (state.recentRedesigns.isNotEmpty()) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Recent redesigns", style = MaterialTheme.typography.titleMedium)
                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        state.recentRedesigns.forEach { redesign ->
                            val room = state.rooms.firstOrNull { it.id == redesign.roomId } ?: return@forEach
                            RecentRedesignCard(
                                room = room,
                                redesign = redesign,
                                onClick = { onRecentRedesignSelected(room, redesign) },
                            )
                        }
                    }
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Your rooms", style = MaterialTheme.typography.titleMedium)
                Text("Open a room to see every saved redesign.", style = MaterialTheme.typography.bodyMedium)

                when {
                    state.isLoading -> {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally).padding(top = 20.dp))
                    }
                    state.errorMessage != null -> {
                        Text(state.errorMessage.orEmpty(), color = MaterialTheme.colorScheme.error)
                    }
                    state.rooms.isEmpty() -> {
                        Text(
                            "No rooms yet. Add your first room to start redesigning.",
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(top = 8.dp),
                        )
                    }
                    else -> {
                        state.rooms.forEach { room ->
                            RoomListRow(room = room, onClick = { onRoomSelected(room) })
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RoomDetailScreen(
    selectedRoomState: SelectedRoomState,
    viewModel: RoomDetailViewModel,
    onCreateRedesign: () -> Unit,
    onRedesignSelected: (RedesignDto) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val room = selectedRoomState.room

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = { Text(room?.name ?: "Room") },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                )
            },
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(padding)
                    .padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
            ) {
                RoomHeroImage(selectedRoomState)
                if (room != null) {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(room.name, style = MaterialTheme.typography.titleLarge)
                        Text(
                            "${state.redesigns.size} saved redesign${if (state.redesigns.size == 1) "" else "s"}",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                }
                PrimaryCapsuleButton(text = "Create new redesign", onClick = onCreateRedesign)
                Text("Saved designs", style = MaterialTheme.typography.titleMedium)

                when {
                    state.isLoading -> {
                        CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally).padding(top = 24.dp))
                    }
                    state.errorMessage != null -> {
                        Text(state.errorMessage.orEmpty(), color = MaterialTheme.colorScheme.error, fontSize = 14.sp)
                    }
                    state.redesigns.isEmpty() -> {
                        Text(
                            "No redesigns yet. Create your first one and it will be saved here automatically.",
                            style = MaterialTheme.typography.bodyMedium,
                        )
                    }
                    else -> {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            state.redesigns.chunked(2).forEach { row ->
                                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                    row.forEach { redesign ->
                                        SavedRedesignGridCard(
                                            redesign = redesign,
                                            onClick = { onRedesignSelected(redesign) },
                                            modifier = Modifier.weight(1f),
                                        )
                                    }
                                    if (row.size == 1) Spacer(Modifier.weight(1f))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddRoomScreen(viewModel: AddRoomViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val photoPicker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        viewModel.onImageSelected(uri)
    }

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = { Text("New room") },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                )
            },
        ) { padding ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(padding)
                    .padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
            ) {
                Text("Name your room", style = MaterialTheme.typography.headlineMedium)
                Text(
                    "Give it a name you'll recognize, like \"Living room\" or \"Bedroom\".",
                    style = MaterialTheme.typography.bodyLarge,
                )
                com.atelier.android.core.ui.AtelierTextField(
                    value = state.name,
                    onValueChange = viewModel::onNameChanged,
                    placeholder = "Living room",
                )
                PhotoPreview(uri = state.selectedImageUri, isPreparing = state.isPreparingImage)
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    GrayCapsuleButton(
                        text = "Choose photo",
                        onClick = {
                            photoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                        },
                        modifier = Modifier.weight(1f),
                    )
                }
                if (state.errorMessage != null) {
                    Text(state.errorMessage.orEmpty(), color = MaterialTheme.colorScheme.error, fontSize = 14.sp)
                }
                PrimaryCapsuleButton(
                    text = if (state.isSubmitting) "Saving room..." else "Save and continue",
                    onClick = viewModel::submit,
                    enabled = state.canSubmit,
                    isLoading = state.isSubmitting,
                )
            }
        }
    }
}

@Composable
private fun StatTile(label: String, value: String, primary: Boolean, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(AtelierShapes.roundedSurface)
            .background(if (primary) AtelierColors.AppleBlue else AtelierColors.Surface)
            .padding(16.dp),
    ) {
        Text(
            label,
            fontSize = 13.sp,
            color = if (primary) Color.White.copy(alpha = 0.8f) else AtelierColors.MutedLight,
        )
        Text(
            value,
            fontSize = 28.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (primary) Color.White else AtelierColors.Ink,
        )
    }
}

@Composable
private fun RecentRedesignCard(room: RoomDto, redesign: RedesignDto, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(140.dp)
            .clip(AtelierShapes.cardMedium)
            .background(AtelierColors.Surface)
            .clickable(onClick = onClick),
    ) {
        AsyncImage(
            model = NetworkModule.absoluteUrl(BuildConfig.BASE_URL, redesign.resultImageUrl),
            contentDescription = room.name,
            modifier = Modifier
                .width(140.dp)
                .height(105.dp)
                .clip(AtelierShapes.cardSmall),
            contentScale = ContentScale.Crop,
        )
        Column(modifier = Modifier.padding(10.dp)) {
            Text(room.name, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(
                styleName(redesign.styleId),
                fontSize = 12.sp,
                color = AtelierColors.SecondaryText,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun RoomListRow(room: RoomDto, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(AtelierShapes.cardLarge)
            .background(AtelierColors.Surface)
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        AsyncImage(
            model = NetworkModule.absoluteUrl(BuildConfig.BASE_URL, room.originalImageUrl),
            contentDescription = room.name,
            modifier = Modifier
                .size(72.dp)
                .clip(AtelierShapes.cardMedium),
            contentScale = ContentScale.Crop,
        )
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(room.name, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, color = AtelierColors.Ink)
            Text(
                "${room.redesignCount} saved redesign${if (room.redesignCount == 1) "" else "s"}",
                fontSize = 14.sp,
                color = AtelierColors.SecondaryText,
            )
        }
    }
}

@Composable
private fun SavedRedesignGridCard(
    redesign: RedesignDto,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier
            .clip(AtelierShapes.cardMedium)
            .background(AtelierColors.Surface)
            .clickable(onClick = onClick),
    ) {
        AsyncImage(
            model = NetworkModule.absoluteUrl(BuildConfig.BASE_URL, redesign.resultImageUrl),
            contentDescription = styleName(redesign.styleId),
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(4f / 3f)
                .clip(AtelierShapes.cardSmall),
            contentScale = ContentScale.Crop,
        )
        Text(
            styleName(redesign.styleId),
            modifier = Modifier.padding(10.dp),
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = AtelierColors.Ink,
        )
    }
}

@Composable
private fun RoomHeroImage(selectedRoomState: SelectedRoomState) {
    val localUri = selectedRoomState.localImageUri?.let(Uri::parse)
    val remoteUrl = selectedRoomState.room?.originalImageUrl?.let {
        NetworkModule.absoluteUrl(BuildConfig.BASE_URL, it)
    }
    val model = localUri ?: remoteUrl

    if (model == null) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 10f)
                .clip(AtelierShapes.cardHero)
                .background(AtelierColors.SurfaceGray),
            contentAlignment = Alignment.Center,
        ) {
            Text("No room image", color = AtelierColors.MutedLight)
        }
        return
    }

    AsyncImage(
        model = model,
        contentDescription = selectedRoomState.room?.name,
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16f / 10f)
            .clip(AtelierShapes.cardHero),
        contentScale = ContentScale.Crop,
    )
}

@Composable
private fun PhotoPreview(uri: Uri?, isPreparing: Boolean) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(16f / 10f)
            .clip(AtelierShapes.cardXLarge)
            .background(AtelierColors.SurfaceGray),
        contentAlignment = Alignment.Center,
    ) {
        if (uri == null) {
            Text("Add room photo", color = AtelierColors.MutedLight)
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

private fun styleName(styleId: String): String =
    StyleCatalog.styleFor(styleId)?.name ?: styleId.replaceFirstChar { it.uppercase() }

@Composable
fun RoomsLibraryScreen(
    viewModel: RoomsViewModel,
    onAddRoom: () -> Unit,
    onRoomSelected: (RoomDto) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Rooms", fontSize = 34.sp, fontWeight = FontWeight.SemiBold, color = AtelierColors.Ink)
                Text("Each room keeps its photo and every AI redesign.", style = MaterialTheme.typography.bodyLarge)
            }

            PrimaryCapsuleButton(text = "Add a room", onClick = onAddRoom)

            when {
                state.isLoading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.CenterHorizontally).padding(top = 40.dp))
                }
                state.errorMessage != null -> {
                    Text(state.errorMessage.orEmpty(), color = MaterialTheme.colorScheme.error)
                }
                state.rooms.isEmpty() -> {
                    Text(
                        "No rooms yet. Add your first room to start redesigning.",
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(AtelierShapes.roundedSurface)
                            .background(AtelierColors.Surface)
                            .padding(24.dp),
                    )
                }
                else -> {
                    state.rooms.forEach { room ->
                        RoomListRow(room = room, onClick = { onRoomSelected(room) })
                    }
                }
            }
        }
    }
}

@Composable
fun HomeDashboardScreen(
    userName: String,
    viewModel: RoomsViewModel,
    onAddRoom: () -> Unit,
    onBrowseRooms: () -> Unit,
    onRecentRedesignSelected: (RoomDto, RedesignDto) -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("ATELIER", style = MaterialTheme.typography.labelMedium)
                Text("Hi, ${userName.firstName()}", fontSize = 34.sp, fontWeight = FontWeight.SemiBold, color = AtelierColors.Ink)
                Text("Your rooms and AI redesigns, all in one place.", style = MaterialTheme.typography.bodyLarge)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                StatTile(
                    label = "Rooms",
                    value = if (state.isLoading) "-" else state.rooms.size.toString(),
                    primary = true,
                    modifier = Modifier.weight(1f),
                )
                StatTile(
                    label = "Redesigns",
                    value = if (state.isLoading) "-" else state.redesigns.size.toString(),
                    primary = false,
                    modifier = Modifier.weight(1f),
                )
            }

            PrimaryCapsuleButton(text = "Add a room", onClick = onAddRoom)

            if (state.recentRedesigns.isNotEmpty()) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Recent redesigns", style = MaterialTheme.typography.titleMedium)
                    Row(
                        modifier = Modifier.horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        state.recentRedesigns.forEach { redesign ->
                            val room = state.rooms.firstOrNull { it.id == redesign.roomId } ?: return@forEach
                            RecentRedesignCard(
                                room = room,
                                redesign = redesign,
                                onClick = { onRecentRedesignSelected(room, redesign) },
                            )
                        }
                    }
                }
            }

            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Quick start", style = MaterialTheme.typography.titleMedium)
                QuickStartRow(
                    title = "Photograph a room",
                    subtitle = "Save it with a name you'll remember.",
                    onClick = onAddRoom,
                )
                QuickStartRow(
                    title = "Browse your rooms",
                    subtitle = "Open a room and try a new style.",
                    onClick = onBrowseRooms,
                )
            }

            if (state.errorMessage != null) {
                Text(state.errorMessage.orEmpty(), color = MaterialTheme.colorScheme.error, fontSize = 14.sp)
            }
        }
    }
}

@Composable
private fun QuickStartRow(
    title: String,
    subtitle: String,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(AtelierShapes.cardLarge)
            .background(AtelierColors.Surface)
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Box(
            modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(20.dp))
                .background(AtelierColors.AppleBlue.copy(alpha = 0.08f)),
            contentAlignment = Alignment.Center,
        ) {
            Text("+", fontSize = 20.sp, fontWeight = FontWeight.SemiBold, color = AtelierColors.AppleBlue)
        }
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(title, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = AtelierColors.Ink)
            Text(subtitle, fontSize = 14.sp, color = AtelierColors.SecondaryText)
        }
    }
}

@Composable
fun AccountScreen(
    userName: String,
    userEmail: String,
    viewModel: RoomsViewModel,
    onSignOut: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            Text("Account", fontSize = 34.sp, fontWeight = FontWeight.SemiBold, color = AtelierColors.Ink)

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(AtelierShapes.roundedSurface)
                    .background(AtelierColors.Surface)
                    .padding(18.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp),
            ) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(28.dp))
                        .background(AtelierColors.AppleBlue),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(initials(userName), fontSize = 22.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                }

                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(userName, style = MaterialTheme.typography.titleMedium)
                    Text(userEmail, style = MaterialTheme.typography.bodyMedium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(AtelierShapes.roundedSurface)
                    .background(AtelierColors.Surface)
                    .padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Text("Your library", style = MaterialTheme.typography.titleSmall)
                Row {
                    LibraryStat(value = state.rooms.size.toString(), label = "Rooms", modifier = Modifier.weight(1f))
                    LibraryStat(value = state.redesigns.size.toString(), label = "Redesigns", modifier = Modifier.weight(1f))
                }
            }

            SignOutCapsuleButton(text = "Sign out", onClick = onSignOut, modifier = Modifier.fillMaxWidth())
        }
    }
}

@Composable
private fun LibraryStat(value: String, label: String, modifier: Modifier = Modifier) {
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(value, fontSize = 24.sp, fontWeight = FontWeight.SemiBold, color = AtelierColors.Ink)
        Text(label, fontSize = 14.sp, color = AtelierColors.SecondaryText)
    }
}

private fun initials(name: String): String =
    name.trim()
        .split(" ")
        .filter { it.isNotBlank() }
        .take(2)
        .mapNotNull { it.firstOrNull()?.uppercase() }
        .joinToString("")
        .ifBlank { "A" }

private fun String.firstName(): String =
    trim().split(" ").firstOrNull()?.takeIf { it.isNotBlank() } ?: "there"
