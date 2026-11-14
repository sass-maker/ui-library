import * as React from "react"
import { textareaStyles } from "../lib/native-primitives"
export { textareaStyles } from "../lib/native-primitives"


function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={textareaStyles(className)} {...props} />
}

export { Textarea }
