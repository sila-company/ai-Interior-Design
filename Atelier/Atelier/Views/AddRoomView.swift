import PhotosUI
import SwiftUI

struct AddRoomView: View {
    @Environment(AppFlow.self) private var flow

    @State private var input = CreateRoomInput()
    @State private var selectedImage: UIImage?
    @State private var photoPickerItem: PhotosPickerItem?
    @State private var showCamera = false
    @State private var errorMessage: String?
    @State private var isSubmitting = false

    private let service = AtelierAPIService()
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                Text("Set up your room")
                    .font(.system(size: 28, weight: .semibold))

                Text("Add a photo, describe the vibe you want, and optional size or budget details.")
                    .font(.system(size: 17))
                    .foregroundStyle(secondaryText)

                fieldGroup(title: "Room name") {
                    TextField("Living room", text: $input.name)
                        .padding()
                        .background(.white, in: RoundedRectangle(cornerRadius: 16))
                }

                fieldGroup(title: "What do you want this room to feel like?") {
                    TextField(
                        "Calm reading nook with warm wood and soft lighting",
                        text: $input.description,
                        axis: .vertical
                    )
                    .lineLimit(3...6)
                    .padding()
                    .background(.white, in: RoundedRectangle(cornerRadius: 16))
                }

                photoSection

                dimensionsSection
                budgetSection

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
                .disabled(!canSave || isSubmitting)
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

    private var canSave: Bool {
        !input.name.trimmingCharacters(in: .whitespaces).isEmpty && selectedImage != nil
    }

    private var photoSection: some View {
        fieldGroup(title: "Room photo") {
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
        }
    }

    private var dimensionsSection: some View {
        fieldGroup(title: "Dimensions (optional)") {
            Toggle("Add room dimensions", isOn: $input.includesDimensions)
                .tint(Color(red: 0, green: 0.443, blue: 0.890))

            if input.includesDimensions {
                Picker("Unit", selection: $input.dimensionUnit) {
                    ForEach(DimensionUnit.allCases) { unit in
                        Text(unit.label).tag(unit)
                    }
                }
                .pickerStyle(.segmented)

                HStack(spacing: 12) {
                    dimensionField("Length", text: $input.length)
                    dimensionField("Width", text: $input.width)
                    dimensionField("Height", text: $input.height)
                }
            }
        }
        .padding(16)
        .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private var budgetSection: some View {
        fieldGroup(title: "Budget (optional)") {
            Toggle("Set a furnishing budget", isOn: $input.includesBudget)
                .tint(Color(red: 0, green: 0.443, blue: 0.890))

            if input.includesBudget {
                TextField("5000", text: $input.budget)
                    .keyboardType(.numberPad)
                    .padding()
                    .background(Color(red: 0.961, green: 0.961, blue: 0.969), in: RoundedRectangle(cornerRadius: 14))

                Text("USD · used to guide product and material choices")
                    .font(.system(size: 13))
                    .foregroundStyle(secondaryText)
            }
        }
        .padding(16)
        .background(.white, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private func fieldGroup<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.system(size: 15, weight: .semibold))
            content()
        }
    }

    private func dimensionField(_ label: String, text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 12))
                .foregroundStyle(secondaryText)
            TextField("0", text: text)
                .keyboardType(.decimalPad)
                .padding(10)
                .background(Color(red: 0.961, green: 0.961, blue: 0.969), in: RoundedRectangle(cornerRadius: 12))
        }
    }

    private func saveRoom() {
        guard let selectedImage else { return }
        isSubmitting = true
        errorMessage = nil

        Task {
            do {
                let room = try await service.createRoom(
                    name: input.name.trimmingCharacters(in: .whitespacesAndNewlines),
                    image: selectedImage,
                    input: input
                )
                flow.beginWithRoom(room, image: selectedImage)
            } catch {
                errorMessage = error.localizedDescription
                isSubmitting = false
            }
        }
    }
}
