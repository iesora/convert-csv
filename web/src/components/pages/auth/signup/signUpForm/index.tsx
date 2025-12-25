import React from "react";
import Link from "next/link";
import { Box } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAPISendEmailForRegister } from "@/hook/api/user/useAPISendEmailForRegister";
import { useAPICreateForClerk } from "@/hook/api/user/useAPICreateForClerk";
import { useRouter } from "next/router";
import { IoIosArrowBack } from "react-icons/io";

const SignUpForm = () => {
  interface FormValues {
    email: string;
    password: string;
    passwordConfirm: string;
  }

  const router = useRouter();

  const schema: yup.ObjectSchema<FormValues> = yup.object({
    email: yup.string().required("必須"),
    password: yup.string().required("必須"),
    passwordConfirm: yup
      .string()
      .required("必須")
      .oneOf(
        [yup.ref("password")],
        "パスワード(確認)と新しいパスワードが一致しません"
      ),
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: createUser } = useAPICreateForClerk();

  const onSubmit = (form: FormValues) => {
    createUser(
      {
        email: form.email,
        password: form.password,
      },
      {
        onSuccess: () => {
          alert("ユーザーをを作成しました。");
          router.push("/auth/sign-in");
        },
        onError: () => {
          alert("エラーが発生しました。");
        },
      }
    );
  };

  return (
    <Box overflow={"scroll"} h={"100vh"}>
      <Box height="80px" p="10px">
        <Button
          variant="outline"
          borderColor="lightgray"
          borderRadius="20px"
          onClick={() => {
            router.push("/");
          }}
        >
          <IoIosArrowBack />
          &nbsp; 戻る
        </Button>
      </Box>
      <div className="authenticationBox">
        <Box
          as="main"
          sx={{
            maxWidth: "510px",
            ml: "auto",
            mr: "auto",
          }}
        >
          <Box>
            <Box fontSize="28px" fontWeight="700" mb="20px">
              アカウント作成{" "}
            </Box>

            <Box fontSize="15px" mb="12px">
              &nbsp;アカウントを既に持っていますか？{" "}
              {/*
              <Link
                href="/auth/sign-in"
                className="primaryColor text-decoration-none"
              >
                Sign In
              </Link>
              */}
              <Button
                alignItems="center"
                variant="unstyled"
                color="blue"
                onClick={() => {
                  router.push("/auth/sign-in");
                }}
              >
                &nbsp;&nbsp;ログイン
              </Button>
            </Box>
            <Box
              sx={{
                background: "#fff",
                padding: "30px 20px",
                borderRadius: "10px",
                mb: "20px",
                boxShadow: "0px 1px 12px 1px rgba(0,0,0,0.05)",
              }}
              className="bg-black"
            >
              <Box as="form">
                <Box>
                  <Box
                    as="label"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "10px",
                      display: "block",
                    }}
                  >
                    メールアドレス
                  </Box>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }): JSX.Element => (
                      <Input {...field} placeholder="例: aaa@example.com" />
                    )}
                  />
                  {errors.email && (
                    <Box
                      sx={{
                        marginTop: "6px",
                        marginBottom: "12px",
                        fontSize: "14px",
                      }}
                    >
                      <Box color={"red"}>{errors.email.message}</Box>
                    </Box>
                  )}
                  <Box mb="20px" />
                  <Box
                    as="label"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "10px",
                      display: "block",
                    }}
                  >
                    パスワード
                  </Box>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }): JSX.Element => (
                      <Input type={"password"} {...field} />
                    )}
                  />
                  {errors.password && (
                    <Box
                      sx={{
                        marginTop: "6px",
                        marginBottom: "12px",
                        fontSize: "14px",
                      }}
                    >
                      <Box color={"red"}>{errors.password.message}</Box>
                    </Box>
                  )}
                  <Box mb="20px" />
                  <Box
                    as="label"
                    sx={{
                      fontWeight: "500",
                      fontSize: "14px",
                      mb: "10px",
                      display: "block",
                    }}
                  >
                    パスワード(確認)
                  </Box>
                  <Controller
                    name="passwordConfirm"
                    control={control}
                    render={({ field }): JSX.Element => (
                      <Input type={"password"} {...field} />
                    )}
                  />
                  {errors.passwordConfirm && (
                    <Box
                      sx={{
                        marginTop: "6px",
                        marginBottom: "12px",
                        fontSize: "14px",
                      }}
                    >
                      <Box color={"red"}>{errors.passwordConfirm.message}</Box>
                    </Box>
                  )}
                  <Box mb="20px" />
                </Box>
                <Button type="submit" onClick={handleSubmit(onSubmit)}>
                  作成
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </div>
    </Box>
  );
};

export default SignUpForm;
