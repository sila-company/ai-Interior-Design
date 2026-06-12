import { Route, Switch } from "wouter";

import { AppShell } from "@/components/AppShell";
import { AppFlowProvider } from "@/context/AppFlowContext";
import { AuthProvider } from "@/context/AuthContext";
import { AddRoomPage } from "@/pages/AddRoomPage";
import { GeneratingPage } from "@/pages/GeneratingPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { RoomsPage } from "@/pages/RoomsPage";
import { StyleSelectionPage } from "@/pages/StyleSelectionPage";
import { SummaryPage } from "@/pages/SummaryPage";

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
            <Route path="/rooms/:roomId/style" component={StyleSelectionPage} />
            <Route path="/rooms/:roomId/summary" component={SummaryPage} />
            <Route path="/rooms/:roomId/generating" component={GeneratingPage} />
            <Route path="/rooms/:roomId/results" component={ResultsPage} />
            <Route>
              <LandingPage />
            </Route>
          </Switch>
        </AppShell>
      </AppFlowProvider>
    </AuthProvider>
  );
}
