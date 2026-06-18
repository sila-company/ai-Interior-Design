import { Route, Switch } from "wouter";

import { AppShell } from "@/components/AppShell";
import { AppFlowProvider } from "@/context/AppFlowContext";
import { AuthProvider } from "@/context/AuthContext";
import { AccountPage } from "@/pages/AccountPage";
import { AddRoomPage } from "@/pages/AddRoomPage";
import { GeneratingPage } from "@/pages/GeneratingPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { MembershipPage } from "@/pages/MembershipPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { SubscriptionSuccessPage } from "@/pages/SubscriptionSuccessPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { RoomDetailPage } from "@/pages/RoomDetailPage";
import { RoomsPage } from "@/pages/RoomsPage";
import { StyleSelectionPage } from "@/pages/StyleSelectionPage";
import { SummaryPage } from "@/pages/SummaryPage";
import { SupportPage } from "@/pages/SupportPage";
import { TermsPage } from "@/pages/TermsPage";

export default function App() {
  return (
    <AuthProvider>
      <AppFlowProvider>
        <AppShell>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/rooms" component={RoomsPage} />
            <Route path="/rooms/new" component={AddRoomPage} />
            <Route path="/rooms/:roomId" component={RoomDetailPage} />
            <Route path="/rooms/:roomId/style" component={StyleSelectionPage} />
            <Route path="/rooms/:roomId/summary" component={SummaryPage} />
            <Route
              path="/rooms/:roomId/generating"
              component={GeneratingPage}
            />
            <Route path="/rooms/:roomId/results" component={ResultsPage} />
            <Route path="/account" component={AccountPage} />
            <Route path="/membership" component={MembershipPage} />
            <Route path="/subscription/success" component={SubscriptionSuccessPage} />
            <Route path="/privacy" component={PrivacyPage} />
            <Route path="/terms" component={TermsPage} />
            <Route path="/support" component={SupportPage} />
            <Route>
              <LandingPage />
            </Route>
          </Switch>
        </AppShell>
      </AppFlowProvider>
    </AuthProvider>
  );
}
