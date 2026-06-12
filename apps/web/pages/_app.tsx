import type { AppProps } from "next/app";
import { SupabaseProvider } from "../lib/SupabaseProvider";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SupabaseProvider>
      <Component {...pageProps} />
    </SupabaseProvider>
  );
}
