import { useEffect } from "react";

export function useLoadEnv(setEnvMap: (envMap: string) => void) {
  useEffect(() => {
    async function loadEnvMap() {
      const env = await import(
        "@assets/models/industrial_sunset_puresky_4k.hdr"
      );
      setEnvMap(env.default);
    }
    loadEnvMap();
  }, [setEnvMap]);
}
