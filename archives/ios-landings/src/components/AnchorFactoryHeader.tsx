import "@saas-maker/templates/gallery.css";
import { SiteHeader } from "@saas-maker/ui/blocks/site-header";
import content from "../../products/anchor/content.json";

// The Anchor home uses this same upstream header via GalleryPage. On factory
// routes, resolve home-section links against / so they do not target legal copy.
export default function AnchorFactoryHeader() {
  const links = content.nav.map((link) => ({
    ...link,
    href: link.href.startsWith("#") ? `/${link.href}` : link.href,
  }));
  const mark = <img src={`/${content.mark}`} alt="" width={26} height={26} className="size-[1.625rem] rounded-[0.45rem]" />;
  const action = content.headerAction;

  return <SiteHeader
    brand={{ name: content.product, mark }}
    links={links}
    actions={<a href={action.href} className="ui-case rounded-full bg-primary px-3.5 py-[0.45rem] text-[0.8125rem] font-semibold text-primary-foreground">{action.label}</a>}
  />;
}
