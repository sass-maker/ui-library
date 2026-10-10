// A deliberately small JSX-to-HTML runtime; no DOM or React at runtime.
export const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
      })[c],
  );
export const raw = (html) => ({ html });
const render = (v) =>
  Array.isArray(v)
    ? v.map(render).join("")
    : v == null || typeof v === "boolean"
      ? ""
      : typeof v === "object" && "html" in v
        ? v.html
        : escapeHtml(v);
export const Fragment = ({ children }) => raw(render(children));
const aliases = {
  className: "class",
  htmlFor: "for",
  defaultChecked: "checked",
  defaultValue: "value",
  autoComplete: "autoComplete",
  maxLength: "maxLength",
  minLength: "minLength",
  formAction: "formAction",
  fillRule: "fill-rule",
  strokeWidth: "stroke-width",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
};
const booleans = new Set([
  "required",
  "checked",
  "disabled",
  "multiple",
  "hidden",
]);
const voids = new Set(["input", "img", "br", "hr", "meta", "link"]);
export function h(tag, props, ...children) {
  props ||= {};
  if (typeof tag === "function") return tag({ ...props, children });
  let attrs = "";
  for (let [key, value] of Object.entries(props)) {
    if (["children", "key", "ref"].includes(key) || value == null) continue;
    if (tag === "textarea" && key === "defaultValue") continue;
    key = aliases[key] || key;
    if (key === "style")
      value = Object.entries(value)
        .filter(([, v]) => v != null && v !== false)
        .map(
          ([k, v]) =>
            k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()) + ":" + v,
        )
        .join(";");
    if (key === "style" && !value) continue;
    if (booleans.has(key)) {
      if (value) attrs += ` ${key}=""`;
      continue;
    }
    attrs += ` ${key}="${escapeHtml(value)}"`;
  }
  const content =
    tag === "textarea" && props.defaultValue != null
      ? escapeHtml(props.defaultValue)
      : render(children);
  return raw(
    `<${tag}${attrs}${voids.has(tag) ? "/>" : ">" + content + "</" + tag + ">"}`,
  );
}
export const toHtml = render;
