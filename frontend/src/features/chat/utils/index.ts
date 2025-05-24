import { UserInfo } from "@betting-duck/shared";

export const getRandomColor = () => {
  const colors = [
    "text-pink-500",
    "text-purple-500",
    "text-blue-500",
    "text-orange-500",
    "text-red-500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getRandomRadius = () => {
  const radiuses = [
    "rounded-tl-lg rounded-bl-lg",
    "rounded-tl-lg rounded-bl-lg rounded-br-lg",
    "rounded-tl-lg rounded-bl-lg rounded-bl-lg",
    "rounded-tl-lg rounded-bl-lg rounded-bl-lg",
  ];
  return radiuses[Math.floor(Math.random() * radiuses.length)];
};
export function generateRandomNickname(userInfo: UserInfo) {
  const adjectives = [
    "춤추는",
    "잠든",
    "꿈꾸는",
    "웃는",
    "날아가는",
    "바쁜",
    "느린",
    "귀여운",
    "신비한",
    "힙한",
    "멋진",
    "똑똑한",
    "용감한",
    "아기",
    "행복한",
  ];

  const nouns = [
    "우주인",
    "마법사",
    "요정",
    "용",
    "음악가",
    "과학자",
    "탐험가",
    "화가",
    "요리사",
    "작가",
    "도둑",
    "기사",
    "해적",
    "수호자",
    "악당",
  ];

  if (!userInfo.nickname) {
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdj} ${randomNoun}`;
  }

  return userInfo.nickname;
}

export const createSendMessagePayload = (
  roomId: string,
  userInfo: UserInfo,
  text: string,
) => ({
  sender: {
    nickname: generateRandomNickname(userInfo),
  },
  channel: {
    roomId: roomId,
  },
  message: text.trim(),
});
