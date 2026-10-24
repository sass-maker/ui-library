import { sourceSnippets } from "virtual:fleet-example-source";
import { ModuleCatalogExample } from "./module-catalog-examples";
import { moduleCatalog } from "./module-catalog-data";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@saas-maker/ui/components/button";
import { Check, Search, Plus, Settings, Bold, Italic, ArrowRight, FolderOpen, Mail, Upload, Sparkles } from "lucide-react";
import * as C from "@saas-maker/ui/components/data-table";

const meta = { id: "data-data-table", title: "Organisms/Data/Data table", component: C.DataTable, parameters: {"docs": {"description": {"component": "A sortable, paginated collection with selection, column visibility and explicit loading, empty and recoverable error states.\n\nImport from `@saas-maker/ui/organisms/data-table`. Compare the six presets, light and dark modes, reduced motion, and viewport sizes using the toolbar."}}} } satisfies Meta;
export default meta;
type Story = StoryObj;

export const InContext: Story = {
  parameters: { docs: { source: { code: sourceSnippets.ModuleCatalogExample, type: "code", language: "tsx" } } },
  render: () => <ModuleCatalogExample />,
};

export const Playground: Story = { render: function Render() { const data=[{id:"ui",name:"UI Library",kind:"Shared system"},{id:"health",name:"App Health",kind:"Operations"},{id:"vetter",name:"CodeVetter",kind:"Developer tool"},{id:"kith",name:"Kith",kind:"Personal relationships"}];const [selected,setSelected]=useState<string[]>([]);return <div className="story-stack"><C.DataTable data={data} columns={[{id:"name",header:"Product",value:(row:typeof data[number])=>row.name},{id:"kind",header:"Purpose",value:(row:typeof data[number])=>row.kind}]} getRowId={row=>row.id} label="Fleet product examples" selection={{selected,onChange:setSelected,rowLabel:row=>row.name}} pageSize={3}/><p className="story-caption">Example rows · {selected.length} selected. Try sorting, column visibility, selection, and pagination.</p></div>; } };

const stateColumns: C.DataColumn<(typeof moduleCatalog)[number]>[] = [
  { id: "name", header: "Module", value: item => item.name, hideable: false },
  { id: "layer", header: "Layer", value: item => item.layer },
];
export const Loading: Story = { render: () => <C.DataTable label="Loading module request" data={[]} columns={stateColumns} getRowId={item => item.id} status="loading" skeletonRows={5} /> };
export const Empty: Story = { render: () => <C.DataTable label="Empty module request" data={[]} columns={stateColumns} getRowId={item => item.id} empty="No modules match this view. Clear a filter or choose another collection." /> };
export const FailureRecovery: Story = { render: function Render() {
  const [failed, setFailed] = useState(true);
  return <div className="story-stack"><C.DataTable label="Recoverable module request" data={moduleCatalog.slice(0, 5)} columns={stateColumns} getRowId={item => item.id} status={failed ? "error" : "ready"} error="The example request was interrupted. The existing data is retained." onRetry={() => setFailed(false)} /><p className="story-caption">Simulated request state with bundled catalog data. No network request is made. Retry restores the collection and keeps focus in the table.</p></div>;
} };
