// examples/simple-reorder-test.ts

import { TemplateProcessor } from '../src';

const processor = new TemplateProcessor();

// Test the reorder functionality more simply
const simpleReorderTemplate = `
<div class="layout">
  <!-- REORDER -->
  <!-- BLOCK:header -->
  <header>Header Content</header>
  <!-- ENDBLOCK:header -->
  
  <!-- BLOCK:main -->
  <main>Main Content</main>
  <!-- ENDBLOCK:main -->
  <!-- ENDREORDER -->
</div>
`;

const simpleReorderData = {
  layoutOrder: ['main', 'header']  // Reorder to: main, header
};

const result = processor.process(simpleReorderTemplate, simpleReorderData);
console.log('Simple Reorder Result:');
console.log(result);

// Test without reorder container to see the blocks extraction
const blocksOnlyTemplate = `
<!-- BLOCK:header -->
<header>Header Content</header>
<!-- ENDBLOCK:header -->

<!-- BLOCK:main -->
<main>Main Content</main>
<!-- ENDBLOCK:main -->
`;

const blocksOnlyResult = processor.process(blocksOnlyTemplate, {});
console.log('\\nBlocks Only Result:');
console.log(blocksOnlyResult);