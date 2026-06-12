import SwiftUI

struct AppBackground: View {
    var body: some View {
        ZStack {
            Color(red: 0.984, green: 0.984, blue: 0.992)
                .ignoresSafeArea()

            LinearGradient(
                colors: [
                    .white,
                    Color(red: 0.961, green: 0.961, blue: 0.969),
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            .ignoresSafeArea()

            RadialGradient(
                colors: [
                    Color.black.opacity(0.04),
                    Color.clear,
                ],
                center: .top,
                startRadius: 0,
                endRadius: 420
            )
            .ignoresSafeArea()
        }
    }
}
