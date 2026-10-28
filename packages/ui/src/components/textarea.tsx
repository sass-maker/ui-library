import * as React from "react"
import { nativeControlStyles } from "../lib/native-control-styles"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={nativeControlStyles("textarea", { className })}
      {...props}
    />
  )
}

export { Textarea }
