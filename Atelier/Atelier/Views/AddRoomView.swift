import PhotosUI
import SwiftUI

struct AddRoomView: View {
    @Environment(AppFlow.self) private var flow

    @State private var name = ""
    @State private var selectedImage: UIImage?
    @State private var photoPickerItem: PhotosPickerItem?
    @State private var showCamera = false
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    private let service = AtelierAPIService()

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                Text("Name your room")
                    .font(.system(size: 28, weight: .semibold))

                Text("Give it a name you'll recognize, like \"Living room\" or \"Bedroom\".")
                    .font(.system(size: 17))
                    .foregroundStyle(Color(red: 0.431, green: 0.431, blue: 0.451))

                TextField("Living room", text: $name)
                    .padding()
                    .background(.white, in: RoundedRectangle(cornerRadius: 16))

                Group {
                    if let selectedImage {
                        Image(uiImage: selectedImage)
                            .resizable()
                            .scaledToFill()
                    } else {
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .fill(Color(red: 0.961, green: 0.961, blue: 0.969))
                            .overlay {
                                Text("Add room photo")
                                    .foregroundStyle(Color(red: 0.525, green: 0.525, blue: 0.545))
                            }
                    }
                }
                .frame(maxWidth: .infinity)
                .aspectRatio(16 / 10, contentMode: .fit)
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))

                HStack(spacing: 12) {
                    PhotosPicker(selection: $photoPickerItem, matching: .images) {
                        Text("Choose photo")
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 12)
                    }
                    .buttonStyle(.plain)
                    .background(Color.black.opacity(0.04), in: Capsule())

                    if UIImagePickerController.isSourceTypeAvailable(.camera) {
                        Button("Camera") {
                            showCamera = true
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.black.opacity(0.04), in: Capsule())
                    }
                }

                if let errorMessage {
                    Text(errorMessage)
                        .foregroundStyle(.red)
                        .font(.system(size: 14))
                }

                Button {
                    saveRoom()
                } label: {
                    Text(isSubmitting ? "Saving room…" : "Save and continue")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(Color(red: 0, green: 0.443, blue: 0.890), in: Capsule())
                .disabled(name.trimmingCharacters(in: .whitespaces).isEmpty || selectedImage == nil || isSubmitting)
            }
            .padding(24)
        }
        .background(AppBackground())
        .navigationTitle("New room")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showCamera) {
            CameraPicker(image: $selectedImage)
                .ignoresSafeArea()
        }
        .onChange(of: photoPickerItem) { _, newItem in
            guard let newItem else { return }
            Task {
                guard let data = try? await newItem.loadTransferable(type: Data.self),
                      let image = UIImage(data: data) else { return }
                await MainActor.run { selectedImage = image }
            }
        }
    }

    private func saveRoom() {
        guard let selectedImage else { return }
        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                let room = try await service.createRoom(
                    name: name.trimmingCharacters(in: .whitespacesAndNewlines),
                    image: selectedImage
                )
                flow.beginWithRoom(room, image: selectedImage)
            } catch {
                errorMessage = error.localizedDescription
                isSubmitting = false
            }
        }
    }
}
