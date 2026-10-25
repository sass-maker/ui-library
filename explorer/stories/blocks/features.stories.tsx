import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, Box, Check } from 'lucide-react';
import { FeatureGrid } from '@saas-maker/ui/blocks/features';

type FeatureArgs = {
  columns: 2 | 3 | 4;
  count: number;
  variant: 'ruled' | 'cards' | 'plain';
};

const items = [
  { title: 'Semantic tokens', body: 'Change identity without forking components.', icon: <Box /> },
  { title: 'Accessible interactions', body: 'Start with maintained upstream primitives.', icon: <Check /> },
  { title: 'Purposeful motion', body: 'Preserve meaning when reduced motion is enabled.', icon: <ArrowRight /> },
  { title: 'Product personality', body: 'Choose type, density and color roles for the product.' },
  { title: 'Original media', body: 'Compose real artwork, product screens and deliberate video.' },
  { title: 'Responsive composition', body: 'Keep related content readable as the available space changes.' },
  { title: 'Reusable examples', body: 'Take a working composition into the next product.' },
];

const meta = {
  id: 'blocks-features',
  title: 'Organisms/Blocks/Features',
  args: { columns: 3, count: 3, variant: 'ruled' },
  argTypes: {
    columns: { control: 'inline-radio', options: [2, 3, 4] },
    count: { control: { type: 'range', min: 1, max: items.length, step: 1 } },
    variant: { control: 'inline-radio', options: ['ruled', 'cards', 'plain'] },
  },
  parameters: { docs: { description: { component: 'Explain product capabilities in a responsive grid of concise, related sections.\n\nImport from `@saas-maker/ui/blocks/features`. Compare complete and incomplete rows with the item-count and column controls. Upstream attribution is retained in THIRD_PARTY_NOTICES.md.' } } },
} satisfies Meta<FeatureArgs>;

export default meta;
type Story = StoryObj<FeatureArgs>;

export const Playground: Story = {
  render: args => <FeatureGrid items={items.slice(0, args.count)} columns={args.columns} variant={args.variant} />,
};
