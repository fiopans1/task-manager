import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import store from "@/redux/store";
import { ThemeProvider } from "@/shared/theme/ThemeProvider";
import { Toaster } from "@/shared/feedback/Toaster";
import { TooltipProvider } from "@/shared/ui/tooltip";

export function AppProviders({ children }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <HelmetProvider>
          <BrowserRouter>
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster />
            </TooltipProvider>
          </BrowserRouter>
        </HelmetProvider>
      </ThemeProvider>
    </Provider>
  );
}
