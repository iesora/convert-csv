import { AxiosError } from "axios";
import { useMutation, UseMutationOptions } from "react-query";
import { axiosInstance } from "@/utils/url";
import { createForClerkURL } from "@/utils/url/user";
import { tokenString } from "@/utils/url/header";

interface CreateForClerkDto {
  email: string;
  password: string;
}

const createForClerk = async (values: CreateForClerkDto) => {
  const response = await axiosInstance.post(createForClerkURL, values, {
    headers: {
      Authorization: `Bearer ${tokenString()}`,
    },
  });
  return response.data;
};

export const useAPICreateForClerk = (
  mutationOptions?: UseMutationOptions<void, AxiosError, CreateForClerkDto>
) => {
  return useMutation<void, AxiosError, CreateForClerkDto>(
    createForClerk,
    mutationOptions
  );
};
