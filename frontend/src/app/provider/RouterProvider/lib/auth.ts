import { atom } from "recoil";

export type AuthState = {
  isAuthenticated: boolean;
  nickname?: string;
  roomId?: string;
};

export const Auth = atom<AuthState>({
  key: "auth",
  default: {
    isAuthenticated: false,
    nickname: undefined,
    roomId: undefined,
  },
});
