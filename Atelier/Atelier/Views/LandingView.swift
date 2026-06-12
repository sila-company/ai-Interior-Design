import SwiftUI

struct LandingView: View {
    @Environment(AppFlow.self) private var flow

    @State private var appeared = false

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
        .navigationBarBackButtonHidden(true)
        .onAppear {
            withAnimation(.easeOut(duration: 0.7)) {
                appeared = true
            }
        }
    }

    private var header: some View {
        HStack {
            Text("Atelier")
                .font(.system(size: 17, weight: .semibold))
                .tracking(-0.3)

            Spacer()

            Button {
                flow.path.append(AppRoute.login)
            } label: {
                Text("Sign in")
                    .font(.system(size: 14))
                    .foregroundStyle(primaryText)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(Color.black.opacity(0.04), in: Capsule())
            }
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

            Text("Create an account, save every room by name, and revisit your redesigns anytime.")
                .font(.system(size: 19))
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .foregroundStyle(secondaryText)
                .padding(.horizontal, 8)
                .padding(.bottom, 32)

            VStack(spacing: 12) {
                Button {
                    flow.path.append(AppRoute.register)
                } label: {
                    Text("Create account")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(.white)
                .background(appleBlue, in: Capsule())

                Button {
                    flow.path.append(AppRoute.login)
                } label: {
                    Text("Sign in")
                        .font(.system(size: 15, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.plain)
                .foregroundStyle(appleBlue)
                .background(appleBlue.opacity(0.06), in: Capsule())
            }
            .padding(.bottom, 48)
        }
    }

    private var previewCard: some View {
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
                    Image(systemName: "house.and.flag.fill")
                        .font(.system(size: 28, weight: .light))
                        .foregroundStyle(mutedText)

                    Text("Living room · Bedroom · Office")
                        .font(.system(size: 15))
                        .foregroundStyle(mutedText)
                }
            }
            .frame(maxWidth: .infinity)
            .background(.white, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
            .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
            .overlay {
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(Color.black.opacity(0.06), lineWidth: 1)
            }
            .shadow(color: .black.opacity(0.08), radius: 40, y: 20)
    }
}

#Preview {
    NavigationStack {
        LandingView()
            .environment(AppFlow())
            .environment(AuthManager())
    }
}
