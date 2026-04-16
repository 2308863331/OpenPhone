export const icons = {
  msg: { viewBox: '0 0 24 24', d: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z', fill: '#fff' },
  calendar: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'rect', attrs: { x: '3', y: '4', width: '18', height: '18', rx: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'line', attrs: { x1: '3', y1: '10', x2: '21', y2: '10', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'line', attrs: { x1: '8', y1: '2', x2: '8', y2: '6', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }},
    { tag: 'line', attrs: { x1: '16', y1: '2', x2: '16', y2: '6', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }}
  ]},
  cameraRoll: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'rect', attrs: { x: '3', y: '3', width: '18', height: '18', rx: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'circle', attrs: { cx: '8.5', cy: '8.5', r: '1.5', fill: '#fff' }},
    { tag: 'polyline', attrs: { points: '21,15 16,10 5,21', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }}
  ]},
  instagram: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'rect', attrs: { x: '2', y: '2', width: '20', height: '20', rx: '5', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '4', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'circle', attrs: { cx: '17.5', cy: '6.5', r: '1', fill: '#fff' }}
  ]},
  weather: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '5', fill: '#fff' }},
    { tag: 'g', attrs: { stroke: '#fff', strokeWidth: '2', strokeLinecap: 'round' }, children: [
      { tag: 'line', attrs: { x1: '12', y1: '1', x2: '12', y2: '3' }},
      { tag: 'line', attrs: { x1: '12', y1: '21', x2: '12', y2: '23' }},
      { tag: 'line', attrs: { x1: '4.22', y1: '4.22', x2: '5.64', y2: '5.64' }},
      { tag: 'line', attrs: { x1: '18.36', y1: '18.36', x2: '19.78', y2: '19.78' }},
      { tag: 'line', attrs: { x1: '1', y1: '12', x2: '3', y2: '12' }},
      { tag: 'line', attrs: { x1: '21', y1: '12', x2: '23', y2: '12' }}
    ]}
  ]},
  music: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'path', attrs: { d: 'M9 18V5l12-2v13', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }},
    { tag: 'circle', attrs: { cx: '6', cy: '18', r: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'circle', attrs: { cx: '18', cy: '16', r: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }}
  ]},
  notes: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'path', attrs: { d: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'polyline', attrs: { points: '14,2 14,8 20,8', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'line', attrs: { x1: '16', y1: '13', x2: '8', y2: '13', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }},
    { tag: 'line', attrs: { x1: '16', y1: '17', x2: '8', y2: '17', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }}
  ]},
  settings: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'path', attrs: { d: 'M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }}
  ]},
  phone: { viewBox: '0 0 24 24', d: 'M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z', fill: '#fff' },
  photo: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'rect', attrs: { x: '3', y: '3', width: '18', height: '18', rx: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'circle', attrs: { cx: '8.5', cy: '8.5', r: '1.5', fill: '#fff' }},
    { tag: 'polyline', attrs: { points: '21,15 16,10 5,21', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }}
  ]},
  globe: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'circle', attrs: { cx: '12', cy: '12', r: '10', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'ellipse', attrs: { cx: '12', cy: '12', rx: '4', ry: '10', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'line', attrs: { x1: '2', y1: '12', x2: '22', y2: '12', stroke: '#fff', strokeWidth: '1.8' }}
  ]},
  capsule: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'ellipse', attrs: { cx: '12', cy: '12', rx: '9', ry: '5', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'line', attrs: { x1: '3', y1: '12', x2: '21', y2: '12', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'path', attrs: { d: 'M7 7c1-1.5 3-2.5 5-2.5s4 1 5 2.5M7 17c1 1.5 3 2.5 5 2.5s4-1 5-2.5', fill: 'none', stroke: '#fff', strokeWidth: '1.5' }}
  ]},
  pawnshop: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'circle', attrs: { cx: '12', cy: '9', r: '4', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'path', attrs: { d: 'M6 20V17a6 6 0 0112 0v3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'line', attrs: { x1: '12', y1: '13', x2: '12', y2: '17', stroke: '#fff', strokeWidth: '1.8' }}
  ]},
  travel: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'path', attrs: { d: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'circle', attrs: { cx: '12', cy: '10', r: '3', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }}
  ]},
  treehouse: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'path', attrs: { d: 'M12 22V8M5 12l7-7 7 7', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }},
    { tag: 'path', attrs: { d: 'M3 18l4-4h10l4 4', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }},
    { tag: 'circle', attrs: { cx: '12', cy: '5', r: '2', fill: '#fff' }}
  ]},
  video: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'polygon', attrs: { points: '5,3 19,12 5,21', fill: '#fff' }}
  ]},
  companion: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'path', attrs: { d: 'M4 19.5A2.5 2.5 0 016.5 17H20', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }},
    { tag: 'path', attrs: { d: 'M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z', fill: 'none', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'line', attrs: { x1: '10', y1: '7', x2: '16', y2: '7', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }},
    { tag: 'line', attrs: { x1: '10', y1: '11', x2: '16', y2: '11', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }},
    { tag: 'line', attrs: { x1: '10', y1: '15', x2: '14', y2: '15', stroke: '#fff', strokeWidth: '1.8', strokeLinecap: 'round' }}
  ]},
  crystal: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'polygon', attrs: { points: '12,2 22,9 12,22 2,9', fill: 'none', stroke: '#fff', strokeWidth: '1.8', strokeLinejoin: 'round' }},
    { tag: 'line', attrs: { x1: '12', y1: '2', x2: '12', y2: '22', stroke: '#fff', strokeWidth: '1.8' }},
    { tag: 'line', attrs: { x1: '2', y1: '9', x2: '22', y2: '9', stroke: '#fff', strokeWidth: '1.8' }}
  ]},
  particle: { viewBox: '0 0 24 24', type: 'multi', elements: [
    { tag: 'circle', attrs: { cx: '6', cy: '6', r: '2', fill: '#fff' }},
    { tag: 'circle', attrs: { cx: '18', cy: '8', r: '1.5', fill: '#fff' }},
    { tag: 'circle', attrs: { cx: '10', cy: '18', r: '2.5', fill: '#fff' }},
    { tag: 'circle', attrs: { cx: '18', cy: '17', r: '1', fill: '#fff' }},
    { tag: 'circle', attrs: { cx: '4', cy: '15', r: '1.2', fill: '#fff' }}
  ]}
}
