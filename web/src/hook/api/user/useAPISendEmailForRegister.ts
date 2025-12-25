import { AxiosError } from "axios";
import { useMutation, UseMutationOptions } from "react-query";
import { axiosInstance } from "@/utils/url";
import { sendEmailForRegisterURL } from "@/utils/url/user";
import { tokenString } from "@/utils/url/header";

interface SendEmailForRegisterDto {
  email: string;
  password: string;
}

const sendEmailForRegister = async (values: SendEmailForRegisterDto) => {
  const response = await axiosInstance.post(sendEmailForRegisterURL, values, {
    headers: {
      Authorization: `Bearer ${tokenString()}`,
    },
  });
  return response.data;
};

export const useAPISendEmailForRegister = (
  mutationOptions?: UseMutationOptions<
    void,
    AxiosError,
    SendEmailForRegisterDto
  >
) => {
  return useMutation<void, AxiosError, SendEmailForRegisterDto>(
    sendEmailForRegister,
    mutationOptions
  );
};
