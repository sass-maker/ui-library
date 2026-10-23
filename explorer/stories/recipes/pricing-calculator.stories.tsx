import { PricingContext } from "../workflow-examples";
import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/recipes/pricing-calculator';

const meta={id: "data-pricing-calculator", title: "Molecules/Patterns/Pricing calculator",parameters:{docs:{description:{component:"Keep team size, billing period, and the current total connected as a pricing choice changes.\n\nImport from `@saas-maker/ui/recipes/pricing-calculator`. The Playground isolates the API; In Context shows it composed into a local product example. Attribution and pinned upstream source are retained in THIRD_PARTY_NOTICES.md and packages/ui/upstream.json."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <div className="story-stack"><p className="story-caption">Illustrative pricing; these are not Fleet product offers.</p><C.PricingCalculator plans={[{name:"Example solo",minSeats:1,seatPrice:10},{name:"Example team",minSeats:5,seatPrice:8}]} maxSeats={20}/></div>;}};

export const InContext: Story = { render: () => <PricingContext /> };
