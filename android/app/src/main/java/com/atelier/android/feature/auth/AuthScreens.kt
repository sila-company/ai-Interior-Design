package com.atelier.android.feature.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.atelier.android.core.design.AtelierColors
import com.atelier.android.core.design.AtelierShapes
import com.atelier.android.core.design.AtelierSpacing

@Composable
fun LandingScreen(
    onLogin: () -> Unit,
    onRegister: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Atelier", modifier = Modifier.fillMaxWidth(), style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(42.dp))
        Text(
            "AI Interior Design",
            color = AtelierColors.Muted,
            style = MaterialTheme.typography.labelMedium,
        )
        Text(
            "Your space,\nreimagined.",
            modifier = Modifier.padding(top = 18.dp),
            textAlign = TextAlign.Center,
            style = MaterialTheme.typography.displaySmall,
        )
        Text(
            "Create an account, save every room by name, and revisit your redesigns anytime.",
            modifier = Modifier.padding(top = 16.dp),
            textAlign = TextAlign.Center,
            color = AtelierColors.Muted,
            style = MaterialTheme.typography.bodyLarge,
        )
        Button(
            onClick = onRegister,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 32.dp),
            shape = CircleShape,
        ) {
            Text("Create account")
        }
        Button(
            onClick = onLogin,
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 12.dp),
            shape = CircleShape,
            colors = ButtonDefaults.buttonColors(
                containerColor = AtelierColors.Moss.copy(alpha = 0.10f),
                contentColor = AtelierColors.Moss,
            ),
        ) {
            Text("Sign in")
        }
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 48.dp)
                .aspectRatio(16f / 10f),
            shape = AtelierShapes.roundedSurface,
            color = AtelierColors.Surface,
            tonalElevation = 1.dp,
        ) {
            Box(contentAlignment = Alignment.Center) {
                Text("Living room - Bedroom - Office", color = AtelierColors.Muted)
            }
        }
    }
}

@Composable
fun LoginScreen(
    viewModel: LoginViewModel,
    onRegister: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AuthFormFrame(title = "Welcome back", subtitle = "Sign in to save rooms and redesigns.") {
        OutlinedTextField(
            value = state.email,
            onValueChange = viewModel::onEmailChanged,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            singleLine = true,
        )
        OutlinedTextField(
            value = state.password,
            onValueChange = viewModel::onPasswordChanged,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
        )
        ErrorText(state.errorMessage)
        Button(
            onClick = viewModel::submit,
            enabled = state.canSubmit,
            modifier = Modifier.fillMaxWidth(),
            shape = CircleShape,
        ) {
            Text(if (state.isSubmitting) "Please wait..." else "Sign in")
        }
        TextButton(onClick = onRegister, modifier = Modifier.fillMaxWidth()) {
            Text("Create an account")
        }
    }
}

@Composable
fun RegisterScreen(viewModel: RegisterViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AuthFormFrame(title = "Join Atelier", subtitle = "Save every room and redesign in one place.") {
        OutlinedTextField(
            value = state.name,
            onValueChange = viewModel::onNameChanged,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Name") },
            singleLine = true,
        )
        OutlinedTextField(
            value = state.email,
            onValueChange = viewModel::onEmailChanged,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Email") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            singleLine = true,
        )
        OutlinedTextField(
            value = state.password,
            onValueChange = viewModel::onPasswordChanged,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Password") },
            visualTransformation = PasswordVisualTransformation(),
            singleLine = true,
        )
        ErrorText(state.errorMessage)
        Button(
            onClick = viewModel::submit,
            enabled = state.canSubmit,
            modifier = Modifier.fillMaxWidth(),
            shape = CircleShape,
        ) {
            Text(if (state.isSubmitting) "Please wait..." else "Create account")
        }
    }
}

@Composable
private fun AuthFormFrame(
    title: String,
    subtitle: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(title, style = MaterialTheme.typography.headlineMedium)
        Text(subtitle, color = AtelierColors.Muted, style = MaterialTheme.typography.bodyLarge)
        Spacer(Modifier.height(8.dp))
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            content()
        }
    }
}

@Composable
private fun ErrorText(message: String?) {
    if (message != null) {
        Text(message, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
    }
}
