import SwiftUI
import UIKit

struct RoomsView: View {
    @Environment(AuthManager.self) private var auth
    @Environment(AppFlow.self) private var flow

    @State private var rooms: [SavedRoom] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    private let service = AtelierAPIService()

    var body: some View {
        ZStack {
            AppBackground()

            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Welcome back")
                                .font(.system(size: 13))
                                .foregroundStyle(Color(red: 0.525, green: 0.525, blue: 0.545))
                            Text(auth.user?.name ?? "Atelier")
                                .font(.system(size: 22, weight: .semibold))
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

                    Text("Your rooms")
                        .font(.system(size: 28, weight: .semibold))

                    Text("Each room keeps its photo and redesign history.")
                        .font(.system(size: 17))
                        .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))

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

                    if isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .padding(.top, 40)
                    } else if let errorMessage {
                        Text(errorMessage)
                            .foregroundStyle(.red)
                    } else if rooms.isEmpty {
                        Text("No rooms yet. Add your first room to start redesigning.")
                            .font(.system(size: 15))
                            .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
                            .padding(.top, 20)
                    } else {
                        ForEach(rooms) { room in
                            Button {
                                openRoom(room)
                            } label: {
                                HStack(spacing: 14) {
                                    AsyncImage(url: room.originalImageURL) { phase in
                                        switch phase {
                                        case .success(let image):
                                            image.resizable().scaledToFill()
                                        default:
                                            Color(red: 0.961, green: 0.961, blue: 0.969)
                                        }
                                    }
                                    .frame(width: 64, height: 64)
                                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))

                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(room.name)
                                            .font(.system(size: 17, weight: .semibold))
                                            .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))
                                        Text("\(room.redesignCount) redesign\(room.redesignCount == 1 ? "" : "s")")
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
                .padding(24)
            }
        }
        .navigationBarBackButtonHidden(true)
        .task { await loadRooms() }
    }

    private func loadRooms() async {
        isLoading = true
        errorMessage = nil
        do {
            rooms = try await service.fetchRooms()
        } catch {
            errorMessage = error.localizedDescription
        }
        isLoading = false
    }

    private func openRoom(_ room: SavedRoom) {
        Task {
            do {
                let (data, _) = try await URLSession.shared.data(from: room.originalImageURL)
                guard let image = UIImage(data: data) else { return }
                flow.beginWithRoom(room, image: image)
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
