import { z } from "zod";
import { USER_ROLE } from "../../../vars/user";
import { commonUserResponseSchema } from "./common";

export const requestSignInSchema = z.object({
  email: z
    .string()
    .email("이메일 형식이여야 합니다.")
    .min(6, "이메일은 6자 이상이어야 합니다."),
  password: z.string().min(1, "비밀번호는 1자 이상이어야 합니다."),
});

export const responseSignInSchema = commonUserResponseSchema.extend({
  data: z.object({
    role: z.enum(USER_ROLE),
    accessToken: z.string(),
    nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
  }),
});
