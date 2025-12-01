import { useCallback } from "react";
import { atom, useAtom } from "@/lib/jotai";

export interface LoadingContextType {
  isLoading: boolean;
  global?: boolean;
}

const initial: LoadingContextType = {
  isLoading: false,
};

export const loadingContextAtom = atom<LoadingContextType>(initial);

export function useGlobalLoading() {
  const [globalLoading, setGlobalLoading] = useAtom(loadingContextAtom);

  const updateGlobalLoading = useCallback(
    (isLoading: boolean) => {
      setGlobalLoading((prevState) => ({
        ...prevState,
        isLoading,
      }));
    },
    [setGlobalLoading],
  );

  return {
    isGlobalLoading: globalLoading.isLoading,
    setIsGlobalLoading: updateGlobalLoading,
  };
}
