import { createZodDto } from "nestjs-zod";
import { requestUpgradeGuest } from "@betting-duck/shared";

export class UpgradeGuestRequestDto extends createZodDto(requestUpgradeGuest) {}
