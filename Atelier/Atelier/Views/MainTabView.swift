import SwiftUI

struct MainTabView: View {
    @Environment(AppFlow.self) private var flow

    var body: some View {
        @Bindable var flow = flow

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
    }
}
