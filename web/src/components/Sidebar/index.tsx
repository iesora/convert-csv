import { useRouter } from "next/router";
import { Layout, Menu, MenuProps, Image } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { accentTextColor, themeColor } from "@/utils/colors";
import { useAPIAuthenticate } from "@/hook/api/auth/useAPIAuthenticate";
import { notification } from "antd";
import { useEffect } from "react";
const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const router = useRouter();
  const currentPath = router.pathname || "/";
  const { mutate: mutateAuthenticate, data: user } = useAPIAuthenticate();

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      if (confirm("ログアウトしますか？")) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("isLogin");
        notification.success({
          message: "ログアウトしました",
          description: "正常にログアウトしました。",
          duration: 2,
        });
        router.push("/auth/sign-in");
      }
      return;
    }
    router.push(key);
  };
  useEffect(() => {
    if (user === undefined) {
      mutateAuthenticate();
    }
  }, [mutateAuthenticate, user]);

  const menuItems: MenuProps["items"] = [
    { key: "/", icon: <HomeOutlined />, label: "ホーム" },
    { key: "/test", icon: <HomeOutlined />, label: "テスト" },
    { key: "logout", icon: <HomeOutlined />, label: "ログアウト" },
  ];

  return (
    <Sider
      width={220}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        backgroundColor: themeColor,
      }}
      className="sidebar"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div
          style={{
            marginLeft: "16px",
            marginRight: "8px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: accentTextColor,
            }}
          >
            Excelコンバーター
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
        }}
      >
        <Menu
          mode="inline"
          selectedKeys={[currentPath]}
          onClick={handleMenuClick}
          items={menuItems}
          theme="light"
          style={{ backgroundColor: themeColor, borderRight: 0 }}
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
