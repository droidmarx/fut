"use client"

// Inspired by react-hot-toast library
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"


const WHISTLE_SOUND_DATA_URI = 'data:audio/mp3;base64,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';
const NOTIFICATION_SOUND_DATA_URI = 'data:audio/mp3;base64,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';

function playSound(soundDataUri: string) {
  try {
    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
      const audio = new Audio(soundDataUri);
      audio.volume = 0.5;
      audio.play().catch(error => {
        // Autoplay can be blocked by the browser.
        console.log("A reprodução do som foi impedida pelo navegador.");
      });
    }
  } catch (error) {
    console.error("Falha ao tocar o som:", error);
  }
}

/**
 * Plays the whistle sound effect.
 */
export function playWhistleSound() {
  playSound(WHISTLE_SOUND_DATA_URI);
}

/**
 * Plays the notification sound effect.
 * This is the sound provided by the user.
 */
export function playNotificationSound() {
  playSound(NOTIFICATION_SOUND_DATA_URI);
}


const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
