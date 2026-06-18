package com.atelier.android.feature.auth

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.atelier.android.core.design.AppBackground
import com.atelier.android.core.design.AtelierColors
import com.atelier.android.core.design.AtelierShapes
import com.atelier.android.core.ui.AtelierTextField
import com.atelier.android.core.ui.PrimaryCapsuleButton
import com.atelier.android.core.ui.SecondaryCapsuleButton
import com.atelier.android.core.ui.SignOutCapsuleButton
import com.atelier.android.core.ui.TextLinkButton

@Composable
fun LandingScreen(
    onLogin: () -> Unit,
    onRegister: () -> Unit,
) {
    var appeared by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { appeared = true }

    val headerAlpha by animateFloatAsState(if (appeared) 1f else 0f, tween(700), label = "header")
    val heroAlpha by animateFloatAsState(if (appeared) 1f else 0f, tween(700, delayMillis = 80), label = "hero")
    val cardAlpha by animateFloatAsState(if (appeared) 1f else 0f, tween(700, delayMillis = 240), label = "card")

    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp)
                .padding(bottom = 40.dp),
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .alpha(headerAlpha)
                    .padding(top = 8.dp, bottom = 32.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    "Atelier",
                    fontSize = 17.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = (-0.3).sp,
                    color = AtelierColors.Ink,
                )
                Spacer(Modifier.weight(1f))
                SignOutCapsuleButton(text = "Sign in", onClick = onLogin)
            }

            Column(
                modifier = Modifier.alpha(heroAlpha),
                horizontalAlignment = Alignment.CenterHorizontally,
            ) {
                Text(
                    "AI INTERIOR DESIGN",
                    style = MaterialTheme.typography.labelMedium,
                    color = AtelierColors.MutedLight,
                    letterSpacing = 2.8.sp,
                )
                Text(
                    "Your space,\nreimagined.",
                    modifier = Modifier.padding(top = 20.dp),
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.displaySmall,
                )
                Text(
                    "Create an account, save every room by name, and revisit your redesigns anytime.",
                    modifier = Modifier.padding(top = 16.dp, start = 8.dp, end = 8.dp),
                    textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodyLarge,
                    lineHeight = 24.sp,
                )
                PrimaryCapsuleButton(
                    text = "Create account",
                    onClick = onRegister,
                    modifier = Modifier.padding(top = 32.dp),
                )
                SecondaryCapsuleButton(
                    text = "Sign in",
                    onClick = onLogin,
                    modifier = Modifier.padding(top = 12.dp),
                )
                Spacer(Modifier.height(48.dp))
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .alpha(cardAlpha)
                    .aspectRatio(16f / 10f)
                    .shadow(40.dp, AtelierShapes.previewCard, clip = false, ambientColor = Color.Black.copy(0.08f))
                    .clip(AtelierShapes.previewCard)
                    .background(
                        Brush.linearGradient(
                            colors = listOf(AtelierColors.SurfaceGray, AtelierColors.SurfaceMid),
                        ),
                    )
                    .background(AtelierColors.Surface, AtelierShapes.previewCard)
                    .clip(AtelierShapes.previewCard),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Icon(
                        imageVector = Icons.Rounded.Home,
                        contentDescription = null,
                        tint = AtelierColors.MutedLight,
                        modifier = Modifier.height(28.dp),
                    )
                    Text("Living room - Bedroom - Office", color = AtelierColors.MutedLight, fontSize = 15.sp)
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    viewModel: LoginViewModel,
    onRegister: () -> Unit,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AuthScaffold(title = "Sign in") {
        AuthFormFrame(title = "Welcome back", subtitle = "Sign in to save rooms and redesigns.") {
            AtelierTextField(state.email, viewModel::onEmailChanged, "Email")
            AtelierTextField(state.password, viewModel::onPasswordChanged, "Password", isPassword = true)
            ErrorText(state.errorMessage)
            PrimaryCapsuleButton(
                text = if (state.isSubmitting) "Please wait..." else "Sign in",
                onClick = viewModel::submit,
                enabled = state.canSubmit,
                isLoading = state.isSubmitting,
            )
            TextLinkButton("Create an account", onRegister)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(viewModel: RegisterViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AuthScaffold(title = "Create account") {
        AuthFormFrame(title = "Join Atelier", subtitle = "Save every room and redesign in one place.") {
            AtelierTextField(state.name, viewModel::onNameChanged, "Name")
            AtelierTextField(state.email, viewModel::onEmailChanged, "Email")
            AtelierTextField(state.password, viewModel::onPasswordChanged, "Password", isPassword = true)
            ErrorText(state.errorMessage)
            PrimaryCapsuleButton(
                text = if (state.isSubmitting) "Please wait..." else "Create account",
                onClick = viewModel::submit,
                enabled = state.canSubmit,
                isLoading = state.isSubmitting,
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AuthScaffold(
    title: String,
    content: @Composable () -> Unit,
) {
    Box(Modifier.fillMaxSize()) {
        AppBackground()
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = { Text(title, maxLines = 1, overflow = TextOverflow.Ellipsis) },
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent),
                )
            },
        ) { padding ->
            Box(Modifier.padding(padding)) {
                content()
            }
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
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp),
    ) {
        Text(title, style = MaterialTheme.typography.headlineMedium)
        Text(subtitle, style = MaterialTheme.typography.bodyLarge)
        Column(verticalArrangement = Arrangement.spacedBy(16.dp), content = content)
    }
}

@Composable
private fun ErrorText(message: String?) {
    if (message != null) {
        Text(message, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
    }
}
