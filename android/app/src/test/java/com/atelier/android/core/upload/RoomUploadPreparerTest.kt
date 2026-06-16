package com.atelier.android.core.upload

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class RoomUploadPreparerTest {
    @Test
    fun validatesMissingNameAndImage() {
        assertEquals("Room name is required.", RoomUploadPreparer.validate("", byteArrayOf(1)))
        assertEquals("Room photo is required.", RoomUploadPreparer.validate("Living", null))
        assertEquals("Room photo is invalid.", RoomUploadPreparer.validate("Living", byteArrayOf()))
        assertNull(RoomUploadPreparer.validate("Living", byteArrayOf(1, 2, 3)))
    }

    @Test
    fun buildsMultipartRoomUploadRequestParts() {
        val name = RoomUploadPreparer.nameBody(" Living ")
        val image = RoomUploadPreparer.imagePart(byteArrayOf(1, 2, 3), "room.jpg")

        assertEquals(6L, name.contentLength())
        assertNotNull(image.body)
        assertEquals("form-data; name=\"image\"; filename=\"room.jpg\"", image.headers?.get("Content-Disposition"))
    }
}
