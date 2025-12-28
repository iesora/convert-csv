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
      <Layout style={{ marginInlineStart: 220, backgroundColor: "#FFFFFF" }}>
        <Content style={{ margin: "16px 16px" }}>
          <div
            style={{
              background: colorBgContainer,
              minHeight: 280,
              padding: 24,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PageLayout;
