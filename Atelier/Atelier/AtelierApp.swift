import SwiftUI

@main
struct AtelierApp: App {
    @State private var flow = AppFlow()
    @State private var auth = AuthManager()

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
                                RoomsView()
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
                                RoomsView()
                            case .addRoom:
                                AddRoomView()
                            case .roomDetail:
                                RoomDetailView()
                            case .styleSelection:
                                StyleSelectionView()
                            case .summary:
                                RedesignSummaryView()
                            case .generating:
                                GeneratingView()
                            case .results:
                                ResultsView()
                            }
                        }
                    }
                }
            }
            .environment(flow)
            .environment(auth)
            .onChange(of: auth.isAuthenticated) { _, isAuthenticated in
                if !isAuthenticated {
                    flow.room = nil
                    flow.roomImage = nil
                    flow.selectedStyle = nil
                    flow.redesignedImage = nil
                    flow.path = NavigationPath()
                }
            }
        }
    }
}
