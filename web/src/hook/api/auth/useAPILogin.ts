import { useMutation, UseMutationOptions } from "react-query";
import { axiosInstance } from "@/utils/url";
import { loginURL } from "../../../utils/url/auth";
import { User } from "@/type";

interface LoginResponse {
  user: User;
  token: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

const login = async (user: LoginRequest) => {
  const response = await axiosInstance.post(loginURL, user);
  return response.data;
};

export const useLogin = (
  mutationOptions?: UseMutationOptions<
    LoginResponse,
    Error,
    LoginRequest,
    unknown
  >
) => {
  return useMutation<LoginResponse, Error, LoginRequest>(
    (user) => login(user),
    mutationOptions
  );
};
