import { z } from "zod";
import { USER_ROLE } from "../../../vars/user";
import { StatusMessageSchema } from "../../../vars/status";

export const userInfoSchema = z.object({
  message: StatusMessageSchema,
  role: z.enum(USER_ROLE),
  nickname: z.string().min(2, "닉네임은 2자 이상이어야 합니다."),
  duck: z.coerce.number().int().nonnegative(),
  realDuck: z.coerce.number().int().nonnegative(),
});

export type UserInfo = z.infer<typeof userInfoSchema>;

export const authenticatedUserInfoSchema = z.object({
  userInfo: userInfoSchema,
  isAuthenticated: z.boolean(),
});

export type AuthenticateUserInfo = z.infer<typeof authenticatedUserInfoSchema>;
