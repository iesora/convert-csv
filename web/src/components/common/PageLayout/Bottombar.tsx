import { useRouter } from "next/router";
import { MenuProps } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import React from "react";
import { themeColorDeep, anRed, themeColorSuperLight } from "@/utils/colors";

const Bottombar: React.FC = () => {
  const router = useRouter();
  // router.pathname を直接利用することで、state が未設定の場合にコンポーネント全体が非表示になるのを防ぐ
  const currentPath = router.pathname || "/";

  // メニューの項目をクリックしたときにページ遷移
  const handleMenuClick: MenuProps["onClick"] = (e) => {
    if (e.key === "logout") {
      if (confirm("ログアウトしますか？")) {
        localStorage.removeItem("userToken");
        router.reload();
      }
      return;
    }
    router.push(e.key);
  };

  // ボタンの基本スタイルの高さを70pxに変更
  const baseButtonStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "20%",
    paddingTop: "6px",
    paddingBottom: "6px",
    height: "60px",
    cursor: "pointer",
  };

  // アクティブなボタンに適用するスタイル
  const activeStyle: React.CSSProperties = {
    color: "#fff",
    backgroundColor: themeColorDeep,
    // backgroundColor: "#000",
    borderBottom: `2px solid ${themeColorDeep}`,
    // borderBottom: `2px solid #000`,
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "16px",
          backgroundColor: themeColorSuperLight,
          height: "60px",
          boxShadow: "0px -2px 8px rgba(30, 28, 28, 0.05)",
        }}
        className="bottombar"
      >
        <div
          key="/"
          onClick={() => handleMenuClick({ key: "/" } as any)}
          style={{
            ...baseButtonStyle,
            ...(currentPath === "/" ? activeStyle : {}),
          }}
        >
          <HomeOutlined
            style={{
              display: "flex",
              alignItems: "center",
              height: "20px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              fontWeight: "bold",
              height: "20px",
            }}
          >
            ホーム
          </div>
        </div>
        <div
          key="/events"
          onClick={() => handleMenuClick({ key: "/events" } as any)}
          style={{
            ...baseButtonStyle,
            ...(currentPath === "/events" ? activeStyle : {}),
          }}
        >
          <CalendarOutlined
            style={{
              display: "flex",
              alignItems: "center",
              height: "20px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              fontWeight: "bold",
              height: "20px",
            }}
          >
            イベント
          </div>
        </div>
        <div
          key="/venues"
          onClick={() => handleMenuClick({ key: "/venues" } as any)}
          style={{
            ...baseButtonStyle,
            ...(currentPath === "/venues" ? activeStyle : {}),
          }}
        >
          <EnvironmentOutlined
            style={{
              display: "flex",
              alignItems: "center",
              height: "20px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              fontWeight: "bold",
              height: "20px",
            }}
          >
            会場
          </div>
        </div>
        <div
          key="/creators"
          onClick={() => handleMenuClick({ key: "/creators" } as any)}
          style={{
            ...baseButtonStyle,
            ...(currentPath === "/creators" ? activeStyle : {}),
          }}
        >
          <TeamOutlined
            style={{
              display: "flex",
              alignItems: "center",
              height: "20px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              fontWeight: "bold",
              height: "20px",
            }}
          >
            クリエイター
          </div>
        </div>
        <div
          key="logout"
          onClick={() => handleMenuClick({ key: "logout" } as any)}
          style={baseButtonStyle}
        >
          <LogoutOutlined
            style={{
              display: "flex",
              alignItems: "center",
              color: anRed,
              height: "20px",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "11px",
              fontWeight: "bold",
              color: anRed,
              height: "20px",
            }}
          >
            ログアウト
          </div>
        </div>
        <style jsx global>{`
          @media (max-width: 768px) {
            .bottombar {
              position: fixed !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              margin-bottom: 0 !important;
              z-index: 1000 !important;
              width: 100% !important;
            }
            body {
              padding-bottom: 60px !important;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default Bottombar;
