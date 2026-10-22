function luminance(hex) {
  if (!/^#[a-f0-9]{6}$/i.test(hex)) throw new Error(`Expected opaque six-digit color: ${hex}`);
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}
export function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + .05) / (values[1] + .05);
}
export function actionColors(tokens) {
  const preferred = tokens.inkOnAccent ?? "#ffffff";
  const background = contrast(preferred, tokens.accent) >= 4.5 ? tokens.accent : tokens.accentDark;
  const textFor = bg => contrast(preferred, bg) >= 4.5 ? preferred : contrast("#ffffff", bg) > contrast("#000000", bg) ? "#ffffff" : "#000000";
  return { background, foreground: textFor(background), hoverBackground: tokens.accentDark, hoverForeground: textFor(tokens.accentDark) };
}
