import { z } from "zod";

const creatorSchema = z.object({ id: z.number().int().positive() });
const optionSchema = z.object({ name: z.string() });
const settingsSchema = z.object({
  defaultBetAmount: z.number().int().positive(),
  duration: z.number().int().positive(),
});

export const channelSchema = z.object({
  id: z.string(),
  title: z.string(),
  creator: creatorSchema,
  options: z.object({ option1: optionSchema, option2: optionSchema }),
  status: z.enum(["waiting", "active", "timeover", "finished"]),
  settings: settingsSchema,
  metadata: z.object({
    createdAt: z.string().datetime(),
    startAt: z.string().datetime().nullable(),
    endAt: z.string().datetime().nullable(),
  }),
  urls: z.object({ invite: z.string().url() }),
  isAdmin: z.boolean(),
});

export type ChannelType = z.infer<typeof channelSchema>;

// summary 용으로 pick
export const summaryChannelSchema = channelSchema.pick({
  title: true,
  options: true,
  status: true,
  settings: true,
});
