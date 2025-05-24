import { z } from "zod";

export const bettingProgressInfoSchema = z.object({
  channel: z.object({
    creator: z.string(),
    status: z.enum(["waiting", "active", "timeover", "finished"]),
    option1: z.object({
      participants: z.coerce.number().int().lte(Number.MAX_SAFE_INTEGER),
      currentBets: z.coerce.number().int().lte(Number.MAX_SAFE_INTEGER),
    }),
    option2: z.object({
      participants: z.coerce.number().int().lte(Number.MAX_SAFE_INTEGER),
      currentBets: z.coerce.number().int().lte(Number.MAX_SAFE_INTEGER),
    }),
  }),
});

export type BettingProgressInfoType = z.infer<typeof bettingProgressInfoSchema>;

export const userBettingStatusSchema = z.object({
  betAmount: z.coerce.number().int().min(0),
  selectedOption: z.union([
    z.literal("option1"),
    z.literal("option2"),
    z.literal("none"),
  ]),
});

export type UserBettingStatusType = z.infer<typeof userBettingStatusSchema>;
