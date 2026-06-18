package com.atelier.android.core.design

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountBalance
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.CropSquare
import androidx.compose.material.icons.rounded.Eco
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material.icons.rounded.Weekend
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import com.atelier.android.core.model.StyleDto

object StyleCatalog {
    fun styleFor(id: String): StyleDto? = catalog.firstOrNull { it.id == id }

    fun gradient(styleId: String): List<Color> =
        when (styleId) {
            "modern" -> listOf(Color(0xFFEBEDF2), Color(0xFFC7CCD6))
            "cozy" -> listOf(Color(0xFFF5E6D6), Color(0xFFDBBDA3))
            "minimal" -> listOf(Color(0xFFF7F7FA), Color(0xFFE0E0E6))
            "scandinavian" -> listOf(Color(0xFFF0F5ED), Color(0xFFD1E0CC))
            "industrial" -> listOf(Color(0xFFDBDBD9), Color(0xFF9E9E99))
            "luxe" -> listOf(Color(0xFFEDE6D6), Color(0xFFC2AD8F))
            else -> listOf(AtelierColors.Canvas, AtelierColors.Surface)
        }

    fun icon(styleId: String): ImageVector =
        when (styleId) {
            "modern" -> Icons.Rounded.GridView
            "cozy" -> Icons.Rounded.Weekend
            "minimal" -> Icons.Rounded.CropSquare
            "scandinavian" -> Icons.Rounded.Eco
            "industrial" -> Icons.Rounded.AccountBalance
            "luxe" -> Icons.Rounded.AutoAwesome
            else -> Icons.Rounded.GridView
        }

    val catalog: List<StyleDto> = listOf(
        StyleDto("modern", "Modern", "Clean lines, open space, and a calm neutral palette.", "square.grid.2x2"),
        StyleDto("cozy", "Cozy", "Warm layers, soft textures, and inviting comfort.", "sofa.fill"),
        StyleDto("minimal", "Minimal", "Quiet surfaces, intentional pieces, nothing extra.", "minus.square"),
        StyleDto("scandinavian", "Scandinavian", "Light woods, soft whites, and natural brightness.", "leaf.fill"),
        StyleDto("industrial", "Industrial", "Raw materials, metal accents, and urban character.", "building.columns.fill"),
        StyleDto("luxe", "Luxe", "Rich finishes, depth, and quietly elevated detail.", "sparkles"),
    )
}
