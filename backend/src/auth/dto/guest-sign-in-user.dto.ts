import { createZodDto } from "nestjs-zod";
import { requestGuestSignInSchema } from "@betting-duck/shared";

export class GuestSignInUserDto extends createZodDto(
  requestGuestSignInSchema,
) {}
