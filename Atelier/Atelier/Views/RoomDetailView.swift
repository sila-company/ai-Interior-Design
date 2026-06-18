import SwiftUI

struct RoomDetailView: View {
    @Environment(AppFlow.self) private var flow

    @State private var redesigns: [SavedRedesign] = []
    @State private var isLoading = true
    @State private var errorMessage: String?

    private let service = AtelierAPIService()
    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                if let room = flow.room, let roomImage = flow.roomImage {
                    Image(uiImage: roomImage)
                        .resizable()
                        .scaledToFill()
                        .frame(maxWidth: .infinity)
                        .aspectRatio(16 / 10, contentMode: .fit)
                        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))

                    VStack(alignment: .leading, spacing: 6) {
                        Text(room.name)
                            .font(.system(size: 24, weight: .semibold))
                        Text("\(redesigns.count) saved redesign\(redesigns.count == 1 ? "" : "s")")
                            .font(.system(size: 15))
                            .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
                    }

                    RoomBriefCard(preferences: room.preferences)
                }

                Button {
                    flow.beginNewRedesign()
                } label: {
                    Text("Create new redesign")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(Color(red: 0, green: 0.443, blue: 0.890), in: Capsule())

                Text("Saved designs")
                    .font(.system(size: 20, weight: .semibold))

                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.top, 24)
                } else if let errorMessage {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                        .font(.system(size: 14))
                } else if redesigns.isEmpty {
                    Text("No redesigns yet. Create your first one and it will be saved here automatically.")
                        .font(.system(size: 15))
                        .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))
                } else {
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(redesigns) { redesign in
                            Button {
                                openRedesign(redesign)
                            } label: {
                                VStack(alignment: .leading, spacing: 0) {
                                    AuthenticatedImage(url: redesign.resultImageURL) {
                                        Color(red: 0.961, green: 0.961, blue: 0.969)
                                            .aspectRatio(4 / 3, contentMode: .fit)
                                    }
                                    .aspectRatio(4 / 3, contentMode: .fit)
                                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(styleName(for: redesign.styleId))
                                            .font(.system(size: 14, weight: .semibold))
                                            .foregroundStyle(Color(red: 0.114, green: 0.114, blue: 0.122))
                                    }
                                    .padding(10)
                                }
                                .background(.white, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .padding(24)
        }
        .background(AppBackground())
        .navigationTitle(flow.room?.name ?? "Room")
        .navigationBarTitleDisplayMode(.inline)
        .task(id: flow.room?.id) {
            await loadRedesigns()
        }
    }

    private func loadRedesigns() async {
        guard let room = flow.room else { return }
        isLoading = true
        errorMessage = nil

        do {
            let detail = try await service.fetchRoomDetail(roomId: room.id)
            redesigns = detail.1
            flow.savedRedesigns = detail.1
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    private func openRedesign(_ redesign: SavedRedesign) {
        guard let style = DesignStyle.from(id: redesign.styleId) else { return }

        Task {
            do {
                let image = try await AuthenticatedImageLoader.load(from: redesign.resultImageURL)
                flow.viewSavedRedesign(redesign, image: image, style: style)
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func styleName(for styleId: String) -> String {
        DesignStyle.from(id: styleId)?.name ?? styleId
    }
}
