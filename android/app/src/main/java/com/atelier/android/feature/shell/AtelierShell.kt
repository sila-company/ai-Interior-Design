package com.atelier.android.feature.shell

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.atelier.android.AppContainer
import com.atelier.android.core.design.AppBackground
import com.atelier.android.core.design.AtelierColors
import com.atelier.android.core.session.AppDestination
import com.atelier.android.core.session.SessionState
import com.atelier.android.feature.auth.LandingScreen
import com.atelier.android.feature.auth.LoginScreen
import com.atelier.android.feature.auth.LoginViewModel
import com.atelier.android.feature.auth.RegisterScreen
import com.atelier.android.feature.auth.RegisterViewModel
import com.atelier.android.feature.rooms.AccountScreen
import com.atelier.android.feature.rooms.AddRoomScreen
import com.atelier.android.feature.rooms.AddRoomViewModel
import com.atelier.android.feature.rooms.HomeDashboardScreen
import com.atelier.android.feature.rooms.RoomDetailScreen
import com.atelier.android.feature.rooms.RoomDetailViewModel
import com.atelier.android.feature.rooms.RoomsLibraryScreen
import com.atelier.android.feature.rooms.RoomsViewModel
import com.atelier.android.feature.redesign.GeneratingScreen
import com.atelier.android.feature.redesign.GeneratingViewModel
import com.atelier.android.feature.redesign.ResultsScreen
import com.atelier.android.feature.redesign.SummaryScreen
import com.atelier.android.feature.styles.StyleSelectionScreen
import com.atelier.android.feature.styles.StyleSelectionViewModel

@Composable
fun AtelierShell(
    container: AppContainer,
    shellViewModel: ShellViewModel,
    navController: NavHostController = rememberNavController(),
) {
    val sessionState by shellViewModel.sessionState.collectAsStateWithLifecycle()
    val selectedRoomState by shellViewModel.selectedRoomState.collectAsStateWithLifecycle()
    var selectedMainTab by rememberSaveable { mutableStateOf(MainTab.Home) }

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
                    redesignRepository = container.redesignRepository,
                    authRepository = container.authRepository,
                    onLoggedOut = { shellViewModel.setUnauthenticated() },
                ),
            )
            AuthenticatedMainTabs(
                selectedTab = selectedMainTab,
                onTabSelected = { selectedMainTab = it },
                home = {
                    HomeDashboardScreen(
                        userName = user?.name.orEmpty(),
                        viewModel = roomsViewModel,
                        onAddRoom = { navController.navigate(AppDestination.AddRoom.route) },
                        onBrowseRooms = { selectedMainTab = MainTab.Rooms },
                        onRecentRedesignSelected = { room, redesign ->
                            shellViewModel.openRoom(room)
                            shellViewModel.viewSavedRedesign(redesign, redesign.styleId)
                            navController.navigate(AppDestination.Results.route)
                        },
                    )
                },
                rooms = {
                    RoomsLibraryScreen(
                        viewModel = roomsViewModel,
                        onAddRoom = { navController.navigate(AppDestination.AddRoom.route) },
                        onRoomSelected = { room ->
                            shellViewModel.openRoom(room)
                            navController.navigate(AppDestination.RoomDetail.route)
                        },
                    )
                },
                account = {
                    AccountScreen(
                        userName = user?.name.orEmpty(),
                        userEmail = user?.email.orEmpty(),
                        viewModel = roomsViewModel,
                        onSignOut = { shellViewModel.logout() },
                    )
                },
            )
        }
        composable(AppDestination.AddRoom.route) {
            val addRoomViewModel: AddRoomViewModel = viewModel(
                factory = AddRoomViewModel.Factory(
                    roomsRepository = container.roomsRepository,
                    contentResolver = container.context.contentResolver,
                    onRoomCreated = { room, uri ->
                        shellViewModel.beginWithRoom(room, uri?.toString())
                        navController.navigate(AppDestination.StyleSelection.route) {
                            popUpTo(AppDestination.Rooms.route)
                        }
                    },
                ),
            )
            AddRoomScreen(addRoomViewModel)
        }
        composable(AppDestination.RoomDetail.route) {
            val roomId = selectedRoomState.room?.id ?: return@composable
            val roomDetailViewModel: RoomDetailViewModel = viewModel(
                factory = RoomDetailViewModel.Factory(container.roomsRepository, roomId),
            )
            RoomDetailScreen(
                selectedRoomState = selectedRoomState,
                viewModel = roomDetailViewModel,
                onCreateRedesign = {
                    shellViewModel.beginNewRedesign()
                    navController.navigate(AppDestination.StyleSelection.route)
                },
                onRedesignSelected = { redesign ->
                    shellViewModel.viewSavedRedesign(redesign, redesign.styleId)
                    navController.navigate(AppDestination.Results.route)
                },
            )
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
                onCustomContinue = { description ->
                    shellViewModel.selectCustomStyle(description)
                    navController.navigate(AppDestination.Summary.route)
                },
            )
        }
        composable(AppDestination.Summary.route) {
            SummaryScreen(
                selectedRoomState = selectedRoomState,
                onGenerate = { navController.navigate(AppDestination.Generating.route) },
            )
        }
        composable(AppDestination.Generating.route) {
            val generatingViewModel: GeneratingViewModel = viewModel(
                factory = GeneratingViewModel.Factory(container.redesignRepository),
            )
            GeneratingScreen(
                selectedRoomState = selectedRoomState,
                viewModel = generatingViewModel,
                onComplete = { redesign ->
                    shellViewModel.completeGeneration(redesign)
                    navController.navigate(AppDestination.Results.route) {
                        popUpTo(AppDestination.Generating.route) { inclusive = true }
                    }
                },
            )
        }
        composable(AppDestination.Results.route) {
            ResultsScreen(
                selectedRoomState = selectedRoomState,
                onBackToHome = {
                    shellViewModel.startOver()
                    selectedMainTab = MainTab.Home
                    navController.navigate(AppDestination.Rooms.route) {
                        popUpTo(AppDestination.Rooms.route) { inclusive = false }
                    }
                },
                onTryAnotherStyle = {
                    shellViewModel.beginNewRedesign()
                    navController.navigate(AppDestination.RoomDetail.route) {
                        popUpTo(AppDestination.Rooms.route)
                    }
                    navController.navigate(AppDestination.StyleSelection.route)
                },
            )
        }
    }
}

private enum class MainTab(
    val label: String,
    val icon: ImageVector,
) {
    Home("Home", Icons.Rounded.Home),
    Rooms("Rooms", Icons.Rounded.GridView),
    Account("Account", Icons.Rounded.Person),
}

@Composable
private fun AuthenticatedMainTabs(
    selectedTab: MainTab,
    onTabSelected: (MainTab) -> Unit,
    home: @Composable () -> Unit,
    rooms: @Composable () -> Unit,
    account: @Composable () -> Unit,
) {
    Box(Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 96.dp),
        ) {
            when (selectedTab) {
                MainTab.Home -> home()
                MainTab.Rooms -> rooms()
                MainTab.Account -> account()
            }
        }

        FloatingTabIsland(
            selectedTab = selectedTab,
            onTabSelected = onTabSelected,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .navigationBarsPadding()
                .padding(bottom = 12.dp),
        )
    }
}

@Composable
private fun FloatingTabIsland(
    selectedTab: MainTab,
    onTabSelected: (MainTab) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .width(292.dp)
            .height(66.dp)
            .clip(androidx.compose.foundation.shape.CircleShape)
            .background(Color.White)
            .padding(4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        MainTab.entries.forEach { tab ->
            FloatingTabItem(
                tab = tab,
                selected = selectedTab == tab,
                onClick = { onTabSelected(tab) },
                modifier = Modifier.weight(1f),
            )
        }
    }
}

@Composable
private fun FloatingTabItem(
    tab: MainTab,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val color = if (selected) AtelierColors.AppleBlue else AtelierColors.Ink
    Column(
        modifier = modifier
            .height(58.dp)
            .clip(androidx.compose.foundation.shape.CircleShape)
            .background(if (selected) AtelierColors.SurfaceGray else Color.Transparent)
            .clickable(onClick = onClick)
            .padding(top = 8.dp, bottom = 6.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(
            imageVector = tab.icon,
            contentDescription = tab.label,
            tint = color,
            modifier = Modifier.size(26.dp),
        )
        Text(
            text = tab.label,
            color = color,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            lineHeight = 12.sp,
        )
    }
}

@Composable
private fun SplashScreen() {
    Box(modifier = Modifier.fillMaxSize()) {
        AppBackground()
        CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
    }
}
