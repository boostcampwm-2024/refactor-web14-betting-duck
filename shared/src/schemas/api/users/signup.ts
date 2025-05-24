import { z } from "zod";
import { commonUserResponseSchema, userCommonSchema } from "./common";

export const responseSignUpSchema = commonUserResponseSchema;

export const requestSignUpSchema = userCommonSchema.extend({
  email: z
    .string()
    .email("이메일 형식이여야 합니다.")
    .min(6, "이메일은 6자 이상이어야 합니다."),
});
