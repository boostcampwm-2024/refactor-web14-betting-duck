import { createZodDto } from "nestjs-zod";
import { requestSignInSchema } from "@betting-duck/shared";

export class SignInUserRequestDto extends createZodDto(requestSignInSchema) {}
