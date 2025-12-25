import React from "react";
import { Input, Button, Form } from "antd";
import { useLogin } from "@/hook/api/auth/useAPILogin";
import { useRouter } from "next/router";
import {
  themeColor,
  themeColorLight,
  themeColorSuperLight,
} from "@/utils/colors";

type FieldType = {
  email: string;
  password: string;
};

const SignInForm = () => {
  const { mutate: login } = useLogin();
  const router = useRouter();
  const [form] = Form.useForm();
  const handleSubmit = (values: FieldType) => {
    login(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (response) => {
          const asyncLocalStorage = {
            setItem: async function (key: string, value: string) {
              return Promise.resolve().then(function () {
                localStorage.setItem(key, value);
              });
            },
            getItem: async function (key: string): Promise<string> {
              return Promise.resolve().then(function () {
                return localStorage.getItem(key) || "";
              });
            },
          };
          asyncLocalStorage
            .setItem("userToken", response.token || "")
            .then(function (): Promise<string> {
              return asyncLocalStorage.getItem("userToken");
            })
            .then(function (value) {
              if (value) {
                router.push("/");
              }
            });
          setTimeout(() => {
            router.push("/");
          }, 3000);
        },
        onError: () => {
          alert("ログインに失敗しました。");
        },
      }
    );
  };

  return (
    <div
      style={{
        backgroundColor: themeColor,
        height: "100vh",
        overflow: "visible",
      }}
    >
      <div
        style={{
          width: "510px",
          maxWidth: "85%",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "100px 0 0",
        }}
      >
        {/*
          <div fontSize="15px" mb="12px">
            &nbsp;アカウントを持っていない場合：{" "}
            <Button
              alignItems="center"
              variant="unstyled"
              color="blue"
              onClick={() => {
                router.push("/auth/sign-up");
              }}
            >
              &nbsp;&nbsp;アカウント作成
            </Button>
          </div>
          */}

        {/*<FormControl noValidate onSubmit={handleSubmit}>*/}
        <div
          style={{
            background: themeColorLight,
            padding: "30px 20px",
            borderRadius: "10px",
            marginBottom: "40px",
            boxShadow: "0px 1px 12px 1px rgba(0,0,0,0.05)",
            // width: "490px",
            // maxWidth: "80%",
          }}
          className="bg-black"
        >
          <Form form={form} onFinish={handleSubmit}>
            <img
              src={"/vmLogo_removedBg.png"}
              alt="logo"
              style={{
                width: 200,
                height: 170,
                marginBottom: "24px",
                display: "flex",
                justifySelf: "center",
              }}
            />
            <div
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                marginBottom: "24px",
              }}
            >
              ログイン
            </div>
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontWeight: "500",
                  fontSize: "14px",
                  marginBottom: "10px",
                  display: "block",
                }}
              >
                メールアドレス
              </div>
              <Form.Item<FieldType> name="email">
                <Input id="email" type="email" name="email" />
              </Form.Item>
            </div>
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  fontWeight: "500",
                  fontSize: "14px",
                  marginBottom: "10px",
                  display: "block",
                }}
              >
                パスワード
              </div>
              <Form.Item<FieldType> name="password">
                <Input id="password" type="password" name="password" />
              </Form.Item>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginRight: "4px",
              }}
            >
              <Form.Item>
                <Button
                  htmlType="submit"
                  style={{ backgroundColor: themeColorSuperLight }}
                >
                  ログイン
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignInForm;
