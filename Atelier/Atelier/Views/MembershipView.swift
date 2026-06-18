import StoreKit
import SwiftUI

struct MembershipView: View {
    @Environment(SubscriptionManager.self) private var subscription
    @Environment(\.openURL) private var openURL

    @State private var actionError: String?

    private let appleBlue = Color(red: 0, green: 0.443, blue: 0.890)
    private let primaryText = Color(red: 0.114, green: 0.114, blue: 0.122)
    private let secondaryText = Color(red: 0.431, green: 0.431, blue: 0.451)

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Atelier Membership")
                        .font(.system(size: 34, weight: .semibold))
                        .tracking(-0.5)
                        .foregroundStyle(primaryText)

                    Text(priceLine)
                        .font(.system(size: 17))
                        .foregroundStyle(secondaryText)
                }

                benefitsCard

                if subscription.membershipStatus.isActive {
                    activeMembershipCard
                } else {
                    subscribeButton
                }

                restoreButton
                legalFooter

                if let actionError {
                    Text(actionError)
                        .font(.system(size: 14))
                        .foregroundStyle(.red)
                }
            }
            .padding(24)
        }
        .background(AppBackground())
        .navigationTitle("Membership")
        .navigationBarTitleDisplayMode(.inline)
        .task { await subscription.refresh() }
    }

    private var priceLine: String {
        if let displayPrice = subscription.monthlyProduct?.displayPrice {
            return "\(displayPrice)/month · cancel anytime in Apple ID settings"
        }
        return "$19.99/month · cancel anytime in Apple ID settings"
    }

    private var benefitsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("What's included")
                .font(.system(size: 17, weight: .semibold))

            benefitRow("sparkles", "Unlimited AI room redesigns")
            benefitRow("square.grid.2x2", "Save unlimited rooms and designs")
            benefitRow("bag", "Shoppable product suggestions")
            benefitRow("rectangle.on.rectangle", "Before/after comparisons")
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private func benefitRow(_ icon: String, _ text: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(appleBlue)
                .frame(width: 32, height: 32)
                .background(appleBlue.opacity(0.08), in: Circle())

            Text(text)
                .font(.system(size: 15))
                .foregroundStyle(primaryText)
        }
    }

    private var activeMembershipCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("You're a member", systemImage: "checkmark.seal.fill")
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(appleBlue)

            Text(subscription.membershipStatus.accountSummary)
                .font(.system(size: 15))
                .foregroundStyle(secondaryText)

            Button("Manage subscription") {
                if let url = URL(string: "https://apps.apple.com/account/subscriptions") {
                    openURL(url)
                }
            }
            .font(.system(size: 15, weight: .medium))
            .foregroundStyle(appleBlue)
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var subscribeButton: some View {
        Button {
            Task {
                do {
                    try await subscription.purchase()
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
        .disabled(subscription.purchaseInProgress || subscription.monthlyProduct == nil)
    }

    private var restoreButton: some View {
        Button {
            Task {
                do {
                    try await subscription.restorePurchases()
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
        .background(appleBlue.opacity(0.08), in: Capsule())
        .disabled(subscription.purchaseInProgress)
    }

    private var legalFooter: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Payment will be charged to your Apple ID account at confirmation of purchase. Subscription automatically renews unless it is canceled at least 24 hours before the end of the current period. Your account will be charged for renewal within 24 hours prior to the end of the current period. You can manage and cancel subscriptions in Settings → Apple ID → Subscriptions.")
                .font(.system(size: 12))
                .foregroundStyle(secondaryText)

            Link("Atelier is also available on the web at atelier.com.", destination: URL(string: "https://atelier.com")!)
                .font(.system(size: 12))
                .foregroundStyle(secondaryText)

            HStack(spacing: 16) {
                NavigationLink(value: AppRoute.privacy) {
                    Text("Privacy Policy")
                }
                NavigationLink(value: AppRoute.terms) {
                    Text("Terms of Use")
                }
            }
            .font(.system(size: 13, weight: .medium))
            .foregroundStyle(appleBlue)
        }
    }
}
