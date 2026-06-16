package com.atelier.android.core.design

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

object AtelierColors {
    val Canvas = Color(0xFFF7F4EF)
    val Surface = Color(0xFFFFFFFF)
    val Ink = Color(0xFF201D1A)
    val Muted = Color(0xFF756F67)
    val Clay = Color(0xFFB96D48)
    val Moss = Color(0xFF596C56)
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
    primary = AtelierColors.Moss,
    secondary = AtelierColors.Clay,
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
