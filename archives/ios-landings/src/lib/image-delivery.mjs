/** Enhance factory and library markup without changing its classes or source links. */
export async function optimizeImageTags(html, loadImage, getImage) {
  const firstSectionEnd = html.indexOf("</section>", html.indexOf("<main"));
  const tags = [...html.matchAll(/<img\b[^>]*>/g)];
  let output = "";
  let cursor = 0;
  for (const match of tags) {
    let tag = match[0];
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    const image = src && await loadImage(src);
    if (image && !/\bsrcset=/.test(tag)) {
      const declaredWidth = Number(tag.match(/\bwidth="(\d+)"/)?.[1]);
      const icon = declaredWidth > 0 && declaredWidth <= 64;
      const phone = image.height / image.width >= 1.65;
      const widths = [...new Set((icon ? [declaredWidth, declaredWidth * 2, declaredWidth * 3]
        : phone ? [248, 496, 744, image.width] : [384, 768, 1180, 1536, image.width])
        .filter(width => width <= image.width))].sort((a, b) => a - b);
      const variants = await Promise.all(widths.map(async width => {
        const result = await getImage({ src: image, width, format: "webp", quality: 80 });
        return `${result.src} ${width}w`;
      }));
      const sizes = icon ? `${declaredWidth}px` : phone ? "(max-width: 767px) 248px, 360px"
        : "(max-width: 767px) calc(100vw - 40px), 1180px";
      tag = tag.replace(/\s(?:srcset|sizes)="[^"]*"/g, "");
      tag = tag.replace(/\s*\/?\>$/, ` srcset="${variants.join(", ")}" sizes="${sizes}">`);
      if (!/\bwidth=/.test(tag)) tag = tag.replace("<img", `<img width="${image.width}"`);
      if (!/\bheight=/.test(tag)) tag = tag.replace("<img", `<img height="${image.height}"`);
      if (firstSectionEnd >= 0 && match.index > firstSectionEnd) {
        tag = tag.replace(/\s(?:loading|fetchpriority)="[^"]*"/g, "");
        tag = tag.replace("<img", '<img loading="lazy"');
      } else if (!icon && /loading="eager"|fetchpriority="high"/.test(tag)) {
        tag = tag.replace(/\s(?:loading|fetchpriority)="[^"]*"/g, "");
        tag = tag.replace("<img", '<img loading="eager" fetchpriority="high"');
      }
    }
    output += html.slice(cursor, match.index) + tag;
    cursor = match.index + match[0].length;
  }
  return output + html.slice(cursor);
}
