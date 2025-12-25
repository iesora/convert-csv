import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import { useCallback } from "react";
import { User } from "@/type";

export type LoginUserState = {
  user: User | undefined;
  isAuthenticated: boolean;
  isInitialized: boolean;
  lineUserId: string | undefined;
};

export type UseLoginUserMutors = {
  setUser: (user: User | undefined) => void;
  logout: () => void;
  initializeAuth: () => void;
  setLineUserId: (lineUserId: string | undefined) => void;
};

export const loginUserState = atom<LoginUserState>({
  key: "loginUser",
  default: {
    user: undefined,
    isAuthenticated: false,
    isInitialized: false,
    lineUserId: undefined,
  },
});

export const useLoginUserState = (): LoginUserState => {
  return useRecoilValue(loginUserState);
};

export const useLoginUserMutors = (): UseLoginUserMutors => {
  const setState = useSetRecoilState(loginUserState);
  const setUser = useCallback(
    (user: User | undefined) => {
      setState((state) => {
        return {
          ...state,
          user,
          isAuthenticated: !!user,
          isInitialized: true,
          lineUserId: undefined,
        };
      });
    },
    [setState]
  );
  const logout = useCallback(() => {
    // トークンを削除
    localStorage.removeItem("userToken");

    // ユーザー情報を初期化
    setState({
      user: undefined,
      isAuthenticated: false,
      isInitialized: true,
      lineUserId: undefined,
    });

    // ページを強制リロードして確実に認証状態をリセット
    window.location.href = "/auth/sign-in";
  }, [setState]);

  const initializeAuth = useCallback(() => {
    setState((state) => ({
      ...state,
      isInitialized: true,
    }));
  }, [setState]);

  const setLineUserId = useCallback(
    (lineUserId: string | undefined) => {
      setState((state) => ({
        ...state,
        lineUserId,
      }));
    },
    [setState]
  );

  return {
    setUser,
    logout,
    initializeAuth,
    setLineUserId,
  };
};
