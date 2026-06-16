import SwiftUI

struct MainTabView: View {
    @Environment(AppFlow.self) private var flow
    @Environment(DashboardStore.self) private var dashboard
    @Environment(RedesignGenerationStore.self) private var generation

    var body: some View {
        @Bindable var flow = flow

        ZStack(alignment: .top) {
            TabView(selection: $flow.selectedTab) {
                HomeView()
                    .tabItem {
                        Label("Home", systemImage: "house.fill")
                    }
                    .tag(MainTab.home)

                RoomsView()
                    .tabItem {
                        Label("Rooms", systemImage: "square.grid.2x2.fill")
                    }
                    .tag(MainTab.rooms)

                AccountView()
                    .tabItem {
                        Label("Account", systemImage: "person.crop.circle.fill")
                    }
                    .tag(MainTab.account)
            }
            .tint(Color(red: 0, green: 0.443, blue: 0.890))

            if generation.showsFloatingBanner {
                GenerationStatusBanner()
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .zIndex(1)
                    .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .animation(.easeInOut(duration: 0.25), value: generation.showsFloatingBanner)
        .animation(.easeInOut(duration: 0.25), value: generation.status)
        .onChange(of: generation.status) { _, newStatus in
            if newStatus == .succeeded {
                Task { await dashboard.refresh() }
            }
        }
    }
}
