// examples/reorder-test.ts

import { TemplateProcessor } from '../src';

const processor = new TemplateProcessor();

// Test 1: Basic block reordering
console.log('=== Basic Block Reordering ===');
const reorderTemplate = `
<div class="layout">
  <!-- REORDER -->
  <!-- BLOCK:header -->
  <header>Header Content</header>
  <!-- ENDBLOCK:header -->
  
  <!-- BLOCK:sidebar -->
  <aside>Sidebar Content</aside>
  <!-- ENDBLOCK:sidebar -->
  
  <!-- BLOCK:main -->
  <main>Main Content</main>
  <!-- ENDBLOCK:main -->
  <!-- ENDREORDER -->
</div>
`;

const reorderData = {
  layoutOrder: ['main', 'sidebar', 'header']  // Reorder to: main, sidebar, header
};

const reorderResult = processor.process(reorderTemplate, reorderData);
console.log('Result with reordered layout:');
console.log(reorderResult);

// Test 2: Block swapping
console.log('\\n=== Block Swapping ===');
const swapTemplate = `
<div class="layout">
  <!-- BLOCK:sectionA -->
  <div id="sectionA">Section A Content</div>
  <!-- ENDBLOCK:sectionA -->
  
  <!-- BLOCK:sectionB -->
  <div id="sectionB">Section B Content</div>
  <!-- ENDBLOCK:sectionB -->
</div>
`;

const swapData = {
  swaps: [{ from: 'sectionA', to: 'sectionB' }]  // Swap section A with section B
};

const swapResult = processor.process(swapTemplate, swapData);
console.log('Result with swapped sections:');
console.log(swapResult);

// Test 3: Export functionality
console.log('\\n=== Export Functionality ===');
const exportTemplate = `
<div class="profile">
  <h1>John Doe</h1>
  <p>Software Developer</p>
  <ul>
    <li>Skill 1</li>
    <li>Skill 2</li>
    <li>Skill 3</li>
  </ul>
  <p>Contact: john@example.com</p>
</div>
`;

const processedHtml = processor.process(exportTemplate, {});
console.log('HTML Output:');
console.log(processedHtml);

const markdown = processor.export(processedHtml, 'markdown');
console.log('\\nMarkdown Output:');
console.log(markdown);

const text = processor.export(processedHtml, 'text');
console.log('\\nText Output:');
console.log(text);

// Test 4: Inline swap directive
console.log('\\n=== Inline Swap Directive ===');
const inlineSwapTemplate = `
<div class="layout">
  <!-- BLOCK:left -->
  <div id="left">Left Content</div>
  <!-- ENDBLOCK:left -->
  
  <!-- BLOCK:right -->
  <div id="right">Right Content</div>
  <!-- ENDBLOCK:right -->
  
  {SWAP:left:right}
</div>
`;

const inlineSwapResult = processor.process(inlineSwapTemplate, {});
console.log('Result with inline swap:');
console.log(inlineSwapResult);