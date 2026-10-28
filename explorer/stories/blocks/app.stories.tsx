import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/blocks/app';
const meta={id: "blocks-app", title: "Organisms/Blocks/App",parameters:{docs:{description:{component:"Compose a dashboard with a page header, summary card, empty state and area chart. Open the complete workspace example for navigation and a top bar.\n\nImport from `@saas-maker/ui/blocks/app`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="story-stack"><C.PageHeader title="Library overview" description="Illustrative dashboard composition"/><div className="story-grid"><C.StatCard label="Example count" value="24" hint="Illustrative, not a measured Fleet result" trend={[2,4,3,5,7,8]}/><C.EmptyState icon={<Box/>} title="No components selected" body="Select a component to inspect its source."/></div><C.AreaChart series={[{name:"Example series",values:[2,4,3,7,6,9]}]} labels={["Mon","Tue","Wed","Thu","Fri","Sat"]}/><p className="story-caption"><a href="./?path=/story/start-here-workspace--complete-workflow" target="_top" className="underline underline-offset-4">Explore the complete workspace</a></p></div>;}};

export const Navigation: Story = { render: function Render() {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("#projects");
  return <C.AppShell brand={{ name: "Site Health", mark: <Globe /> }}
    collapsible collapsed={collapsed} onCollapsedChange={setCollapsed} modalNavigation
    onNavigate={setActive}
    nav={[{ title: "Workspace", items: [{ label: "Projects", href: "#projects", icon: <Folder />, active: active === "#projects" }, { label: "Settings", href: "#settings", icon: <Settings />, active: active === "#settings" }] }]}
    user={{ name: "Workspace owner", detail: "Local workspace" }}>
    <C.PageHeader title={active === "#settings" ? "Settings" : "Projects"} description="Controlled desktop rail and modal mobile navigation." />
    <p className="p-6 text-sm text-muted-foreground">Resize the explorer to compare the sidebar and mobile Sheet.</p>
  </C.AppShell>;
} };
