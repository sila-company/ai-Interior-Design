package com.atelier.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.CompositionLocalProvider
import coil.compose.LocalImageLoader
import com.atelier.android.core.design.AtelierTheme
import com.atelier.android.feature.shell.AtelierShell
import com.atelier.android.feature.shell.ShellViewModel

class MainActivity : ComponentActivity() {
    private val container: AppContainer
        get() = (application as AtelierApplication).container

    private val viewModel: ShellViewModel by viewModels {
        ShellViewModel.Factory(container.authRepository, container.sessionEvents)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            CompositionLocalProvider(LocalImageLoader provides container.imageLoader) {
                AtelierTheme {
                    AtelierShell(container = container, shellViewModel = viewModel)
                }
            }
        }
    }
}
