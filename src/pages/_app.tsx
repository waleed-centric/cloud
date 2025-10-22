import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AppProvider } from "@/context/AppContext";
import { PricingProvider } from "@/context/PricingContext";
import { CloudProviderProvider } from "@/context/CloudProviderContext";
import { ApiProvider } from "@/context/ApiContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CloudProviderProvider>
      <AppProvider>
        <PricingProvider>
          <ApiProvider>
            <Component {...pageProps} />
          </ApiProvider>
        </PricingProvider>
      </AppProvider>
    </CloudProviderProvider>
  );
}
