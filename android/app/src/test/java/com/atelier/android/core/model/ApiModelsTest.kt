package com.atelier.android.core.model

import com.atelier.android.core.network.NetworkModule
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.decodeFromString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ApiModelsTest {
    @Test
    fun parsesAuthUserRoomsStylesRoomDetailAndRedesignDtos() {
        val auth = NetworkModule.json.decodeFromString<AuthResponseDto>(
            """{"token":"t","user":{"id":"u1","email":"a@example.com","name":"A"}}""",
        )
        assertEquals("t", auth.token)
        assertEquals("u1", auth.user.id)

        val rooms = NetworkModule.json.decodeFromString(
            ListSerializer(RoomDto.serializer()),
            """[{"id":"r1","name":"Living","originalImageUrl":"/api/uploads/u1/rooms/a.jpg","createdAt":"2026-06-14T12:00:00.000Z","redesignCount":2}]""",
        )
        assertEquals(2, rooms.single().redesignCount)

        val styles = NetworkModule.json.decodeFromString(
            ListSerializer(StyleDto.serializer()),
            """[{"id":"modern","name":"Modern","description":"Clean","icon":"square.grid.2x2"}]""",
        )
        assertEquals("modern", styles.single().id)

        val detail = NetworkModule.json.decodeFromString<RoomDetailResponseDto>(
            """
            {
              "room":{"id":"r1","name":"Living","originalImageUrl":"/api/uploads/u1/rooms/a.jpg","createdAt":"2026-06-14T12:00:00.000Z","redesignCount":1},
              "redesigns":[{"id":"d1","roomId":"r1","styleId":"modern","mimeType":"image/jpeg","resultImageUrl":"/api/uploads/u1/rooms/r1/redesigns/b.jpg","createdAt":"2026-06-14T12:01:00.000Z"}]
            }
            """.trimIndent(),
        )
        assertEquals(null, detail.redesigns.single().originalImageUrl)

        val redesigns = NetworkModule.json.decodeFromString(
            ListSerializer(RedesignDto.serializer()),
            """[{"id":"d1","roomId":"r1","styleId":"modern","mimeType":"image/jpeg","resultImageUrl":"/api/uploads/u1/result.jpg","originalImageUrl":"/api/uploads/u1/original.jpg","createdAt":"2026-06-14T12:01:00.000Z"}]""",
        )
        assertEquals("/api/uploads/u1/original.jpg", redesigns.single().originalImageUrl)
    }

    @Test
    fun redesignImageSelectionUsesBase64BeforeUrlThenMissing() {
        val withBase64 = RedesignDto(
            id = "d1",
            roomId = "r1",
            styleId = "modern",
            mimeType = "image/jpeg",
            resultImageUrl = "/api/uploads/fallback.jpg",
            imageBase64 = "abc",
            createdAt = "2026-06-14T12:01:00.000Z",
        )
        assertEquals(RedesignImageSource.Base64("abc", "image/jpeg"), withBase64.preferredImageSource())

        val withUrl = withBase64.copy(imageBase64 = null)
        assertEquals(RedesignImageSource.Url("/api/uploads/fallback.jpg"), withUrl.preferredImageSource())

        val missing = withBase64.copy(imageBase64 = "", resultImageUrl = "")
        assertTrue(missing.preferredImageSource() is RedesignImageSource.Missing)
    }

    @Test
    fun absoluteUrlKeepsRemoteUrlsAndResolvesProtectedUploadPaths() {
        assertEquals(
            "https://cdn.example.com/image.jpg",
            NetworkModule.absoluteUrl("http://10.0.2.2:3000", "https://cdn.example.com/image.jpg"),
        )
        assertEquals(
            "http://10.0.2.2:3000/api/uploads/u1/rooms/a.jpg",
            NetworkModule.absoluteUrl("http://10.0.2.2:3000/", "/api/uploads/u1/rooms/a.jpg"),
        )
    }
}
