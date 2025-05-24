import { z } from "zod";
import { StatusCodeSchema, StatusMessageSchema } from "../../vars/status";

export const creatorSchema = z.object({
  id: z.number().int().positive(),
});

export const optionSchema = z.object({
  name: z.string(),
});

export const settingsSchema = z.object({
  defaultBetAmount: z.number().int().positive(),
  duration: z.number().int().positive(),
});

export const channelSchema = z.object({
  id: z.string(),
  title: z.string(),
  creator: creatorSchema,
  options: z.object({
    option1: optionSchema,
    option2: optionSchema,
  }),
  status: z.enum(["waiting", "active", "timeover", "finished"]),
  settings: settingsSchema,
  metadata: z.object({
    createdAt: z.string().datetime(),
    startAt: z.string().datetime().nullable(),
    endAt: z.string().datetime().nullable(),
  }),
  urls: z.object({
    invite: z.string().url(),
  }),
  isAdmin: z.boolean(),
});

export const responseSchema = z.object({
  status: StatusCodeSchema,
  data: z.object({
    message: StatusMessageSchema,
  }),
});

export const roomIdSchema = z.object({
  roomId: z.string().min(1, "Room ID가 필요합니다."),
});

export const nicknameSchema = z.object({
  nickname: z.string().min(1, "닉네임이 필요합니다."),
});

export const messageSchema = z.string().min(1, "메시지가 필요합니다.");

export const joinRoomRequestSchema = z.object({
  channel: roomIdSchema,
});

export type joinRoomRequestType = z.infer<typeof joinRoomRequestSchema>;

export const leaveRoomRequestSchema = roomIdSchema;

export type leaveRoomRequestType = z.infer<typeof leaveRoomRequestSchema>;
