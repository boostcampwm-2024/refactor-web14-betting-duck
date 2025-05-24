import { useState, useCallback } from "react";
import { z } from "zod";
import type { BettingRoomInfo } from "@betting-duck/shared";

const NUM_SCHEMA = z.coerce.number().int().positive();
const MAX_LEN = 10;

export interface UseBetInput {
  value: string;
  errors: { isText: boolean; isLong: boolean; isOver: boolean };
  onChange: (v: string) => void;
}

export function useBettingInput(
  roomInfo: BettingRoomInfo,
  userDuck: number,
): UseBetInput {
  const { isPlaceBet, placeBetAmount } = roomInfo;
  const [value, setValue] = useState<string>(
    isPlaceBet ? String(placeBetAmount) : "",
  );
  const [errors, setErrors] = useState({
    isText: false,
    isLong: false,
    isOver: false,
  });

  const validate = useCallback(
    (v: string) => {
      const errs = { isText: false, isLong: false, isOver: false };
      if (v === "") return errs;
      if (+v > userDuck) errs.isOver = true;
      if (v.length > MAX_LEN) errs.isLong = true;
      errs.isText = !NUM_SCHEMA.safeParse(v).success;
      return errs;
    },
    [userDuck],
  );

  const onChange = useCallback(
    (v: string) => {
      const errs = validate(v);
      setErrors(errs);
      setValue(v);
    },
    [validate],
  );

  return { value, errors, onChange };
}
