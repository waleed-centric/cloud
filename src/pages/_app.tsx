import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppProvider } from "@/context/AppContext";
import { PricingProvider } from "@/context/PricingContext";
import { CloudProviderProvider } from "@/context/CloudProviderContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CloudProviderProvider>
      <AppProvider>
        <PricingProvider>
          <Component {...pageProps} />
        </PricingProvider>
      </AppProvider>
    </CloudProviderProvider>
  );
}
