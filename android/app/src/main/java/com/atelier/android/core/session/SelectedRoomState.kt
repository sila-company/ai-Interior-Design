package com.atelier.android.core.session

import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.model.RoomDto
import com.atelier.android.core.model.ShoppableProduct
import com.atelier.android.core.model.StyleDto

data class SelectedRoomState(
    val room: RoomDto? = null,
    val localImageUri: String? = null,
    val selectedStyle: StyleDto? = null,
    val customStyleDescription: String? = null,
    val selectedProducts: List<ShoppableProduct> = emptyList(),
    val redesign: RedesignDto? = null,
) {
    val hasStyleChoice: Boolean
        get() = selectedStyle != null || !customStyleDescription.isNullOrBlank()
}
