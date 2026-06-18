import SwiftUI

private enum StylePickMode: String, CaseIterable, Identifiable {
    case catalog
    case custom

    var id: String { rawValue }

    var label: String {
        switch self {
        case .catalog: return "Curated styles"
        case .custom: return "Describe yours"
        }
    }
}

struct StyleSelectionView: View {
    @Environment(AppFlow.self) private var flow

    @State private var pickMode: StylePickMode = .catalog
    @State private var selectedStyle: DesignStyle?
    @State private var customDescription = ""

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)
    private let mutedText = Color(red: 0.525, green: 0.525, blue: 0.545)

    private let columns = [
        GridItem(.flexible(), spacing: 14),
        GridItem(.flexible(), spacing: 14),
    ]

    private var trimmedCustomDescription: String {
        customDescription.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var canContinue: Bool {
        switch pickMode {
        case .catalog:
            return selectedStyle != nil
        case .custom:
            return trimmedCustomDescription.count >= 3
        }
    }

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

                        Text("Pick a curated mood or describe the feeling you want.")
                            .font(.system(size: 17))
                            .foregroundStyle(secondaryText)
                    }

                    Picker("Style input", selection: $pickMode) {
                        ForEach(StylePickMode.allCases) { mode in
                            Text(mode.label).tag(mode)
                        }
                    }
                    .pickerStyle(.segmented)

                    switch pickMode {
                    case .catalog:
                        catalogSection
                    case .custom:
                        customSection
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
        .onAppear {
            selectedStyle = nil
            customDescription = ""
            pickMode = .catalog
        }
        .onChange(of: pickMode) { _, newMode in
            if newMode == .catalog {
                customDescription = ""
            } else {
                selectedStyle = nil
            }
        }
    }

    private var catalogSection: some View {
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

    private var customSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("What do you want the room to feel like?")
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(primaryText)

            Text("Describe the mood, colors, materials, or vibe you have in mind.")
                .font(.system(size: 15))
                .foregroundStyle(secondaryText)

            TextField(
                "Warm earthy tones with plants, soft linen, and golden afternoon light",
                text: $customDescription,
                axis: .vertical
            )
            .lineLimit(4...8)
            .padding(14)
            .background(.white, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(Color.black.opacity(0.06), lineWidth: 1)
            }
        }
        .padding(16)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.black.opacity(0.06), lineWidth: 1)
        }
    }

    private var roomThumbnail: some View {
        HStack(spacing: 14) {
            if let roomImage = flow.roomImage {
                Image(uiImage: roomImage)
                    .resizable()
                    .scaledToFill()
                    .frame(width: 64, height: 64)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Your room")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(primaryText)

                Text(selectionPreview)
                    .font(.system(size: 14))
                    .foregroundStyle(canContinue ? appleBlue : mutedText)
                    .lineLimit(2)
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

    private var selectionPreview: String {
        switch pickMode {
        case .catalog:
            return selectedStyle?.name ?? "Select a style below"
        case .custom:
            if trimmedCustomDescription.isEmpty {
                return "Describe your ideal vibe"
            }
            return trimmedCustomDescription
        }
    }

    private var bottomBar: some View {
        VStack(spacing: 0) {
            Divider()
                .opacity(0.4)

            Button {
                switch pickMode {
                case .catalog:
                    if let selectedStyle {
                        flow.selectStyle(selectedStyle)
                    }
                case .custom:
                    flow.selectCustomStyle(trimmedCustomDescription)
                }
            } label: {
                Text("Continue")
                    .font(.system(size: 15, weight: .medium))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.plain)
            .foregroundStyle(canContinue ? .white : mutedText)
            .background(
                canContinue ? appleBlue : Color.black.opacity(0.06),
                in: Capsule()
            )
            .disabled(!canContinue)
            .padding(.horizontal, 24)
            .padding(.top, 12)
            .padding(.bottom, 12)
        }
        .background(.ultraThinMaterial)
    }
}

#Preview {
    let flow = AppFlow()
    flow.roomImage = UIImage(systemName: "photo")

    return NavigationStack {
        StyleSelectionView()
            .environment(flow)
    }
}
