import { atomWithStorage, useAtom } from "@/lib/jotai";
import { User } from "@/types/user";
import { useCallback } from "react";

const initialState: User | null = null;

export const meContextAtom = atomWithStorage<User | null>("meContext", initialState);

export function useMe() {
  const [meContext, setMeContext] = useAtom(meContextAtom);

  const resetMe = useCallback(() => {
    setMeContext(initialState);
  }, [setMeContext]);

  return {
    me: meContext,
    setMe: setMeContext,
    resetMe,
  };
}
