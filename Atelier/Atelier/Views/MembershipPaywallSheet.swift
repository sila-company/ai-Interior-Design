import SwiftUI

struct MembershipPaywallSheet: View {
    @Environment(SubscriptionManager.self) private var subscription
    @Environment(\.dismiss) private var dismiss

    @State private var actionError: String?
    @State private var legalPath = NavigationPath()

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        NavigationStack(path: $legalPath) {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Unlock unlimited redesigns")
                            .font(.system(size: 28, weight: .semibold))
                            .foregroundStyle(primaryText)

                        Text("You've used your free redesigns. Subscribe to keep creating with Atelier Membership.")
                            .font(.system(size: 16))
                            .foregroundStyle(secondaryText)
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Text(subscription.monthlyProduct?.displayPrice ?? "$19.99")
                            .font(.system(size: 34, weight: .semibold))
                            .foregroundStyle(primaryText)
                        Text("per month · auto-renewing")
                            .font(.system(size: 14))
                            .foregroundStyle(secondaryText)
                    }
                    .padding(18)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))

                    Button {
                        Task {
                            do {
                                try await subscription.purchase()
                                if subscription.membershipStatus.isActive {
                                    dismiss()
                                }
                            } catch {
                                actionError = error.localizedDescription
                            }
                        }
                    } label: {
                        Text(subscription.purchaseInProgress ? "Processing…" : "Subscribe")
                            .font(.system(size: 15, weight: .medium))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(.white)
                    .background(appleBlue, in: Capsule())
                    .disabled(subscription.purchaseInProgress)

                    Button {
                        Task {
                            do {
                                try await subscription.restorePurchases()
                                if subscription.membershipStatus.isActive {
                                    dismiss()
                                }
                            } catch {
                                actionError = error.localizedDescription
                            }
                        }
                    } label: {
                        Text("Restore purchases")
                            .font(.system(size: 15, weight: .medium))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 14)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(appleBlue)

                    if let actionError {
                        Text(actionError)
                            .font(.system(size: 14))
                            .foregroundStyle(.red)
                    }

                    Text("Payment charged to Apple ID. Cancel anytime in Settings → Apple ID → Subscriptions.")
                        .font(.system(size: 12))
                        .foregroundStyle(secondaryText)

                    Link("Atelier is also available on the web at atelier.com.", destination: URL(string: "https://atelier.com")!)
                        .font(.system(size: 12))
                        .foregroundStyle(secondaryText)

                    HStack(spacing: 16) {
                        NavigationLink(value: AppRoute.privacy) {
                            Text("Privacy")
                        }
                        NavigationLink(value: AppRoute.terms) {
                            Text("Terms")
                        }
                    }
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(appleBlue)
                }
                .padding(24)
            }
            .background(AppBackground())
            .legalPageDestinations()
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Close") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
        .task { await subscription.refresh() }
    }
}
