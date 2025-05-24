import { z } from "zod";
import { channelSchema, responseSchema } from "../shared";

export const requestCreateBetroomSchema = z.object({
  channel: z.object({
    title: z.string().min(2, "방 제목은 2자 이상이어야 합니다."),
    options: z.object({
      option_1: z.string().min(2, "옵션 1은 2자 이상이어야 합니다."),
      option_2: z.string().min(2, "옵션 2은 2자 이상이어야 합니다."),
    }),
    settings: z.object({
      duration: z.number().int().positive("타이머는 양수여야 합니다."),
      defaultBetAmount: z.number().int().positive("타이머는 양수여야 합니다."),
    }),
  }),
});

const validateUrl = (url: string) => {
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
};

export const responseBetRoomInfo = z.object({
  channel: channelSchema,
  message: z.string(),
});

export const bettingRoomInfoSchema = responseBetRoomInfo.extend({
  isPlaceBet: z.boolean(),
  placeBetAmount: z.number(),
});

export type BettingRoomInfo = z.infer<typeof bettingRoomInfoSchema>;

const betroomsCommonSchema = responseSchema.extend({
  data: z.object({
    title: z.string().min(2, "방 제목은 2자 이상이어야 합니다."),
    url: z.string().refine(validateUrl, "URL 형식이 올바르지 않습니다."),
  }),
});

export const responseBetroomSchema = betroomsCommonSchema.extend({
  data: z.object({
    bet_room_id: z.string(),
  }),
});
