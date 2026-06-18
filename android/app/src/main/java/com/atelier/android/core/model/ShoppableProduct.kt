package com.atelier.android.core.model

import java.math.BigDecimal
import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

enum class RoomType(val rawValue: String, val displayName: String) {
    LivingRoom("living_room", "Living room"),
    Bedroom("bedroom", "Bedroom"),
}

data class ShoppableProduct(
    val id: String,
    val roomType: RoomType,
    val category: String,
    val title: String,
    val price: BigDecimal?,
    val currencyCode: String,
    val retailer: String,
    val affiliateUrl: String,
    val productUrl: String,
    val imageUrl: String,
    val width: Double?,
    val depth: Double?,
    val height: Double?,
    val dimensionUnit: String,
    val color: String,
    val material: String,
    val styleTags: List<String>,
    val visualDescription: String,
    val notes: String,
) {
    val displayCategory: String
        get() = category.replace("_", " ").replaceFirstChar { it.uppercase() }

    val priceText: String
        get() {
            if (price == null) return "Verify price"
            return runCatching {
                NumberFormat.getCurrencyInstance(Locale.US).apply {
                    this.currency = Currency.getInstance(currencyCode)
                    maximumFractionDigits = 2
                }.format(price)
            }.getOrDefault("$price")
        }

    val shortTitle: String
        get() = title.split(",").firstOrNull()?.trim().orEmpty().ifBlank { title }
}
