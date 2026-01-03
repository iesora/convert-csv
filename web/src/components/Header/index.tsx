import { Layout, Menu, MenuProps } from "antd";
import {
  themeColor,
  themeColorDeep,
  themeColorSuperLight,
  themeColorSuperSuperLight,
} from "@/utils/colors";
import { HomeOutlined } from "@ant-design/icons";
import { CalendarOutlined } from "@ant-design/icons";
import { EnvironmentOutlined } from "@ant-design/icons";
import { TeamOutlined } from "@ant-design/icons";
import { LogoutOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import "@/styles/pages/Header.scss";

const { Header: AntdHeader } = Layout;

type HeaderProps = {
  withBottombar: boolean;
};

const Header = ({ withBottombar }: HeaderProps) => {
  const router = useRouter();
  const currentPath = router.pathname || "/";

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      if (confirm("ログアウトしますか？")) {
        localStorage.removeItem("userToken");
        router.reload();
      }
      return;
    }
    router.push(key);
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "ホーム",
    },
    {
      key: "/events",
      icon: <CalendarOutlined />,
      label: "イベント",
    },
    {
      key: "/venues",
      icon: <EnvironmentOutlined />,
      label: "会場",
    },
    {
      key: "/creators",
      icon: <TeamOutlined />,
      label: "クリエイター",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "ログアウト",
    },
  ];
  return (
    <>
      <AntdHeader
        style={{
          backgroundColor: themeColorSuperLight,
          height: withBottombar ? 60 : 80,
          lineHeight: withBottombar ? "60px" : "80px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: withBottombar ? "flex-start" : "space-between",
          paddingLeft: "5%",
          paddingRight: "5%",
          width: "100%",
          borderBottom: "1px solid #e0e0e0",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
        }}
        className="header"
      >
        <img
          src={"/vmLogo_removedBg.png"}
          alt="logo"
          style={{
            marginRight: "10%",
            width: withBottombar ? 71 : 95,
            height: withBottombar ? 60 : 80,
          }}
          className="header-logo"
        />

        {!withBottombar && (
          <div style={{ width: "90%" }} className="header-menu">
            <Menu
              mode="horizontal"
              selectedKeys={[currentPath]}
              onClick={handleMenuClick}
              items={menuItems}
              style={{
                flex: 1,
                justifyContent: "right",
                backgroundColor: themeColorSuperLight,
              }}
            />
          </div>
        )}
      </AntdHeader>
      <style jsx global>{`
        @media (max-width: 768px) {
          .header {
            padding-left: 16px !important;
            padding-right: 16px !important;
            height: 60px !important;
            line-height: 60px !important;
          }
          .header-logo {
            width: 50px !important;
            height: 50px !important;
            margin-right: 8px !important;
          }
          .header-menu {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
