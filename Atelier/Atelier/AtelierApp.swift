import SwiftUI

@main
struct AtelierApp: App {
    @State private var flow = AppFlow()
    @State private var auth = AuthManager()
    @State private var dashboard = DashboardStore()
    @State private var generation = RedesignGenerationStore()

    var body: some Scene {
        WindowGroup {
            @Bindable var flow = flow
            @Bindable var auth = auth

            Group {
                if auth.isLoading {
                    ZStack {
                        AppBackground()
                        ProgressView()
                    }
                } else {
                    NavigationStack(path: $flow.path) {
                        Group {
                            if auth.isAuthenticated {
                                MainTabView()
                            } else {
                                LandingView()
                            }
                        }
                        .navigationDestination(for: AppRoute.self) { route in
                            switch route {
                            case .login:
                                AuthLoginView()
                            case .register:
                                AuthRegisterView()
                            case .rooms:
                                MainTabView()
                                    .onAppear { flow.selectedTab = .rooms }
                            case .addRoom:
                                AddRoomView()
                                    .hidesTabBarWhenPushed()
                            case .roomDetail:
                                RoomDetailView()
                                    .hidesTabBarWhenPushed()
                            case .styleSelection:
                                StyleSelectionView()
                                    .hidesTabBarWhenPushed()
                            case .summary:
                                RedesignSummaryView()
                                    .hidesTabBarWhenPushed()
                            case .generating:
                                GeneratingView()
                                    .hidesTabBarWhenPushed()
                            case .results:
                                ResultsView()
                                    .hidesTabBarWhenPushed()
                            }
                        }
                    }
                }
            }
            .environment(flow)
            .environment(auth)
            .environment(dashboard)
            .environment(generation)
            .onChange(of: auth.isAuthenticated) { _, isAuthenticated in
                if !isAuthenticated {
                    generation.reset()
                    flow.room = nil
                    flow.roomImage = nil
                    flow.selectedStyle = nil
                    flow.customStyleDescription = nil
                    flow.selectedProducts = []
                    flow.redesignedImage = nil
                    flow.path = NavigationPath()
                    flow.selectedTab = .home
                }
            }
            .onChange(of: flow.path.count) { _, count in
                if count == 0 {
                    Task { await dashboard.refresh() }
                }
            }
        }
    }
}

private extension View {
    func hidesTabBarWhenPushed() -> some View {
        toolbar(.hidden, for: .tabBar)
    }
}
