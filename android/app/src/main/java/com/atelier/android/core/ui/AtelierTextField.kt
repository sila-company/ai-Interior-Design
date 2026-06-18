package com.atelier.android.core.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.atelier.android.core.design.AtelierColors
import com.atelier.android.core.design.AtelierShapes

@Composable
fun AtelierTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    isPassword: Boolean = false,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
) {
    BasicTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier
            .fillMaxWidth()
            .background(AtelierColors.Surface, AtelierShapes.textField),
        textStyle = androidx.compose.ui.text.TextStyle(
            color = AtelierColors.Ink,
            fontSize = 16.sp,
        ),
        cursorBrush = SolidColor(AtelierColors.AppleBlue),
        visualTransformation = if (isPassword) PasswordVisualTransformation() else VisualTransformation.None,
        keyboardOptions = keyboardOptions,
        singleLine = true,
        decorationBox = { innerTextField ->
            androidx.compose.foundation.layout.Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(AtelierColors.Surface, AtelierShapes.textField)
                    .padding(horizontal = 16.dp, vertical = 16.dp),
            ) {
                if (value.isEmpty()) {
                    Text(placeholder, color = AtelierColors.MutedLight)
                }
                innerTextField()
            }
        },
    )
}
