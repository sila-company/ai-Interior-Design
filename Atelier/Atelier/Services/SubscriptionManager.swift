import Foundation
import StoreKit

@Observable
@MainActor
final class SubscriptionManager {
    var membershipStatus: MembershipStatus = .empty
    var monthlyProduct: Product?
    var isLoading = false
    var purchaseInProgress = false
    var errorMessage: String?

    private let api = AtelierAPIService()

    init() {
        Task { await listenForTransactionUpdates() }
        Task { await refresh() }
    }

    var displayPrice: String {
        monthlyProduct?.displayPrice ?? "$19.99"
    }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }

        await loadProducts()
        await syncMembershipFromServer()
    }

    func loadProducts() async {
        do {
            let products = try await Product.products(for: [SubscriptionProducts.monthlyMembership])
            monthlyProduct = products.first
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func syncMembershipFromServer() async {
        do {
            membershipStatus = try await api.fetchMembershipStatus()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func purchase() async throws {
        guard let monthlyProduct else {
            throw AtelierAPIServiceError.apiError("Subscription is not available right now.")
        }

        purchaseInProgress = true
        errorMessage = nil
        defer { purchaseInProgress = false }

        let result = try await monthlyProduct.purchase()
        switch result {
        case .success(let verification):
            let transaction = try checkVerified(verification)
            try await syncTransaction(jwsRepresentation: verification.jwsRepresentation)
            await transaction.finish()
        case .userCancelled:
            return
        case .pending:
            throw AtelierAPIServiceError.apiError("Purchase is pending approval.")
        @unknown default:
            throw AtelierAPIServiceError.apiError("Purchase could not be completed.")
        }
    }

    func restorePurchases() async throws {
        purchaseInProgress = true
        errorMessage = nil
        defer { purchaseInProgress = false }

        try await AppStore.sync()

        var restored = false
        for await result in Transaction.currentEntitlements {
            let transaction = try checkVerified(result)
            if transaction.productID == SubscriptionProducts.monthlyMembership {
                try await syncTransaction(jwsRepresentation: result.jwsRepresentation)
                restored = true
            }
        }

        if !restored {
            await syncMembershipFromServer()
        }
    }

    private func listenForTransactionUpdates() async {
        for await result in Transaction.updates {
            do {
                let transaction = try checkVerified(result)
                if transaction.productID == SubscriptionProducts.monthlyMembership {
                    try await syncTransaction(jwsRepresentation: result.jwsRepresentation)
                }
                await transaction.finish()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func syncTransaction(jwsRepresentation: String) async throws {
        membershipStatus = try await api.syncSubscription(signedTransaction: jwsRepresentation)
    }

    private func checkVerified<T>(_ result: VerificationResult<T>) throws -> T {
        switch result {
        case .verified(let safe):
            return safe
        case .unverified:
            throw AtelierAPIServiceError.apiError("Could not verify the App Store transaction.")
        }
    }

    func reset() {
        membershipStatus = .empty
        monthlyProduct = nil
        isLoading = false
        purchaseInProgress = false
        errorMessage = nil
    }
}
