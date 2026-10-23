/** Original, dependency-free surface studies. These are not third-party presets. */
export const visualMaterials = [
  {
    id: 'ember', name: 'Ember', family: 'Light & grain',
    description: 'A warm pool of light for a quiet product introduction.',
    css: 'background-color: #201c1a;\nbackground-image: radial-gradient(ellipse at 70% 80%, #d77c4e 0%, transparent 48%), radial-gradient(ellipse at 20% 20%, #616b5b 0%, transparent 60%);',
    style: { backgroundColor: '#201c1a', backgroundImage: 'radial-gradient(ellipse at 70% 80%, #d77c4e 0%, transparent 48%), radial-gradient(ellipse at 20% 20%, #616b5b 0%, transparent 60%)' },
  },
  {
    id: 'tidal', name: 'Tidal', family: 'Color fields',
    description: 'Cool, layered color with enough space for a single focal point.',
    css: 'background-color: #192e3b;\nbackground-image: radial-gradient(ellipse at 20% 0%, #7ba5a5 0%, transparent 60%), radial-gradient(ellipse at 90% 100%, #b9b1cb 0%, transparent 65%);',
    style: { backgroundColor: '#192e3b', backgroundImage: 'radial-gradient(ellipse at 20% 0%, #7ba5a5 0%, transparent 60%), radial-gradient(ellipse at 90% 100%, #b9b1cb 0%, transparent 65%)' },
  },
  {
    id: 'graph', name: 'Graph paper', family: 'Patterns',
    description: 'A restrained grid for diagrams, tools and technical notes.',
    css: 'background-color: #ece8dc;\nbackground-image: linear-gradient(#757b5c26 1px, transparent 1px), linear-gradient(90deg, #757b5c26 1px, transparent 1px);\nbackground-size: 24px 24px;',
    style: { backgroundColor: '#ece8dc', backgroundImage: 'linear-gradient(#757b5c26 1px, transparent 1px), linear-gradient(90deg, #757b5c26 1px, transparent 1px)', backgroundSize: '24px 24px' },
  },
  {
    id: 'pixel', name: 'Pixel weave', family: 'Pixel texture',
    description: 'A small repeating tile; pair with a coherent sprite palette.',
    css: 'background-color: #293c36;\nbackground-image: conic-gradient(#a6b387 25%, transparent 0 50%, #a6b387 0 75%, transparent 0);\nbackground-size: 12px 12px;',
    style: { backgroundColor: '#293c36', backgroundImage: 'conic-gradient(#a6b387 25%, transparent 0 50%, #a6b387 0 75%, transparent 0)', backgroundSize: '12px 12px' },
  },
] as const;
