package com.atelier.android.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.CompareArrows
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.atelier.android.core.design.AtelierColors
import com.atelier.android.core.design.AtelierShapes

@Composable
fun BeforeAfterCompareView(
    beforeModel: Any?,
    afterModel: Any?,
    modifier: Modifier = Modifier,
) {
    var sliderPosition by remember { mutableFloatStateOf(0.5f) }

    BoxWithConstraints(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(4f / 3f)
            .shadow(24.dp, AtelierShapes.cardXLarge, clip = false, ambientColor = Color.Black.copy(0.08f))
            .clip(AtelierShapes.cardXLarge)
            .background(AtelierColors.SurfaceGray),
    ) {
        val dividerOffset = maxWidth * sliderPosition

        Box(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectDragGestures { change, _ ->
                        change.consume()
                        val position = change.position.x / size.width
                        sliderPosition = position.coerceIn(0.05f, 0.95f)
                    }
                },
        ) {
            AsyncImage(
                model = afterModel,
                contentDescription = "After redesign",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop,
            )

            AsyncImage(
                model = beforeModel,
                contentDescription = "Before redesign",
                modifier = Modifier
                    .fillMaxSize()
                    .drawWithContent {
                        val dividerX = size.width * sliderPosition
                        clipRect(right = dividerX) {
                            this@drawWithContent.drawContent()
                        }
                    },
                contentScale = ContentScale.Crop,
            )

            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .width(2.dp)
                    .offset(x = dividerOffset - 1.dp)
                    .background(Color.White.copy(alpha = 0.95f)),
            )

            Surface(
                modifier = Modifier
                    .size(36.dp)
                    .align(Alignment.CenterStart)
                    .offset(x = dividerOffset - 18.dp),
                shape = CircleShape,
                color = Color.White,
                shadowElevation = 8.dp,
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Rounded.CompareArrows,
                        contentDescription = "Compare",
                        tint = AtelierColors.Ink,
                        modifier = Modifier.size(18.dp),
                    )
                }
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(12.dp),
            ) {
                CompareLabel("Before")
                Box(modifier = Modifier.weight(1f))
                CompareLabel("After")
            }
        }
    }
}

@Composable
private fun CompareLabel(text: String) {
    Text(
        text = text.uppercase(),
        color = Color.White,
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        letterSpacing = 1.sp,
        modifier = Modifier
            .background(Color.Black.copy(alpha = 0.45f), CircleShape)
            .padding(horizontal = 10.dp, vertical = 5.dp),
    )
}
