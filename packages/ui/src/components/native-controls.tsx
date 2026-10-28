import * as React from "react"
import { nativeControlStyles } from "../lib/native-control-styles"

// React 19 refs are native props, including HTMLDialogElement.showModal/close.
export { Input as NativeInput } from "./input"

export function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return <select data-slot="native-select" className={nativeControlStyles("select", { className })} {...props} />
}

export function NativeDisclosure({ className, ...props }: React.ComponentProps<"details">) {
  return <details data-slot="native-disclosure" className={nativeControlStyles("details", { className })} {...props} />
}

export function NativeSummary({ className, ...props }: React.ComponentProps<"summary">) {
  return <summary data-slot="native-summary" className={nativeControlStyles("summary", { className })} {...props} />
}

export function NativeDialog({ className, ...props }: React.ComponentProps<"dialog">) {
  return <dialog data-slot="native-dialog" className={nativeControlStyles("dialog", { className })} {...props} />
}

export function NativeProgress({ className, ...props }: React.ComponentProps<"progress">) {
  return <progress data-slot="native-progress" className={nativeControlStyles("progress", { className })} {...props} />
}
