package com.atelier.android.core.network

import com.atelier.android.core.model.AuthRequestDto
import com.atelier.android.core.model.AuthResponseDto
import com.atelier.android.core.model.CreateRedesignRequestDto
import com.atelier.android.core.model.MeResponseDto
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.model.RoomDetailResponseDto
import com.atelier.android.core.model.RoomDto
import com.atelier.android.core.model.StyleDto
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

interface AtelierApi {
    @POST("api/auth/register")
    suspend fun register(@Body body: AuthRequestDto): AuthResponseDto

    @POST("api/auth/login")
    suspend fun login(@Body body: AuthRequestDto): AuthResponseDto

    @POST("api/auth/logout")
    suspend fun logout(): Response<Unit>

    @GET("api/auth/me")
    suspend fun me(): MeResponseDto

    @GET("api/styles")
    suspend fun styles(): List<StyleDto>

    @GET("api/rooms")
    suspend fun rooms(): List<RoomDto>

    @GET("api/rooms/{roomId}")
    suspend fun roomDetail(@Path("roomId") roomId: String): RoomDetailResponseDto

    @Multipart
    @POST("api/rooms")
    suspend fun createRoom(
        @Part("name") name: RequestBody,
        @Part image: MultipartBody.Part,
    ): RoomDto

    @GET("api/redesigns")
    suspend fun redesigns(): List<RedesignDto>

    @POST("api/redesigns")
    suspend fun createRedesign(@Body body: CreateRedesignRequestDto): RedesignDto
}
