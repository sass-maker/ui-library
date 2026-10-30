/** Keep Setline's below-fold closing artwork out of initial image delivery. */
export function deferSetlineClosingBackdrop(html) {
  if (!html.includes("setline-closing-v3.webp")) return html;
  const pattern = /<div\b[^>]*style="background-image:url\(([^)]+setline-closing-v3\.webp)\)"[^>]*><\/div>/g;
  let matches = 0;
  const output = html.replace(pattern, (backdrop, source) => {
    matches += 1;
    return backdrop.replace(/ style="[^"]*"/, "").replace("</div>",
      `<img class="setline-closing-art" src="${source}" alt="" width="1536" height="1024" loading="lazy" decoding="async"></div>`);
  });
  if (matches !== 1) throw new Error(`Expected one Setline closing backdrop, found ${matches}`);
  // Match GalleryClosing's existing cover crop at the same 48rem breakpoint.
  const styles = "<style>.setline-closing-art{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:12% 60%}@media(min-width:48rem){.setline-closing-art{object-position:center 60%}}</style>";
  return output.replace("</head>", `${styles}</head>`);
}

