import * as React from "react"
import { nativeControlStyles } from "../lib/native-control-styles"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={nativeControlStyles("input", { type, className })}
      {...props}
    />
  )
}

export { Input }
