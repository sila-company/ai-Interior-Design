package com.atelier.android.core.design

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

object AtelierColors {
    val AppleBlue = Color(0xFF0071E3)
    val Canvas = Color(0xFFFBFBFD)
    val CanvasBase = Color(0xFFFBFBFC)
    val CanvasMuted = Color(0xFFF5F5F7)
    val SurfaceGray = Color(0xFFF5F5F7)
    val SurfaceMid = Color(0xFFECECEE)
    val Surface = Color(0xFFFFFFFF)
    val Ink = Color(0xFF1D1D1F)
    val SecondaryText = Color(0xFF6E6E73)
    val Muted = Color(0xFF6E6E73)
    val MutedLight = Color(0xFF86868B)
    val WarningOrange = Color(0xFFCC7333)
    val Border = Color(0x0F000000)
    val BorderStrong = Color(0x14000000)
    val DisabledFill = Color(0x0F000000)
    val SignOutFill = Color(0x0A000000)
}

object AtelierSpacing {
    val xs = 4.dp
    val sm = 8.dp
    val md = 16.dp
    val lg = 24.dp
    val xl = 32.dp
}

object AtelierShapes {
    val cardSmall = RoundedCornerShape(14.dp)
    val cardMedium = RoundedCornerShape(16.dp)
    val cardLarge = RoundedCornerShape(18.dp)
    val cardXLarge = RoundedCornerShape(20.dp)
    val cardHero = RoundedCornerShape(24.dp)
    val previewCard = RoundedCornerShape(28.dp)
    val textField = RoundedCornerShape(16.dp)
    val roundedSurface = RoundedCornerShape(20.dp)
}

private val AtelierTypography = Typography(
    displaySmall = TextStyle(
        fontSize = 44.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = (-1.5).sp,
        lineHeight = 48.sp,
        color = AtelierColors.Ink,
    ),
    headlineMedium = TextStyle(
        fontSize = 28.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = (-0.5).sp,
        color = AtelierColors.Ink,
    ),
    headlineSmall = TextStyle(
        fontSize = 22.sp,
        fontWeight = FontWeight.SemiBold,
        color = AtelierColors.Ink,
    ),
    titleLarge = TextStyle(
        fontSize = 24.sp,
        fontWeight = FontWeight.SemiBold,
        color = AtelierColors.Ink,
    ),
    titleMedium = TextStyle(
        fontSize = 20.sp,
        fontWeight = FontWeight.SemiBold,
        color = AtelierColors.Ink,
    ),
    titleSmall = TextStyle(
        fontSize = 17.sp,
        fontWeight = FontWeight.SemiBold,
        color = AtelierColors.Ink,
    ),
    bodyLarge = TextStyle(
        fontSize = 17.sp,
        fontWeight = FontWeight.Normal,
        color = AtelierColors.SecondaryText,
    ),
    bodyMedium = TextStyle(
        fontSize = 15.sp,
        fontWeight = FontWeight.Normal,
        color = AtelierColors.SecondaryText,
    ),
    bodySmall = TextStyle(
        fontSize = 14.sp,
        fontWeight = FontWeight.Normal,
        color = AtelierColors.SecondaryText,
    ),
    labelLarge = TextStyle(
        fontSize = 15.sp,
        fontWeight = FontWeight.Medium,
        color = AtelierColors.Ink,
    ),
    labelMedium = TextStyle(
        fontSize = 13.sp,
        fontWeight = FontWeight.Medium,
        letterSpacing = 1.2.sp,
        color = AtelierColors.MutedLight,
    ),
    labelSmall = TextStyle(
        fontSize = 12.sp,
        fontWeight = FontWeight.Medium,
        color = AtelierColors.SecondaryText,
    ),
)

private val AtelierColorScheme = lightColorScheme(
    primary = AtelierColors.AppleBlue,
    secondary = AtelierColors.AppleBlue,
    background = AtelierColors.Canvas,
    surface = AtelierColors.Surface,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = AtelierColors.Ink,
    onSurface = AtelierColors.Ink,
    error = Color(0xFFFF3B30),
)

@Composable
fun AtelierTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = AtelierColorScheme,
        typography = AtelierTypography,
        content = content,
    )
}
