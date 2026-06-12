import { Route, Switch } from "wouter";

import { AppShell } from "@/components/AppShell";
import { AppFlowProvider } from "@/context/AppFlowContext";
import { GeneratingPage } from "@/pages/GeneratingPage";
import { LandingPage } from "@/pages/LandingPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { StyleSelectionPage } from "@/pages/StyleSelectionPage";
import { SummaryPage } from "@/pages/SummaryPage";

export default function App() {
  return (
    <AppFlowProvider>
      <AppShell>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/style" component={StyleSelectionPage} />
          <Route path="/summary" component={SummaryPage} />
          <Route path="/generating" component={GeneratingPage} />
          <Route path="/results" component={ResultsPage} />
          <Route>
            <LandingPage />
          </Route>
        </Switch>
      </AppShell>
    </AppFlowProvider>
  );
}
