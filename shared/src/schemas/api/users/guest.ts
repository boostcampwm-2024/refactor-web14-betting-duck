import { z } from "zod";
import { userCommonSchema } from "./common";

export const requestGuestSignInSchema = z.object({
  nickname: z.string().min(1, "닉네임은 1자 이상이어야 합니다."),
});

export const requestUpgradeGuest = userCommonSchema.extend({
  email: z
    .string()
    .email("이메일 형식이여야 합니다.")
    .min(6, "이메일은 6자 이상이어야 합니다."),
});
