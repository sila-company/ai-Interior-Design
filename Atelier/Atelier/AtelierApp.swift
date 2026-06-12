import SwiftUI

@main
struct AtelierApp: App {
    @State private var flow = AppFlow()

    var body: some Scene {
        WindowGroup {
            @Bindable var flow = flow

            NavigationStack(path: $flow.path) {
                LandingView()
                    .navigationDestination(for: AppRoute.self) { route in
                        switch route {
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
            .environment(flow)
        }
    }
}
