import SwiftUI

struct HomeView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(AppFlow.self) private var flow
    @Environment(DashboardStore.self) private var dashboard
    @Environment(SubscriptionManager.self) private var subscription

    @State private var actionError: String?

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    private var firstName: String {
        auth.user?.name.split(separator: " ").first.map(String.init) ?? "there"
    }

    private var recentRedesigns: [SavedRedesign] {
        Array(dashboard.redesigns.prefix(6))
    }

    var body: some View {
        ZStack {
            AppBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    header
                    if showMembershipPromo {
                        membershipPromoCard
                    }
                    statsRow
                    addRoomButton

                    if !recentRedesigns.isEmpty {
                        recentRedesignsSection
                    }

                    quickStartSection

                    if let actionError {
                        Text(actionError)
                            .font(.system(size: 14))
                            .foregroundStyle(.red)
                    }
                }
                .padding(24)
                .padding(.bottom, 16)
            }
        }
        .navigationBarHidden(true)
        .task {
            await dashboard.refresh()
            await subscription.refresh()
        }
        .refreshable {
            await dashboard.refresh()
            await subscription.refresh()
        }
    }

    private var showMembershipPromo: Bool {
        !subscription.membershipStatus.isActive
    }

    private var membershipPromoCard: some View {
        Button {
            flow.path.append(AppRoute.membership)
        } label: {
            HStack(spacing: 14) {
                Image(systemName: "sparkles")
                    .font(.system(size: 20))
                    .foregroundStyle(appleBlue)
                    .frame(width: 44, height: 44)
                    .background(appleBlue.opacity(0.08), in: Circle())

                VStack(alignment: .leading, spacing: 4) {
                    Text(membershipPromoTitle)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(primaryText)
                    Text(membershipPromoSubtitle)
                        .font(.system(size: 14))
                        .foregroundStyle(secondaryText)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(secondaryText)
            }
            .padding(16)
            .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private var membershipPromoTitle: String {
        let status = subscription.membershipStatus
        if status.freeRemaining > 0 {
            return "\(status.freeRemaining) free redesign\(status.freeRemaining == 1 ? "" : "s") left"
        }
        return "Subscribe for unlimited redesigns"
    }

    private var membershipPromoSubtitle: String {
        let status = subscription.membershipStatus
        if status.freeRemaining > 0 {
            return "Then \(subscription.displayPrice)/month for unlimited access"
        }
        return "Atelier Membership · \(subscription.displayPrice)/month"
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("ATELIER")
                .font(.system(size: 13, weight: .medium))
                .tracking(1.2)
                .foregroundStyle(Color(red: 0.525, green: 0.525, blue: 0.545))

            Text("Hi, \(firstName)")
                .font(.system(size: 34, weight: .semibold))
                .tracking(-0.5)
                .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))

            Text("Your rooms and AI redesigns, all in one place.")
                .font(.system(size: 17))
                .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
        }
    }

    private var statsRow: some View {
        HStack(spacing: 12) {
            statCard(
                title: "Rooms",
                value: dashboard.isLoading ? "—" : "\(dashboard.rooms.count)",
                filled: true
            )

            statCard(
                title: "Redesigns",
                value: dashboard.isLoading ? "—" : "\(dashboard.redesigns.count)",
                filled: false
            )
        }
    }

    private func statCard(title: String, value: String, filled: Bool) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 13))
                .foregroundStyle(filled ? .white.opacity(0.8) : Color(red: 0.525, green: 0.525, blue: 0.545))
            Text(value)
                .font(.system(size: 28, weight: .semibold))
                .foregroundStyle(filled ? .white : Color(red: 0.114, green: 0.114, blue: 0.122))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background {
            if filled {
                Color(red: 0, green: 0.443, blue: 0.890)
            } else {
                Color.white
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var addRoomButton: some View {
        Button {
            flow.path.append(AppRoute.addRoom)
        } label: {
            Text("Add a room")
                .font(.system(size: 15, weight: .medium))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
        }
        .buttonStyle(.plain)
        .foregroundStyle(.white)
        .background(Color(red: 0, green: 0.443, blue: 0.890), in: Capsule())
    }

    private var recentRedesignsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent redesigns")
                .font(.system(size: 20, weight: .semibold))

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(recentRedesigns) { redesign in
                        if let room = dashboard.rooms.first(where: { $0.id == redesign.roomId }) {
                            Button {
                                openRecentRedesign(room: room, redesign: redesign)
                            } label: {
                                redesignCard(room: room, redesign: redesign)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }

    private func redesignCard(room: SavedRoom, redesign: SavedRedesign) -> some View {
        VStack(alignment: .leading, spacing: 0) {
            AuthenticatedImage(url: redesign.resultImageURL) {
                Color(red: 0.961, green: 0.961, blue: 0.969)
                    .frame(width: 148, height: 110)
            }
            .frame(width: 148, height: 110)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))

            VStack(alignment: .leading, spacing: 2) {
                Text(room.name)
                    .font(.system(size: 13, weight: .semibold))
                    .lineLimit(1)
                Text(styleName(for: redesign.styleId))
                    .font(.system(size: 12))
                    .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
            }
            .padding(10)
            .frame(width: 148, alignment: .leading)
        }
        .background(.white, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private var quickStartSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick start")
                .font(.system(size: 20, weight: .semibold))

            VStack(spacing: 10) {
                quickStartRow(
                    icon: "camera.fill",
                    title: "Photograph a room",
                    subtitle: "Save it with a name you'll remember."
                ) {
                    flow.path.append(AppRoute.addRoom)
                }

                quickStartRow(
                    icon: "square.grid.2x2.fill",
                    title: "Browse your rooms",
                    subtitle: "Open a room and try a new style."
                ) {
                    flow.selectedTab = .rooms
                }
            }
        }
    }

    private func quickStartRow(
        icon: String,
        title: String,
        subtitle: String,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            HStack(spacing: 14) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundStyle(Color(red: 0, green: 0.443, blue: 0.890))
                    .frame(width: 40, height: 40)
                    .background(Color(red: 0, green: 0.443, blue: 0.890).opacity(0.08), in: Circle())

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))
                    Text(subtitle)
                        .font(.system(size: 14))
                        .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
                }

                Spacer()
            }
            .padding(14)
            .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private func openRecentRedesign(room: SavedRoom, redesign: SavedRedesign) {
        guard let style = DesignStyle.from(id: redesign.styleId) else { return }

        Task {
            do {
                async let roomImageTask = AuthenticatedImageLoader.load(from: room.originalImageURL)
                async let redesignImageTask = AuthenticatedImageLoader.load(from: redesign.resultImageURL)
                let roomImage = try await roomImageTask
                let redesignImage = try await redesignImageTask
                flow.room = room
                flow.roomImage = roomImage
                flow.viewSavedRedesign(redesign, image: redesignImage, style: style)
            } catch {
                actionError = error.localizedDescription
            }
        }
    }

    private func styleName(for styleId: String) -> String {
        DesignStyle.from(id: styleId)?.name ?? styleId
    }
}
