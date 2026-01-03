import React, { ReactNode } from "react";
import { Layout, theme } from "antd";
import Sidebar from "@/components/Sidebar";

const { Content } = Layout;

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout style={{ minHeight: "100vh" }} hasSider>
      <Sidebar />
      <Layout
        style={{
          marginInlineStart: 220,
          backgroundColor: "#FFFFFF",
        }}
        className="main-layout"
      >
        <Content
          style={{
            margin: "16px 16px",
          }}
          className="main-content"
        >
          <div
            style={{
              background: colorBgContainer,
              minHeight: 280,
              padding: 24,
              borderRadius: borderRadiusLG,
            }}
            className="content-wrapper"
          >
            {children}
          </div>
        </Content>
      </Layout>
      <style jsx global>{`
        @media (max-width: 768px) {
          .main-layout {
            margin-inline-start: 0 !important;
          }
          .main-content {
            margin: 8px 8px !important;
          }
          .content-wrapper {
            padding: 16px !important;
          }
        }
      `}</style>
    </Layout>
  );
};

export default PageLayout;
