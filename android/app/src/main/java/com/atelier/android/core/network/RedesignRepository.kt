package com.atelier.android.core.network

import com.atelier.android.core.model.CreateRedesignRequestDto
import com.atelier.android.core.model.RedesignDto

interface RedesignRepository {
    suspend fun redesigns(): List<RedesignDto>
    suspend fun createRedesign(body: CreateRedesignRequestDto): RedesignDto
}

class NetworkRedesignRepository(private val api: AtelierApi) : RedesignRepository {
    override suspend fun redesigns(): List<RedesignDto> = api.redesigns()
    override suspend fun createRedesign(body: CreateRedesignRequestDto): RedesignDto =
        api.createRedesign(body)
}
