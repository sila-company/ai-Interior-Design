package com.atelier.android.core.ui

import android.util.Base64
import androidx.compose.foundation.layout.Box
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import coil.compose.AsyncImage
import com.atelier.android.BuildConfig
import com.atelier.android.core.model.RedesignDto
import com.atelier.android.core.model.RedesignImageSource
import com.atelier.android.core.model.preferredImageSource
import com.atelier.android.core.network.NetworkModule

@Composable
fun RedesignImage(
    redesign: RedesignDto,
    contentDescription: String?,
    modifier: Modifier = Modifier,
    baseUrl: String = BuildConfig.BASE_URL,
) {
    when (val source = redesign.preferredImageSource()) {
        is RedesignImageSource.Base64 -> {
            val bytes = remember(source.value) {
                Base64.decode(source.value, Base64.DEFAULT)
            }
            AsyncImage(model = bytes, contentDescription = contentDescription, modifier = modifier)
        }
        is RedesignImageSource.Url -> {
            AsyncImage(
                model = NetworkModule.absoluteUrl(baseUrl, source.value),
                contentDescription = contentDescription,
                modifier = modifier,
            )
        }
        RedesignImageSource.Missing -> Box(modifier = modifier)
    }
}
