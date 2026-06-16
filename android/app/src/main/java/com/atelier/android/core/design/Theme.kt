package com.atelier.android.core.design

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

object AtelierColors {
    val AppleBlue = Color(0xFF0071E3)
    val Canvas = Color(0xFFFBFBFD)
    val CanvasMuted = Color(0xFFF5F5F7)
    val Surface = Color(0xFFFFFFFF)
    val Ink = Color(0xFF1D1D1F)
    val Muted = Color(0xFF6E6E73)
    val MutedLight = Color(0xFF86868B)
    val Border = Color(0x0F000000)
    val BorderStrong = Color(0x14000000)
}

object AtelierSpacing {
    val xs = 4.dp
    val sm = 8.dp
    val md = 16.dp
    val lg = 24.dp
    val xl = 32.dp
}

object AtelierShapes {
    val roundedSurface = RoundedCornerShape(8.dp)
}

private val AtelierColorScheme = lightColorScheme(
    primary = AtelierColors.AppleBlue,
    secondary = AtelierColors.AppleBlue,
    background = AtelierColors.Canvas,
    surface = AtelierColors.Surface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = AtelierColors.Ink,
    onSurface = AtelierColors.Ink,
)

@Composable
fun AtelierTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = AtelierColorScheme,
        typography = Typography(),
        content = content,
    )
}
