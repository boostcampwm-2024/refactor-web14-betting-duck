import { z } from "zod";
import { StatusCodeSchema, StatusMessageSchema } from "../../../vars/status";

const passwordStrength = (password: string) => {
  const hasNumber = /\d/.test(password);
  const hasLower = /[a-z]/.test(password);

  return hasNumber && hasLower;
};

export const userCommonSchema = z.object({
  nickname: z.string().min(1, "닉네임은 1자 이상이어야 합니다."),
  password: z
    .string()
    .refine(
      passwordStrength,
      "비밀번호는 영문 소문자, 숫자를 포함해야 합니다.",
    ),
});

export const commonUserResponseSchema = z.object({
  status: StatusCodeSchema,
  data: z.object({
    message: StatusMessageSchema,
  }),
});
