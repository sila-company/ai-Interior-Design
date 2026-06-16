package com.atelier.android.feature.shell

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.atelier.android.AppContainer
import com.atelier.android.core.session.AppDestination
import com.atelier.android.core.session.SessionState
import com.atelier.android.feature.auth.LandingScreen
import com.atelier.android.feature.auth.LoginScreen
import com.atelier.android.feature.auth.LoginViewModel
import com.atelier.android.feature.auth.RegisterScreen
import com.atelier.android.feature.auth.RegisterViewModel
import com.atelier.android.feature.rooms.AddRoomScreen
import com.atelier.android.feature.rooms.AddRoomViewModel
import com.atelier.android.feature.rooms.RoomsScreen
import com.atelier.android.feature.rooms.RoomsViewModel
import com.atelier.android.feature.styles.StyleSelectionScreen
import com.atelier.android.feature.styles.StyleSelectionViewModel
import com.atelier.android.feature.styles.SummaryPlaceholderScreen

@Composable
fun AtelierShell(
    container: AppContainer,
    shellViewModel: ShellViewModel,
    navController: NavHostController = rememberNavController(),
) {
    val sessionState by shellViewModel.sessionState.collectAsStateWithLifecycle()
    val selectedRoomState by shellViewModel.selectedRoomState.collectAsStateWithLifecycle()

    LaunchedEffect(sessionState) {
        val destination = when (sessionState) {
            SessionState.Loading -> AppDestination.Splash
            SessionState.Unauthenticated -> AppDestination.Landing
            is SessionState.Authenticated -> AppDestination.Rooms
        }
        navController.navigate(destination.route) {
            popUpTo(navController.graph.startDestinationId) { inclusive = true }
            launchSingleTop = true
        }
    }

    NavHost(
        navController = navController,
        startDestination = AppDestination.Splash.route,
        modifier = Modifier.fillMaxSize(),
    ) {
        composable(AppDestination.Splash.route) {
            SplashScreen()
        }
        composable(AppDestination.Landing.route) {
            LandingScreen(
                onLogin = { navController.navigate(AppDestination.Login.route) },
                onRegister = { navController.navigate(AppDestination.Register.route) },
            )
        }
        composable(AppDestination.Login.route) {
            val loginViewModel: LoginViewModel = viewModel(
                factory = LoginViewModel.Factory(container.authRepository) { user ->
                    shellViewModel.setAuthenticated(user)
                },
            )
            LoginScreen(
                viewModel = loginViewModel,
                onRegister = { navController.navigate(AppDestination.Register.route) },
            )
        }
        composable(AppDestination.Register.route) {
            val registerViewModel: RegisterViewModel = viewModel(
                factory = RegisterViewModel.Factory(container.authRepository) { user ->
                    shellViewModel.setAuthenticated(user)
                },
            )
            RegisterScreen(registerViewModel)
        }
        composable(AppDestination.Rooms.route) {
            val user = (sessionState as? SessionState.Authenticated)?.user
            val roomsViewModel: RoomsViewModel = viewModel(
                factory = RoomsViewModel.Factory(
                    roomsRepository = container.roomsRepository,
                    authRepository = container.authRepository,
                    onLoggedOut = { shellViewModel.setUnauthenticated() },
                ),
            )
            RoomsScreen(
                userName = user?.name.orEmpty(),
                viewModel = roomsViewModel,
                onAddRoom = { navController.navigate(AppDestination.AddRoom.route) },
                onRoomSelected = { room ->
                    shellViewModel.selectRoom(room)
                    navController.navigate(AppDestination.StyleSelection.route)
                },
            )
        }
        composable(AppDestination.AddRoom.route) {
            val addRoomViewModel: AddRoomViewModel = viewModel(
                factory = AddRoomViewModel.Factory(
                    roomsRepository = container.roomsRepository,
                    contentResolver = container.context.contentResolver,
                    onRoomCreated = { room, uri ->
                        shellViewModel.selectRoom(room, uri?.toString())
                        navController.navigate(AppDestination.StyleSelection.route) {
                            popUpTo(AppDestination.Rooms.route)
                        }
                    },
                ),
            )
            AddRoomScreen(addRoomViewModel)
        }
        composable(AppDestination.StyleSelection.route) {
            val styleSelectionViewModel: StyleSelectionViewModel = viewModel(
                factory = StyleSelectionViewModel.Factory(container.stylesRepository),
            )
            StyleSelectionScreen(
                selectedRoomState = selectedRoomState,
                viewModel = styleSelectionViewModel,
                onContinue = { style ->
                    shellViewModel.selectStyle(style)
                    navController.navigate(AppDestination.Summary.route)
                },
            )
        }
        composable(AppDestination.Summary.route) {
            SummaryPlaceholderScreen(selectedRoomState = selectedRoomState)
        }
    }
}

@Composable
private fun SplashScreen() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        CircularProgressIndicator()
    }
}
