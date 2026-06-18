package com.atelier.android.core.catalog

import com.atelier.android.core.model.RedesignProductDto
import com.atelier.android.core.model.RoomType
import com.atelier.android.core.model.ShoppableProduct
import java.math.BigDecimal
import java.util.Locale

object ProductCatalog {
    fun bundle(roomName: String?, styleId: String, limit: Int = 12): List<ShoppableProduct> {
        val roomType = inferRoomType(roomName)
        val styleAliases = aliases(styleId)
        val roomMatches = products.filter { product ->
            product.roomType == roomType ||
                product.notes.contains(roomType.displayName, ignoreCase = true)
        }
        return roomMatches
            .sortedByDescending { score(it, styleAliases) }
            .take(limit)
    }

    fun promptBrief(products: List<ShoppableProduct>): List<RedesignProductDto> =
        products.map { product ->
            RedesignProductDto(
                category = product.displayCategory,
                title = product.shortTitle,
                price = product.price?.toPlainString().orEmpty(),
                retailer = product.retailer,
                imageUrl = product.imageUrl,
                color = product.color,
                material = product.material,
                dimensions = dimensionsText(product),
                visualDescription = product.visualDescription,
            )
        }

    private fun inferRoomType(roomName: String?): RoomType {
        val name = roomName?.lowercase().orEmpty()
        return if (name.contains("bed") || name.contains("master") || name.contains("guest")) {
            RoomType.Bedroom
        } else {
            RoomType.LivingRoom
        }
    }

    private fun aliases(styleId: String): Set<String> =
        when (styleId) {
            "minimal" -> setOf("minimal", "minimalist", "modern", "neutral")
            "scandinavian" -> setOf("scandinavian", "modern", "minimalist", "cozy", "neutral")
            "cozy" -> setOf("cozy", "boho", "farmhouse", "neutral")
            "luxe" -> setOf("luxe", "luxury", "modern")
            "industrial" -> setOf("industrial", "modern")
            else -> setOf("modern", "minimalist", "cozy")
        }

    private fun score(product: ShoppableProduct, styleAliases: Set<String>): Int =
        product.styleTags.count { it in styleAliases }

    private fun dimensionsText(product: ShoppableProduct): String {
        val parts = listOfNotNull(
            product.width?.let { formatNumber(it) },
            product.depth?.let { formatNumber(it) },
            product.height?.let { formatNumber(it) },
        )
        if (parts.isEmpty()) return ""
        return "${parts.joinToString(" x ")} ${product.dimensionUnit}"
    }

    private fun formatNumber(value: Double): String =
        if (value % 1.0 == 0.0) value.toInt().toString() else String.format(Locale.US, "%.1f", value)

    val products: List<ShoppableProduct> = listOf(
        ShoppableProduct(
            id = "amazon-linsy-accent-chair-ottoman",
            roomType = RoomType.LivingRoom,
            category = "accent_chair",
            title = "LINSY Accent Chair with Ottoman, Modern Barrel Chair Small Armchair Reading Chair with Footrest, Velvet, Cream",
            price = BigDecimal("116.99"),
            currencyCode = "USD",
            retailer = "Amazon",
            affiliateUrl = "https://amzn.to/43tyNvV",
            productUrl = "https://www.amazon.com/LINSY-Ottoman-Armchair-Reading-Footrest/dp/B0H2HLN64B",
            imageUrl = "https://m.media-amazon.com/images/I/81djaLSUNrL._AC_SL1500_.jpg",
            width = 27.4,
            depth = 25.6,
            height = 26.8,
            dimensionUnit = "in",
            color = "cream",
            material = "velvet",
            styleTags = listOf("modern", "cozy", "minimalist"),
            visualDescription = "A compact cream velvet barrel accent chair with rounded arms, a low curved back, soft upholstered seat, slim black metal legs, and a matching cream ottoman.",
            notes = "Small accent chair with ottoman; Amazon page lists velvet material.",
        ),
        ShoppableProduct(
            id = "amazon-zttriee-round-coffee-table",
            roomType = RoomType.LivingRoom,
            category = "coffee_table",
            title = "ZttRiee Coffee Table for Living Room, Modern Round Coffee Table with Cabinets & Sliding Doors, 29.9 Inch Fluted Center Table, Natural",
            price = BigDecimal("139.99"),
            currencyCode = "USD",
            retailer = "Amazon",
            affiliateUrl = "https://amzn.to/4vr4oe9",
            productUrl = "https://www.amazon.com/ZttRiee-Coffee-Living-Cabinets-Sliding/dp/B0FGPFBSJ8",
            imageUrl = "https://m.media-amazon.com/images/I/71ckFGe+tqL._AC_SL1500_.jpg",
            width = 29.9,
            depth = 29.9,
            height = 16.1,
            dimensionUnit = "in",
            color = "oak",
            material = "wood",
            styleTags = listOf("modern", "boho", "scandinavian"),
            visualDescription = "A low round natural-oak coffee table with a fluted cylindrical body, smooth circular top, concealed cabinet storage, and sliding curved doors.",
            notes = "Price should be verified.",
        ),
        ShoppableProduct(
            id = "amazon-vasagle-maezo-side-table",
            roomType = RoomType.LivingRoom,
            category = "side_table",
            title = "VASAGLE MAEZO Collection End Table with Charging Station, Narrow Side Table, Nightstand, Honey Brown",
            price = BigDecimal("44.98"),
            currencyCode = "USD",
            retailer = "Amazon",
            affiliateUrl = "https://amzn.to/4vaIRWQ",
            productUrl = "https://www.amazon.com/VASAGLE-MAEZO-Collection-Transitions-ULET329K101S/dp/B0H28FZH8L",
            imageUrl = "https://m.media-amazon.com/images/I/81m9BWEmi7L._AC_SL1500_.jpg",
            width = 18.9,
            depth = 11.8,
            height = 23.6,
            dimensionUnit = "in",
            color = "honey brown",
            material = "particleboard; mdf",
            styleTags = listOf("mid-century modern", "modern", "cozy"),
            visualDescription = "A narrow honey-brown side table with a warm wood-grain finish, simple rectangular frame, open lower shelf, small drawer, and built-in charging station.",
            notes = "Can work for living room or bedroom; includes charging station.",
        ),
        ShoppableProduct(
            id = "amazon-garvee-beige-rug",
            roomType = RoomType.LivingRoom,
            category = "rug",
            title = "Garvee Beige 8x10 Area Rug, Boho Vintage Non-Slip Washable Low Pile Rug",
            price = BigDecimal("59.99"),
            currencyCode = "USD",
            retailer = "Amazon",
            affiliateUrl = "https://amzn.to/4vbSi8q",
            productUrl = "https://www.amazon.com/Garvee-Beige-Non-Slip-Washable-Resistant/dp/B0GHYC8KVH",
            imageUrl = "https://m.media-amazon.com/images/I/81z00Wf0N3L._AC_SL1500_.jpg",
            width = 120.0,
            depth = 96.0,
            height = null,
            dimensionUnit = "in",
            color = "beige",
            material = "faux wool",
            styleTags = listOf("boho", "cozy", "minimalist"),
            visualDescription = "A large beige low-pile area rug with a soft faux-wool texture, subtle vintage boho patterning, muted cream and tan tones, and a flat rectangular profile.",
            notes = "8 x 10 ft rectangular rug; also suitable for bedroom.",
        ),
        ShoppableProduct(
            id = "amazon-minimalist-boho-wall-art",
            roomType = RoomType.LivingRoom,
            category = "wall_art",
            title = "3 Piece Framed Minimalist Boho Canvas Wall Art, Abstract Sage Green Geometric Artwork, 12x16 Inch",
            price = BigDecimal("47.99"),
            currencyCode = "USD",
            retailer = "Amazon",
            affiliateUrl = "https://amzn.to/4e9cPoc",
            productUrl = "https://www.amazon.com/Minimalist-Bedroom-Abstract-Geometric-Paintings/dp/B0G438R3D3",
            imageUrl = "https://m.media-amazon.com/images/I/71ieSd0G8vL._AC_SL1500_.jpg",
            width = 12.0,
            depth = null,
            height = 16.0,
            dimensionUnit = "in",
            color = "green white",
            material = "canvas; wood",
            styleTags = listOf("minimalist", "boho", "scandinavian", "modern"),
            visualDescription = "A set of three framed minimalist canvas prints with sage green and white abstract geometric shapes, thin natural frames, and clean modern boho composition.",
            notes = "Set of 3 framed pieces; also suitable for bedroom.",
        ),
        ShoppableProduct(
            id = "amazon-wooden-floral-wall-decor",
            roomType = RoomType.LivingRoom,
            category = "wall_art",
            title = "3D Wooden Floral Wall Decor Set of 4, Ready-to-Hang Framed Boho Botanical Wall Art, Naturals",
            price = BigDecimal("39.99"),
            currencyCode = "USD",
            retailer = "Amazon",
            affiliateUrl = "https://amzn.to/4e8ejit",
            productUrl = "https://www.amazon.com/Wooden-Floral-Bathroom-Lightweight-Bedroom/dp/B0DHW91KK4",
            imageUrl = "https://m.media-amazon.com/images/I/81Zgn5eG-5L._AC_SL1500_.jpg",
            width = 7.0,
            depth = null,
            height = 16.0,
            dimensionUnit = "in",
            color = "naturals",
            material = "wood",
            styleTags = listOf("boho", "farmhouse", "cozy", "neutral"),
            visualDescription = "A set of four slim natural-wood framed wall panels with raised three-dimensional floral and botanical cutout details in a neutral boho style.",
            notes = "Set of 4; also suitable for bedroom, office, kitchen, or bathroom.",
        ),
        ShoppableProduct(
            id = "amazon-bestier-queen-bed-frame",
            roomType = RoomType.Bedroom,
            category = "bed_frame",
            title = "Bestier Queen Bed Frame with Adjustable Headboard & LED Lighting, Corduroy Upholstered Platform Bed Frame with Storage Shelf, Beige",
            price = null,
            currencyCode = "USD",
            retailer = "Amazon",
            affiliateUrl = "https://amzn.to/4v1suvA",
            productUrl = "https://www.amazon.com/Bestier-Corduroy-Upholstered-Adjustable-Headboard/dp/B0DKXW9QYK",
            imageUrl = "https://m.media-amazon.com/images/I/91r51mOPk+L._AC_SL1500_.jpg",
            width = 60.51,
            depth = 83.46,
            height = 39.37,
            dimensionUnit = "in",
            color = "beige",
            material = "corduroy; engineered plywood; foam; wood; metal",
            styleTags = listOf("modern", "minimalist", "cozy"),
            visualDescription = "A beige upholstered queen platform bed with soft corduroy texture, a padded adjustable headboard, integrated storage shelf, clean low-profile frame, and subtle built-in LED lighting.",
            notes = "Queen size; price should be verified.",
        ),
        ShoppableProduct(
            id = "amazon-cozymine-fluted-nightstand",
            roomType = RoomType.Bedroom,
            category = "nightstand",
            title = "CozyMine Fluted Nightstand with Charging Station, 2 Drawers Storage Bedside Table, Oak",
            price = BigDecimal("109.99"),
            currencyCode = "USD",
            retailer = "Amazon",
            affiliateUrl = "https://amzn.to/4xsHnZv",
            productUrl = "https://www.amazon.com/Nightstand-Charging-Station-Drawers-Storage/dp/B0G4RJR5B6",
            imageUrl = "https://m.media-amazon.com/images/I/81BLj7mPPZL._AC_SL1500_.jpg",
            width = 15.7,
            depth = 18.0,
            height = 23.6,
            dimensionUnit = "in",
            color = "oak",
            material = "engineered wood; metal; wood",
            styleTags = listOf("modern", "scandinavian", "cozy"),
            visualDescription = "A compact oak fluted nightstand with two drawers, vertical ribbed drawer fronts, rounded modern edges, short legs, and an integrated charging station on top.",
            notes = "Can work as bedroom nightstand or living room end table; includes charging station.",
        ),
        ShoppableProduct(
            id = "amazon-tinge-lira-fabric-dresser",
            roomType = RoomType.Bedroom,
            category = "dresser",
            title = "tinge Lira Premium 4 Drawer Fabric Dresser, Engineered Wood Frame Chest of Drawers, Dark Brown",
            price = null,
            currencyCode = "USD",
            retailer = "Amazon",
            affiliateUrl = "https://amzn.to/4uCVokO",
            productUrl = "https://www.amazon.com/Lira-Premium-Fabric-Dresser-Sag-Proof/dp/B0F5Q9WS76",
            imageUrl = "https://m.media-amazon.com/images/I/61ZefH2vlqL._AC_SL1500_.jpg",
            width = 23.4,
            depth = 11.8,
            height = 36.5,
            dimensionUnit = "in",
            color = "dark brown",
            material = "engineered wood; fabric; metal",
            styleTags = listOf("modern", "minimalist", "cozy"),
            visualDescription = "A compact dark-brown four-drawer dresser with a simple rectangular silhouette, warm wood-look frame, dark fabric drawer fronts, and slim black metal supports.",
            notes = "4-drawer compact dresser; price should be verified.",
        ),
    )
}
