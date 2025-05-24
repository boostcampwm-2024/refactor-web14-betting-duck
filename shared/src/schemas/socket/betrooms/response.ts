import { z } from "zod";
import { nicknameSchema } from "../../shared";
import { channelSchema, summaryChannelSchema } from "./channel";

export const responseFetchBetRoomInfoSchema = z.object({
  channel: z.object({
    id: z.string(),
    creator: nicknameSchema,
    status: z.enum(["waiting", "betting", "result"]),
    option1: z.object({ participants: z.number(), currentBets: z.number() }),
    option2: z.object({ participants: z.number(), currentBets: z.number() }),
  }),
});
export type responseFetchBetRoomInfoType = z.infer<
  typeof responseFetchBetRoomInfoSchema
>;

export const responseBetRoomInfoSchema = z.object({
  channel: channelSchema,
  message: z.string(),
});
export type responseBetRoomInfoType = z.infer<typeof responseBetRoomInfoSchema>;

// 3) Summary 응답
export const summaryResponseSchema = z.object({
  status: z.number().int().positive(),
  data: z.object({
    channel: summaryChannelSchema,
    message: z.string(),
  }),
});
export type summaryResponseType = z.infer<typeof summaryResponseSchema>;
