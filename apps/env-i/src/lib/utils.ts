import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple store hook for client-side state
export const createStore = <TState extends object>(
  initialState: TState
) => {
  let state = initialState
  const listeners = new Set<(state: TState) => void>()

  const getState = () => state

  const setState = (newState: Partial<TState>) => {
    state = { ...state, ...newState }
    listeners.forEach((listener) => listener(state))
  }

  const subscribe = (listener: (state: TState) => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  return { getState, setState, subscribe }
}
