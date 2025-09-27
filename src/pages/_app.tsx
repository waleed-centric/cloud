import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppProvider } from "@/context/AppContext";
import { PricingProvider } from "@/context/PricingContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppProvider>
      <PricingProvider>
        <Component {...pageProps} />
      </PricingProvider>
    </AppProvider>
  );
}
