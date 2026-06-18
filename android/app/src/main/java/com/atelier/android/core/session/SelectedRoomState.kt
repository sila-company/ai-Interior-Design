package com.atelier.android.core.session

import com.atelier.android.core.model.RoomDto
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.model.StyleDto

data class SelectedRoomState(
    val room: RoomDto? = null,
    val localImageUri: String? = null,
    val selectedStyle: StyleDto? = null,
    val redesign: RedesignDto? = null,
)
