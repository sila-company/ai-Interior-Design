import SwiftUI

struct RedesignSummaryView: View {
    @Environment(AppFlow.self) private var flow
    @Environment(RedesignGenerationStore.self) private var generation
    @Environment(SubscriptionManager.self) private var subscription

    @State private var showPaywall = false

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

                if let room = flow.room {
                    Text(room.name)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(secondaryText)

                    RoomBriefCard(preferences: room.preferences)
                }

                if let style = flow.selectedStyle {
                    Text("We'll redesign your room in a \(style.name.lowercased()) style using only shoppable products selected from the live inventory.")
                        .font(.system(size: 17))
                        .foregroundStyle(secondaryText)
                        .lineSpacing(3)
                } else if let customStyle = flow.customStyleDescription {
                    Text("We'll redesign your room to feel like this, using only shoppable products from the live inventory.")
                        .font(.system(size: 17))
                        .foregroundStyle(secondaryText)
                        .lineSpacing(3)

                    summaryCard(
                        title: "Your style",
                        content: {
                            HStack(alignment: .top, spacing: 14) {
                                Image(systemName: "text.quote")
                                    .font(.system(size: 22))
                                    .foregroundStyle(appleBlue)
                                    .frame(width: 56, height: 56)
                                    .background(appleBlue.opacity(0.08), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

                                Text(customStyle)
                                    .font(.system(size: 15))
                                    .foregroundStyle(primaryText)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    )
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

                if !flow.selectedProducts.isEmpty {
                    summaryCard(
                        title: "Shoppable products",
                        content: {
                            VStack(alignment: .leading, spacing: 12) {
                                ForEach(flow.selectedProducts.prefix(4)) { product in
                                    HStack(spacing: 12) {
                                        AsyncImage(url: product.imageURL) { phase in
                                            switch phase {
                                            case .success(let image):
                                                image
                                                    .resizable()
                                                    .scaledToFill()
                                            default:
                                                Image(systemName: productIcon(for: product.category))
                                                    .font(.system(size: 16, weight: .medium))
                                                    .foregroundStyle(appleBlue)
                                            }
                                        }
                                        .frame(width: 42, height: 42)
                                        .background(appleBlue.opacity(0.08), in: RoundedRectangle(cornerRadius: 10, style: .continuous))
                                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                                        VStack(alignment: .leading, spacing: 3) {
                                            Text(product.displayCategory)
                                                .font(.system(size: 13, weight: .medium))
                                                .foregroundStyle(secondaryText)

                                            Text(product.shortTitle)
                                                .font(.system(size: 15, weight: .semibold))
                                                .foregroundStyle(primaryText)
                                                .lineLimit(1)
                                        }

                                        Spacer()

                                        Text(product.priceText)
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundStyle(primaryText)
                                    }
                                }

                                if flow.selectedProducts.count > 4 {
                                    Text("+ \(flow.selectedProducts.count - 4) more matched products")
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundStyle(secondaryText)
                                }
                            }
                        }
                    )
                }

                Button {
                    guard let room = flow.room, flow.hasStyleChoice else { return }
                    if subscription.membershipStatus.canGenerate {
                        generation.start(room: room, flow: flow)
                        flow.showGenerating()
                    } else {
                        showPaywall = true
                    }
                } label: {
                    Text(generation.isActive ? "Generation in progress…" : "Generate redesign")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(appleBlue, in: Capsule())
                .disabled(generation.isActive)
                .padding(.top, 8)
            }
            .padding(24)
        }
        .background(AppBackground())
        .navigationTitle("Summary")
        .navigationBarTitleDisplayMode(.inline)
        .task { await subscription.refresh() }
        .sheet(isPresented: $showPaywall) {
            MembershipPaywallSheet()
        }
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

    private func productIcon(for category: String) -> String {
        switch category {
        case "bed_frame":
            return "bed.double"
        case "nightstand", "side_table", "coffee_table", "dresser":
            return "table.furniture"
        case "rug":
            return "rectangle"
        case "wall_art":
            return "photo"
        case "accent_chair":
            return "chair"
        default:
            return "shippingbox"
        }
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
