// examples/swap-test.ts

import { TemplateProcessor } from '../src';

const processor = new TemplateProcessor();

// Test the swap functionality specifically
console.log('=== Block Swapping Test ===');
const swapTemplate = `
<div class="layout">
  <!-- BLOCK:left-column -->
  <div class="left">Left Content: {leftData}</div>
  <!-- ENDBLOCK:left-column -->
  
  <!-- BLOCK:right-column -->  
  <div class="right">Right Content: {rightData}</div>
  <!-- ENDBLOCK:right-column -->
</div>
`;

const swapData = {
  leftData: 'Original Left',
  rightData: 'Original Right',
  swaps: [{ from: 'left-column', to: 'right-column' }]  // Swap the blocks
};

const result = processor.process(swapTemplate, swapData);
console.log('Result with swaps from data:');
console.log(result);

console.log('\\n=== Inline Swap Directive Test ===');
const inlineSwapTemplate = `
<div class="layout">
  <!-- BLOCK:sectionA -->
  <div class="sectionA">Section A Content</div>
  <!-- ENDBLOCK:sectionA -->
  
  <!-- BLOCK:sectionB -->
  <div class="sectionB">Section B Content</div>
  <!-- ENDBLOCK:sectionB -->
  
  {SWAP:sectionA:sectionB}
</div>
`;

const inlineResult = processor.process(inlineSwapTemplate, {});
console.log('Result with inline swap directive:');
console.log(inlineResult);