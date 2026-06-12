import SwiftUI

struct StyleSelectionView: View {
    let roomImage: UIImage

    @State private var selectedStyle: DesignStyle?
    @State private var navigateToSummary = false

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)
    private let mutedText = Color(red: 0.525, green: 0.525, blue: 0.545)

    private let columns = [
        GridItem(.flexible(), spacing: 14),
        GridItem(.flexible(), spacing: 14),
    ]

    var body: some View {
        ZStack(alignment: .bottom) {
            AppBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    roomThumbnail

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Choose your style")
                            .font(.system(size: 28, weight: .semibold))
                            .tracking(-0.5)
                            .foregroundStyle(primaryText)

                        Text("Pick the mood you want for your redesign.")
                            .font(.system(size: 17))
                            .foregroundStyle(secondaryText)
                    }

                    LazyVGrid(columns: columns, spacing: 14) {
                        ForEach(DesignStyle.catalog) { style in
                            StyleCard(
                                style: style,
                                isSelected: selectedStyle == style
                            ) {
                                withAnimation(.easeOut(duration: 0.2)) {
                                    selectedStyle = style
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 16)
                .padding(.bottom, 120)
            }

            bottomBar
        }
        .navigationTitle("Style")
        .navigationBarTitleDisplayMode(.inline)
        .navigationDestination(isPresented: $navigateToSummary) {
            if let selectedStyle {
                RedesignSummaryView(roomImage: roomImage, style: selectedStyle)
            }
        }
    }

    private var roomThumbnail: some View {
        HStack(spacing: 14) {
            Image(uiImage: roomImage)
                .resizable()
                .scaledToFill()
                .frame(width: 64, height: 64)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text("Your room")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(primaryText)

                Text(selectedStyle?.name ?? "Select a style below")
                    .font(.system(size: 14))
                    .foregroundStyle(selectedStyle == nil ? mutedText : appleBlue)
            }

            Spacer()
        }
        .padding(14)
        .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(Color.black.opacity(0.06), lineWidth: 1)
        }
    }

    private var bottomBar: some View {
        VStack(spacing: 0) {
            Divider()
                .opacity(0.4)

            Button {
                navigateToSummary = true
            } label: {
                Text("Continue")
                    .font(.system(size: 15, weight: .medium))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.plain)
            .foregroundStyle(selectedStyle == nil ? mutedText : .white)
            .background(
                selectedStyle == nil ? Color.black.opacity(0.06) : appleBlue,
                in: Capsule()
            )
            .disabled(selectedStyle == nil)
            .padding(.horizontal, 24)
            .padding(.top, 12)
            .padding(.bottom, 12)
        }
        .background(.ultraThinMaterial)
    }
}

#Preview {
    NavigationStack {
        StyleSelectionView(roomImage: UIImage(systemName: "photo")!)
    }
}
