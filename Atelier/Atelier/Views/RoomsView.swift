import SwiftUI

struct RoomsView: View {
    @Environment(AppFlow.self) private var flow
    @Environment(DashboardStore.self) private var dashboard

    @State private var actionError: String?

    var body: some View {
        ZStack {
            AppBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Rooms")
                            .font(.system(size: 34, weight: .semibold))
                            .tracking(-0.5)

                        Text("Each room keeps its photo and every AI redesign.")
                            .font(.system(size: 17))
                            .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
                    }

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

                    if dashboard.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .padding(.top, 40)
                    } else if let errorMessage = dashboard.errorMessage {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                    } else if dashboard.rooms.isEmpty {
                        emptyState
                    } else {
                        ForEach(dashboard.rooms) { room in
                            Button {
                                openRoom(room)
                            } label: {
                                roomRow(room)
                            }
                            .buttonStyle(.plain)
                        }
                    }

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
        .task { await dashboard.refresh() }
        .refreshable { await dashboard.refresh() }
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Text("No rooms yet")
                .font(.system(size: 17, weight: .medium))
            Text("Add your first room to start redesigning.")
                .font(.system(size: 15))
                .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 32)
        .background(.white.opacity(0.7), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private func roomRow(_ room: SavedRoom) -> some View {
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

            Image(systemName: "chevron.right")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(Color(red: 0.525, green: 0.525, blue: 0.545))
        }
        .padding(14)
        .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private func openRoom(_ room: SavedRoom) {
        Task {
            do {
                let image = try await AuthenticatedImageLoader.load(from: room.originalImageURL)
                flow.openRoom(room, image: image)
            } catch {
                actionError = error.localizedDescription
            }
        }
    }
}
