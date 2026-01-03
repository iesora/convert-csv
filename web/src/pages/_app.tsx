import React, { useEffect } from "react";
import "antd/dist/reset.css"; // Ant Design の CSS リセット
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "react-query";
import { Spin } from "antd";

const AuthProvider: React.FC<{
  children: React.ReactElement;
}> = ({ children }) => {
  return <>{children}</>;
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  const theme = {
    styles: {
      global: {
        "html, body": {
          overflow: "auto",
          width: "100%",
          position: "relative",
          padding: 0,
          margin: 0,
          background: "#f4f4f4",
          lineHeight: "100%",
          fontFamily:
            "'游ゴシック体', YuGothic, '游ゴシック', 'Yu Gothic', sans-serif",
        },
      },
    },
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default MyApp;
