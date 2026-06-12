import PhotosUI
import SwiftUI

struct LandingView: View {
    @Environment(AppFlow.self) private var flow

    @State private var appeared = false
    @State private var selectedImage: UIImage?
    @State private var photoPickerItem: PhotosPickerItem?
    @State private var showSourcePicker = false
    @State private var showPhotoPicker = false
    @State private var showCamera = false
    @State private var isLoadingPhoto = false

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)
    private let mutedText = Color(red: 0.525, green: 0.525, blue: 0.545)

    var body: some View {
        ZStack {
            AppBackground()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    header
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)

                    hero
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.7).delay(0.08), value: appeared)

                    previewCard
                        .opacity(appeared ? 1 : 0)
                        .offset(y: appeared ? 0 : 20)
                        .animation(.easeOut(duration: 0.7).delay(0.24), value: appeared)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 40)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.7)) {
                appeared = true
            }
        }
        .confirmationDialog(
            "Add a room photo",
            isPresented: $showSourcePicker,
            titleVisibility: .visible
        ) {
            if UIImagePickerController.isSourceTypeAvailable(.camera) {
                Button("Take Photo") {
                    showCamera = true
                }
            }
            Button("Choose from Library") {
                showPhotoPicker = true
            }
            Button("Cancel", role: .cancel) {}
        }
        .photosPicker(
            isPresented: $showPhotoPicker,
            selection: $photoPickerItem,
            matching: .images,
            photoLibrary: .shared()
        )
        .sheet(isPresented: $showCamera) {
            CameraPicker(image: $selectedImage)
                .ignoresSafeArea()
        }
        .onChange(of: photoPickerItem) { _, newItem in
            guard let newItem else { return }
            loadPhoto(from: newItem)
        }
        .onChange(of: flow.roomImage) { _, image in
            if image == nil {
                selectedImage = nil
            }
        }
    }

    private var header: some View {
        HStack {
            Text("Atelier")
                .font(.system(size: 17, weight: .semibold))
                .tracking(-0.3)

            Spacer()

            Button("Sign in") {}
                .font(.system(size: 14))
                .foregroundStyle(primaryText)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.black.opacity(0.04), in: Capsule())
        }
        .padding(.top, 8)
        .padding(.bottom, 32)
    }

    private var hero: some View {
        VStack(spacing: 0) {
            Text("AI Interior Design")
                .font(.system(size: 13, weight: .medium))
                .textCase(.uppercase)
                .tracking(2.8)
                .foregroundStyle(mutedText)
                .padding(.bottom, 20)

            Text("Your space,\nreimagined.")
                .font(.system(size: 44, weight: .semibold))
                .multilineTextAlignment(.center)
                .tracking(-1.5)
                .lineSpacing(2)
                .foregroundStyle(primaryText)
                .padding(.bottom, 16)

            Text("Upload a photo of any room and explore calm, thoughtful redesigns in seconds.")
                .font(.system(size: 19))
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .foregroundStyle(secondaryText)
                .padding(.horizontal, 8)
                .padding(.bottom, 32)

            VStack(spacing: 12) {
                Button {
                    showSourcePicker = true
                } label: {
                    Text(selectedImage == nil ? "Upload a room photo" : "Change photo")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(appleBlue, in: Capsule())

                if let selectedImage {
                    Button {
                        flow.beginWithRoom(selectedImage)
                    } label: {
                        Text("Continue")
                            .font(.system(size: 15, weight: .medium))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(appleBlue)
                    .background(appleBlue.opacity(0.06), in: Capsule())
                } else {
                    Button {} label: {
                        Text("See examples")
                            .font(.system(size: 15))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(appleBlue)
                    .background(appleBlue.opacity(0.06), in: Capsule())
                }
            }
            .padding(.bottom, 48)
        }
    }

    private var previewCard: some View {
        Button {
            showSourcePicker = true
        } label: {
            Group {
                if let selectedImage {
                    Image(uiImage: selectedImage)
                        .resizable()
                        .scaledToFill()
                } else if isLoadingPhoto {
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .fill(Color(red: 0.961, green: 0.961, blue: 0.969))
                        .aspectRatio(16 / 10, contentMode: .fit)
                        .overlay {
                            ProgressView()
                                .tint(mutedText)
                        }
                } else {
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(red: 0.961, green: 0.961, blue: 0.969),
                                    Color(red: 0.925, green: 0.925, blue: 0.933),
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .aspectRatio(16 / 10, contentMode: .fit)
                        .overlay {
                            VStack(spacing: 12) {
                                Image(systemName: "photo.on.rectangle.angled")
                                    .font(.system(size: 28, weight: .light))
                                    .foregroundStyle(mutedText)

                                Text("Tap to add your room photo")
                                    .font(.system(size: 15))
                                    .foregroundStyle(mutedText)
                            }
                        }
                }
            }
            .frame(maxWidth: .infinity)
            .aspectRatio(16 / 10, contentMode: .fit)
            .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        }
        .buttonStyle(.plain)
        .background(.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(Color.black.opacity(0.06), lineWidth: 1)
        }
        .shadow(color: .black.opacity(0.08), radius: 40, y: 20)
    }

    private func loadPhoto(from item: PhotosPickerItem) {
        isLoadingPhoto = true

        Task {
            defer {
                Task { @MainActor in
                    isLoadingPhoto = false
                }
            }

            guard let data = try? await item.loadTransferable(type: Data.self),
                  let image = UIImage(data: data) else {
                return
            }

            await MainActor.run {
                selectedImage = image
            }
        }
    }
}

#Preview {
    NavigationStack {
        LandingView()
            .environment(AppFlow())
    }
}
