package com.atelier.android.feature.redesign

import android.content.ContentValues
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Bed
import androidx.compose.material.icons.rounded.Chair
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material.icons.rounded.Image
import androidx.compose.material.icons.rounded.Inventory2
import androidx.compose.material.icons.rounded.OpenInNew
import androidx.compose.material.icons.rounded.TableBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import coil.imageLoader
import coil.request.ImageRequest
import coil.request.SuccessResult
import com.atelier.android.BuildConfig
import com.atelier.android.core.design.AppBackground
import com.atelier.android.core.design.AtelierColors
import com.atelier.android.core.design.AtelierShapes
import com.atelier.android.core.design.StyleCatalog
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.model.ShoppableProduct
import com.atelier.android.core.network.NetworkModule
import com.atelier.android.core.session.SelectedRoomState
import com.atelier.android.core.ui.BeforeAfterCompareView
import com.atelier.android.core.ui.PrimaryCapsuleButton
import com.atelier.android.core.ui.SecondaryCapsuleButton
import com.atelier.android.core.ui.TertiaryCapsuleButton
import com.atelier.android.core.ui.RedesignImage
import com.atelier.android.core.model.preferredImageSource
import com.atelier.android.core.model.RedesignImageSource
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream

private enum class SaveState {
    Idle,
    Saving,
    Saved,
    Failed,
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SummaryScreen(
    selectedRoomState: SelectedRoomState,
    onGenerate: () -> Unit,
) {
    val room = selectedRoomState.room
    val style = selectedRoomState.selectedStyle

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = { Text("Summary") },
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
                verticalArrangement = Arrangement.spacedBy(24.dp),
            ) {
                Text("Ready to redesign", style = MaterialTheme.typography.headlineMedium)
                if (room != null) {
                    Text(room.name, fontSize = 15.sp, fontWeight = FontWeight.Medium, color = AtelierColors.SecondaryText)
                }
                if (style != null) {
                    Text(
                        "We'll redesign your room in a ${style.name.lowercase()} style using only the matched shoppable products below.",
                        style = MaterialTheme.typography.bodyLarge,
                        lineHeight = 24.sp,
                    )
                }

                SummaryCard(title = "Your room") {
                    RoomImage(selectedRoomState = selectedRoomState, large = true)
                }

                if (style != null) {
                    SummaryCard(title = "Style") {
                        Row(horizontalArrangement = Arrangement.spacedBy(14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Brush.linearGradient(StyleCatalog.gradient(style.id))),
                                contentAlignment = Alignment.Center,
                            ) {
                                Icon(
                                    imageVector = StyleCatalog.icon(style.id),
                                    contentDescription = null,
                                    tint = AtelierColors.Ink.copy(alpha = 0.6f),
                                    modifier = Modifier.size(22.dp),
                                )
                            }
                            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                Text(style.name, fontSize = 17.sp, fontWeight = FontWeight.SemiBold)
                                Text(style.description, fontSize = 14.sp, color = AtelierColors.SecondaryText)
                            }
                        }
                    }
                }

                if (selectedRoomState.selectedProducts.isNotEmpty()) {
                    SummaryCard(title = "Shoppable products") {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            selectedRoomState.selectedProducts.take(4).forEach { product ->
                                ProductSummaryRow(product)
                            }
                            if (selectedRoomState.selectedProducts.size > 4) {
                                Text(
                                    "+ ${selectedRoomState.selectedProducts.size - 4} more matched products",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = AtelierColors.SecondaryText,
                                )
                            }
                        }
                    }
                }

                PrimaryCapsuleButton(
                    text = "Generate redesign",
                    onClick = onGenerate,
                    enabled = room != null && style != null,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
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
            viewModel.generate(room.id, style.id, room.name)
        }
    }

    LaunchedEffect(state.redesign?.id) {
        val redesign = state.redesign ?: return@LaunchedEffect
        onComplete(redesign)
        viewModel.clearCompletedRedesign()
    }

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        if (state.errorMessage != null) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Text("⚠", fontSize = 36.sp, color = AtelierColors.WarningOrange)
                Text("Generation failed", style = MaterialTheme.typography.headlineSmall, modifier = Modifier.padding(top = 20.dp))
                Text(
                    state.errorMessage.orEmpty(),
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 8.dp),
                )
                PrimaryCapsuleButton(
                    text = "Try again",
                    onClick = {
                        if (room != null && style != null) {
                            viewModel.generate(room.id, style.id, room.name)
                        }
                    },
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .border(4.dp, AtelierColors.BorderStrong, CircleShape),
                    )
                    CircularProgressIndicator(
                        modifier = Modifier.size(32.dp),
                        color = AtelierColors.AppleBlue,
                        strokeWidth = 3.dp,
                    )
                }
                Text(
                    "Creating your redesign",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(top = 28.dp),
                )
                Text(
                    state.statusText,
                    fontSize = 16.sp,
                    color = AtelierColors.SecondaryText,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 10.dp),
                )
                if (style != null) {
                    Row(
                        modifier = Modifier
                            .padding(top = 28.dp)
                            .clip(CircleShape)
                            .background(AtelierColors.AppleBlue.copy(alpha = 0.08f))
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Icon(StyleCatalog.icon(style.id), contentDescription = null, tint = AtelierColors.AppleBlue, modifier = Modifier.size(16.dp))
                        Text(style.name, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = AtelierColors.AppleBlue)
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultsScreen(
    selectedRoomState: SelectedRoomState,
    onBackToHome: () -> Unit,
    onTryAnotherStyle: () -> Unit,
) {
    val room = selectedRoomState.room
    val style = selectedRoomState.selectedStyle
    val redesign = selectedRoomState.redesign
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var saveState by remember { mutableStateOf(SaveState.Idle) }

    val beforeModel = remember(room, selectedRoomState.localImageUri) {
        selectedRoomState.localImageUri?.let(Uri::parse)
            ?: room?.originalImageUrl?.let { NetworkModule.absoluteUrl(BuildConfig.BASE_URL, it) }
    }
    val afterModel = remember(redesign) {
        when (val source = redesign?.preferredImageSource()) {
            is RedesignImageSource.Base64 -> source
            is RedesignImageSource.Url -> NetworkModule.absoluteUrl(BuildConfig.BASE_URL, source.value)
            else -> null
        }
    }

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = { Text("Results") },
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
                verticalArrangement = Arrangement.spacedBy(24.dp),
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Your redesign", style = MaterialTheme.typography.headlineMedium)
                    if (style != null) {
                        Text("${style.name} style applied to your room.", style = MaterialTheme.typography.bodyLarge)
                    }
                }

                if (beforeModel != null && afterModel != null) {
                    BeforeAfterCompareView(beforeModel = beforeModel, afterModel = afterModel)
                    Text(
                        "Drag the slider to compare your original room with the redesign.",
                        fontSize = 14.sp,
                        color = AtelierColors.SecondaryText,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth(),
                    )
                } else if (redesign != null) {
                    RedesignImage(
                        redesign = redesign,
                        contentDescription = room?.name ?: "Redesign result",
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(240.dp)
                            .clip(AtelierShapes.cardXLarge),
                    )
                }

                if (selectedRoomState.selectedProducts.isNotEmpty()) {
                    ShopSection(products = selectedRoomState.selectedProducts)
                }

                PrimaryCapsuleButton(
                    text = when (saveState) {
                        SaveState.Saving -> "Saving…"
                        SaveState.Saved -> "Saved"
                        else -> "Save to Photos"
                    },
                    onClick = {
                        if (redesign == null || saveState == SaveState.Saving) return@PrimaryCapsuleButton
                        saveState = SaveState.Saving
                        scope.launch {
                            runCatching { saveRedesignToGallery(context, redesign) }
                                .onSuccess { saveState = SaveState.Saved }
                                .onFailure { saveState = SaveState.Failed }
                        }
                    },
                    enabled = redesign != null && saveState != SaveState.Saving,
                    isLoading = saveState == SaveState.Saving,
                )

                SecondaryCapsuleButton(
                    text = "Share redesign",
                    onClick = {
                        if (redesign == null) return@SecondaryCapsuleButton
                        scope.launch {
                            runCatching { shareRedesign(context, redesign) }
                        }
                    },
                    enabled = redesign != null,
                )

                TertiaryCapsuleButton(text = "Try another style", onClick = onTryAnotherStyle)

                TextLink(text = "Back to home", onClick = onBackToHome)

                when (saveState) {
                    SaveState.Failed -> Text(
                        "Could not save photo.",
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 14.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    SaveState.Saved -> Text(
                        "Saved to your photo library.",
                        fontSize = 14.sp,
                        color = AtelierColors.SecondaryText,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    else -> Unit
                }
            }
        }
    }
}

@Composable
private fun ShopSection(products: List<ShoppableProduct>) {
    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text("Shop this room", style = MaterialTheme.typography.headlineSmall)
            Text(
                "These real Amazon products were matched to your room style. Prices and availability may change.",
                fontSize = 14.sp,
                color = AtelierColors.SecondaryText,
            )
        }
        products.forEach { product -> ProductCard(product) }
        Text(
            "As an Amazon Associate, Atelier may earn from qualifying purchases.",
            fontSize = 12.sp,
            color = AtelierColors.SecondaryText,
            modifier = Modifier.padding(top = 2.dp),
        )
    }
}

@Composable
private fun ProductCard(product: ShoppableProduct) {
    val context = LocalContext.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(10.dp, AtelierShapes.roundedSurface, clip = false, ambientColor = Color.Black.copy(0.04f))
            .clip(AtelierShapes.roundedSurface)
            .background(AtelierColors.Surface)
            .border(1.dp, AtelierColors.Border, AtelierShapes.roundedSurface)
            .clickable {
                context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(product.affiliateUrl)))
            }
            .padding(14.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .clip(AtelierShapes.cardSmall)
                .background(AtelierColors.SignOutFill),
            contentAlignment = Alignment.Center,
        ) {
            AsyncImage(
                model = product.imageUrl,
                contentDescription = product.shortTitle,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
            Icon(
                imageVector = productIcon(product.category),
                contentDescription = null,
                tint = AtelierColors.AppleBlue,
                modifier = Modifier.size(23.dp),
            )
        }
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(5.dp)) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    product.displayCategory,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = AtelierColors.AppleBlue,
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(AtelierColors.AppleBlue.copy(alpha = 0.08f))
                        .padding(horizontal = 8.dp, vertical = 4.dp),
                )
                Text(product.retailer, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = AtelierColors.SecondaryText)
            }
            Text(product.shortTitle, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, maxLines = 2, overflow = TextOverflow.Ellipsis)
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(product.priceText, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                Text("· ${product.color}", fontSize = 13.sp, color = AtelierColors.SecondaryText, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
        Icon(Icons.Rounded.OpenInNew, contentDescription = null, tint = AtelierColors.SecondaryText, modifier = Modifier.size(13.dp))
    }
}

@Composable
private fun ProductSummaryRow(product: ShoppableProduct) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(AtelierColors.AppleBlue.copy(alpha = 0.08f)),
            contentAlignment = Alignment.Center,
        ) {
            AsyncImage(
                model = product.imageUrl,
                contentDescription = product.shortTitle,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )
        }
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(3.dp)) {
            Text(product.displayCategory, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = AtelierColors.SecondaryText)
            Text(product.shortTitle, fontSize = 15.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Text(product.priceText, fontSize = 13.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun SummaryCard(
    title: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(12.dp, AtelierShapes.roundedSurface, clip = false, ambientColor = Color.Black.copy(0.05f))
            .clip(AtelierShapes.roundedSurface)
            .background(AtelierColors.Surface)
            .border(1.dp, AtelierColors.Border, AtelierShapes.roundedSurface)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            title.uppercase(),
            style = MaterialTheme.typography.labelMedium,
            color = AtelierColors.SecondaryText,
        )
        content()
    }
}

@Composable
private fun RoomImage(selectedRoomState: SelectedRoomState, large: Boolean) {
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
                .clip(AtelierShapes.cardMedium)
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
            .height(if (large) 180.dp else 64.dp)
            .clip(AtelierShapes.cardMedium),
        contentScale = ContentScale.Crop,
    )
}

@Composable
private fun TextLink(text: String, onClick: () -> Unit) {
    Text(
        text = text,
        fontSize = 15.sp,
        color = AtelierColors.SecondaryText,
        textAlign = TextAlign.Center,
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClick,
            ),
    )
}

private fun productIcon(category: String): ImageVector =
    when (category) {
        "bed_frame" -> Icons.Rounded.Bed
        "nightstand", "side_table" -> Icons.Rounded.TableBar
        "coffee_table", "dresser" -> Icons.Rounded.GridView
        "rug" -> Icons.Rounded.GridView
        "wall_art" -> Icons.Rounded.Image
        "accent_chair" -> Icons.Rounded.Chair
        else -> Icons.Rounded.Inventory2
    }

private suspend fun saveRedesignToGallery(context: android.content.Context, redesign: RedesignDto) {
    val bitmap = loadRedesignBitmap(context, redesign) ?: error("No image")
    withContext(Dispatchers.IO) {
        val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, "atelier-redesign-${redesign.id}.jpg")
            put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/Atelier")
                put(MediaStore.Images.Media.IS_PENDING, 1)
            }
        }
        val resolver = context.contentResolver
        val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
            ?: error("Could not create media entry")
        resolver.openOutputStream(uri)?.use { stream ->
            if (!bitmap.compress(Bitmap.CompressFormat.JPEG, 92, stream)) {
                error("Could not compress image")
            }
        } ?: error("Could not open output stream")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            values.clear()
            values.put(MediaStore.Images.Media.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
        }
    }
}

private suspend fun shareRedesign(context: android.content.Context, redesign: RedesignDto) {
    val bitmap = loadRedesignBitmap(context, redesign) ?: error("No image")
    withContext(Dispatchers.IO) {
        val cacheDir = File(context.cacheDir, "shares").apply { mkdirs() }
        val file = File(cacheDir, "redesign-${redesign.id}.jpg")
        FileOutputStream(file).use { stream ->
            bitmap.compress(Bitmap.CompressFormat.JPEG, 92, stream)
        }
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
        withContext(Dispatchers.Main) {
            val intent = Intent(Intent.ACTION_SEND).apply {
                type = "image/jpeg"
                putExtra(Intent.EXTRA_STREAM, uri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }
            context.startActivity(Intent.createChooser(intent, "Share redesign"))
        }
    }
}

private suspend fun loadRedesignBitmap(context: android.content.Context, redesign: RedesignDto): Bitmap? =
    when (val source = redesign.preferredImageSource()) {
        is RedesignImageSource.Base64 -> withContext(Dispatchers.Default) {
            val bytes = android.util.Base64.decode(source.value, android.util.Base64.DEFAULT)
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
        }
        is RedesignImageSource.Url -> {
            val request = ImageRequest.Builder(context)
                .data(NetworkModule.absoluteUrl(BuildConfig.BASE_URL, source.value))
                .allowHardware(false)
                .build()
            val result = context.imageLoader.execute(request)
            if (result is SuccessResult) {
                val drawable = result.drawable
                if (drawable is android.graphics.drawable.BitmapDrawable) drawable.bitmap else null
            } else {
                null
            }
        }
        RedesignImageSource.Missing -> null
    }
