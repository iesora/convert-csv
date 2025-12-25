import { AxiosError } from "axios";
import { useMutation, UseMutationOptions } from "react-query";
import { User } from "@/type";
import { axiosInstance } from "@/utils/url";
import { authenticateURL } from "@/utils/url/auth";
import { useQuery } from "react-query";
import { jwtJsonHeader } from "@/utils/url/header";

const apiAuthenticate = async () => {
  const response = await axiosInstance.get(authenticateURL, {
    headers: jwtJsonHeader,
  });

  return response.data;
};

export const useAPIAuthenticate = (
  mutationOptions?: UseMutationOptions<User, AxiosError, unknown, unknown>
) => {
  return useMutation<User, AxiosError>(apiAuthenticate, mutationOptions);
};

export const useQueryAPIAuthenticate = () => {
  return useQuery<User, AxiosError>("apiAuthenticate", () => apiAuthenticate());
};
