import { useState, useEffect, useRef } from "react";
import { BettingRoomInfo } from "@betting-duck/shared";

const INTERVAL_MS = 50;
const END_OFFSET_MS = 1800;
const TIMER_INITIAL = 0;
const PERCENTAGE_MAX = 100;
const PERCENTAGE_MIN = 0;
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const TIME_PADDING_LENGTH = 2;

export function useVotingTimer(
  metadata: BettingRoomInfo["channel"]["metadata"],
  socket: ReturnType<typeof import("@/shared/hooks/useSocketIo").useSocketIO>,
) {
  const { startAt, endAt } = metadata;
  const [remaining, setRemaining] = useState(TIMER_INITIAL);
  const [progress, setProgress] = useState(TIMER_INITIAL);
  const [active, setActive] = useState(false);
  const timerRef = useRef<number>();

  useEffect(() => {
    if (!startAt || !endAt) return;

    const startMs = new Date(startAt).getTime();
    const endMs = new Date(endAt).getTime() - END_OFFSET_MS;
    const durationMs = endMs - startMs;

    const update = () => {
      const nowMs = Date.now();
      const remMs = endMs - nowMs;
      const pct = Math.min(
        PERCENTAGE_MAX,
        Math.max(
          PERCENTAGE_MIN,
          ((nowMs - startMs) / durationMs) * PERCENTAGE_MAX,
        ),
      );

      if (remMs <= PERCENTAGE_MIN) {
        clearInterval(timerRef.current);
        setActive(false);
        setProgress(PERCENTAGE_MAX);
        setRemaining(PERCENTAGE_MIN);
      } else {
        setActive(true);
        setRemaining(remMs);
        setProgress(pct);
      }
    };

    // 최초 업데이트
    update();
    // 아직 끝나지 않았다면 인터벌 설정
    if (Date.now() < endMs) {
      timerRef.current = window.setInterval(update, INTERVAL_MS);
    }

    // 소켓 이벤트로도 종료 처리
    const onTimeover = () => {
      clearInterval(timerRef.current);
      setActive(false);
      setProgress(PERCENTAGE_MAX);
      setRemaining(PERCENTAGE_MIN);
    };
    socket.on("timeover", onTimeover);

    return () => {
      clearInterval(timerRef.current);
      socket.off("timeover", onTimeover);
    };
  }, [startAt, endAt, socket]);

  // 남은 밀리초를 "MM:SS" 포맷으로 변환
  const format = (ms: number) => {
    const totalSeconds = Math.floor(ms / MS_PER_SECOND);
    const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
    const seconds = totalSeconds % SECONDS_PER_MINUTE;
    const mm = String(minutes).padStart(TIME_PADDING_LENGTH, "0");
    const ss = String(seconds).padStart(TIME_PADDING_LENGTH, "0");
    return `${mm}:${ss}`;
  };

  return { remaining, progress, active, format };
}
