import { createZodDto } from "nestjs-zod";
import { requestSignUpSchema } from "@betting-duck/shared";
import { responseSignUpSchema } from "@betting-duck/shared";

export class SignUpUserRequestDto extends createZodDto(requestSignUpSchema) {}

export class SignUpUserResponseDto extends createZodDto(responseSignUpSchema) {}
