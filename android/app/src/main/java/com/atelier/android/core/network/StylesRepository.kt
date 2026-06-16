package com.atelier.android.core.network

import com.atelier.android.core.model.StyleDto

interface StylesRepository {
    suspend fun styles(): List<StyleDto>
}

class NetworkStylesRepository(private val api: AtelierApi) : StylesRepository {
    override suspend fun styles(): List<StyleDto> = api.styles()
}
