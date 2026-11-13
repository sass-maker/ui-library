import * as React from "react"
import { inputStyles } from "../lib/native-primitives"
export { inputStyles } from "../lib/native-primitives"


function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={inputStyles(type, className)} {...props} />
}

export { Input }
