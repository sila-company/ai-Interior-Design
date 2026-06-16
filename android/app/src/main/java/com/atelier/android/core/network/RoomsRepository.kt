package com.atelier.android.core.network

import com.atelier.android.core.model.RoomDetailResponseDto
import com.atelier.android.core.model.RoomDto
import okhttp3.MultipartBody
import okhttp3.RequestBody

interface RoomsRepository {
    suspend fun listRooms(): List<RoomDto>
    suspend fun roomDetail(roomId: String): RoomDetailResponseDto
    suspend fun createRoom(name: RequestBody, image: MultipartBody.Part): RoomDto
}

class NetworkRoomsRepository(private val api: AtelierApi) : RoomsRepository {
    override suspend fun listRooms(): List<RoomDto> = api.rooms()
    override suspend fun roomDetail(roomId: String): RoomDetailResponseDto = api.roomDetail(roomId)
    override suspend fun createRoom(name: RequestBody, image: MultipartBody.Part): RoomDto =
        api.createRoom(name, image)
}
