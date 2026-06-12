import SwiftUI

struct RedesignSummaryView: View {
    @Environment(AppFlow.self) private var flow

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                Text("Ready to redesign")
                    .font(.system(size: 28, weight: .semibold))
                    .tracking(-0.5)
                    .foregroundStyle(primaryText)

                if let style = flow.selectedStyle {
                    Text("We'll send your room photo to OpenAI and generate a \(style.name.lowercased()) redesign.")
                        .font(.system(size: 17))
                        .foregroundStyle(secondaryText)
                        .lineSpacing(3)
                }

                if let roomImage = flow.roomImage {
                    summaryCard(
                        title: "Your room",
                        content: {
                            Image(uiImage: roomImage)
                                .resizable()
                                .scaledToFill()
                                .frame(height: 180)
                                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        }
                    )
                }

                if let style = flow.selectedStyle {
                    summaryCard(
                        title: "Style",
                        content: {
                            HStack(spacing: 14) {
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .fill(
                                        LinearGradient(
                                            colors: style.gradient,
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        )
                                    )
                                    .frame(width: 56, height: 56)
                                    .overlay {
                                        Image(systemName: style.icon)
                                            .font(.system(size: 22, weight: .light))
                                            .foregroundStyle(primaryText.opacity(0.6))
                                    }

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(style.name)
                                        .font(.system(size: 17, weight: .semibold))
                                        .foregroundStyle(primaryText)

                                    Text(style.description)
                                        .font(.system(size: 14))
                                        .foregroundStyle(secondaryText)
                                        .fixedSize(horizontal: false, vertical: true)
                                }
                            }
                        }
                    )
                }

                Button {
                    flow.beginGeneration()
                } label: {
                    Text("Generate redesign")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(appleBlue, in: Capsule())
                .padding(.top, 8)
            }
            .padding(24)
        }
        .background(AppBackground())
        .navigationTitle("Summary")
        .navigationBarTitleDisplayMode(.inline)
    }

    @ViewBuilder
    private func summaryCard<Content: View>(
        title: String,
        @ViewBuilder content: () -> Content
    ) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 13, weight: .medium))
                .textCase(.uppercase)
                .tracking(1.2)
                .foregroundStyle(secondaryText)

            content()
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.black.opacity(0.06), lineWidth: 1)
        }
        .shadow(color: .black.opacity(0.05), radius: 12, y: 6)
    }
}

#Preview {
    let flow = AppFlow()
    flow.roomImage = UIImage(systemName: "photo")
    flow.selectedStyle = .catalog[0]

    return NavigationStack {
        RedesignSummaryView()
            .environment(flow)
    }
}
