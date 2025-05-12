import { type AppType } from "next/dist/shared/lib/utils";
import Head from "next/head";
import "~/styles/globals.css";
import { AuthProvider } from "~/context/AuthContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
      <Head>
        <title>LingoPlay</title>
        <meta name="description" content="App to learn languages" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0A0" />
        <link rel="manifest" href="/app.webmanifest" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
};

export default MyApp;
