import SwiftUI
import UIKit

struct RoomsView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(AppFlow.self) private var flow

    @State private var rooms: [SavedRoom] = []
    @State private var redesigns: [SavedRedesign] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    private let service = AtelierAPIService()

    var body: some View {
        ZStack {
            AppBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {
                    header

                    statsRow

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

                    if !recentRedesigns.isEmpty {
                        recentRedesignsSection
                    }

                    roomsSection
                }
                .padding(24)
            }
        }
        .navigationBarBackButtonHidden(true)
        .task { await loadHome() }
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("ATELIER")
                    .font(.system(size: 13, weight: .medium))
                    .tracking(1.2)
                    .foregroundStyle(Color(red: 0.525, green: 0.525, blue: 0.545))
                Text("Hi, \(firstName)")
                    .font(.system(size: 30, weight: .semibold))
                    .tracking(-0.5)
            }

            Spacer()

            Button("Sign out") {
                Task { await auth.logout() }
            }
            .font(.system(size: 14))
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color.black.opacity(0.04), in: Capsule())
        }
    }

    private var firstName: String {
        auth.user?.name.split(separator: " ").first.map(String.init) ?? "there"
    }

    private var statsRow: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Rooms")
                    .font(.system(size: 13))
                    .foregroundStyle(.white.opacity(0.8))
                Text("\(rooms.count)")
                    .font(.system(size: 28, weight: .semibold))
                    .foregroundStyle(.white)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(Color(red: 0, green: 0.443, blue: 0.890), in: RoundedRectangle(cornerRadius: 20, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text("Saved redesigns")
                    .font(.system(size: 13))
                    .foregroundStyle(Color(red: 0.525, green: 0.525, blue: 0.545))
                Text("\(redesigns.count)")
                    .font(.system(size: 28, weight: .semibold))
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(16)
            .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        }
    }

    private var recentRedesigns: [SavedRedesign] {
        Array(redesigns.prefix(6))
    }

    private var recentRedesignsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent redesigns")
                .font(.system(size: 20, weight: .semibold))

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(recentRedesigns) { redesign in
                        if let room = rooms.first(where: { $0.id == redesign.roomId }) {
                            Button {
                                openRecentRedesign(room: room, redesign: redesign)
                            } label: {
                                VStack(alignment: .leading, spacing: 0) {
                                    AuthenticatedImage(url: redesign.resultImageURL) {
                                        Color(red: 0.961, green: 0.961, blue: 0.969)
                                            .frame(width: 140, height: 105)
                                    }
                                    .frame(width: 140, height: 105)
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
                                    .frame(width: 140, alignment: .leading)
                                }
                                .background(.white, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }

    private var roomsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Your rooms")
                .font(.system(size: 20, weight: .semibold))

            Text("Open a room to see every saved redesign.")
                .font(.system(size: 15))
                .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))

            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding(.top, 20)
            } else if let errorMessage {
                Text(errorMessage)
                    .foregroundStyle(.red)
            } else if rooms.isEmpty {
                Text("No rooms yet. Add your first room to start redesigning.")
                    .font(.system(size: 15))
                    .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
                    .padding(.top, 8)
            } else {
                ForEach(rooms) { room in
                    Button {
                        openRoom(room)
                    } label: {
                        HStack(spacing: 14) {
                            AuthenticatedImage(url: room.originalImageURL) {
                                Color(red: 0.961, green: 0.961, blue: 0.969)
                            }
                            .frame(width: 72, height: 72)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))

                            VStack(alignment: .leading, spacing: 4) {
                                Text(room.name)
                                    .font(.system(size: 17, weight: .semibold))
                                    .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))
                                Text("\(room.redesignCount) saved redesign\(room.redesignCount == 1 ? "" : "s")")
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
            }
        }
    }

    private func loadHome() async {
        isLoading = true
        errorMessage = nil

        do {
            async let roomsTask = service.fetchRooms()
            async let redesignsTask = service.fetchRedesigns()
            rooms = try await roomsTask
            redesigns = try await redesignsTask
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    private func openRoom(_ room: SavedRoom) {
        Task {
            do {
                let image = try await AuthenticatedImageLoader.load(from: room.originalImageURL)
                flow.openRoom(room, image: image)
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func openRecentRedesign(room: SavedRoom, redesign: SavedRedesign) {
        guard let style = DesignStyle.catalog.first(where: { $0.id == redesign.styleId }) else { return }

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
                errorMessage = error.localizedDescription
            }
        }
    }

    private func styleName(for styleId: String) -> String {
        DesignStyle.catalog.first(where: { $0.id == styleId })?.name ?? styleId
    }
}
