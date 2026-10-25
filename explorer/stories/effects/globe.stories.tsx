import type { Meta, StoryObj } from '@storybook/react-vite';
import {useState,useRef} from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import { Box, FileText, Folder, Search, Check, ArrowRight, Cloud, Code, Globe, Settings } from 'lucide-react';
import * as C from '@saas-maker/ui/effects/globe';

const meta={id: "effects-globe", title: "Molecules/Effects/Globe",parameters:{docs:{description:{component:"Use a globe as one spatial focal point within a product composition.\n\nImport from `@saas-maker/ui/effects/globe`. Compare presets, color modes, motion preferences and viewport widths using the toolbar. Upstream attribution is retained in THIRD_PARTY_NOTICES.md."}}}} satisfies Meta;
export default meta;
type Story=StoryObj;
export const Playground:Story={render:function Render(){return <C.Globe className="w-full max-w-md" config={{markers:[{location:[19.07,72.87],size:.05},{location:[37.77,-122.42],size:.04}]}}/>;}};
