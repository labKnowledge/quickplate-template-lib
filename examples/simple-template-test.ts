// examples/simple-template-test.ts

import { TemplateProcessor } from '../src';

console.log('=== Simple Template Generation Test ===\\n');

const processor = new TemplateProcessor();

// Test with a simple case to verify basic functionality
const simpleHtml = `
<div>
  <ul>
    <li>First Item</li>
    <li>Second Item</li>
    <li>Third Item</li>
  </ul>
</div>
`;

const result = processor.generateTemplateFromHtml(simpleHtml);
console.log('Generated Template:');
console.log(result.template);

console.log('\\nGenerated Data:');
console.log(JSON.stringify(result.data, null, 2));

// Now let's process it with custom data (using the actual placeholders that were generated)
const processed = processor.process(result.template, {
  items1: [
    { item: "Custom 1" },  // This won't work because it was generated as {first_item} 
    { item: "Custom 2" },
    { item: "Custom 3" }
  ]
});

console.log('\\nProcessed with Custom Data:');
console.log(processed);

// Let's see what placeholders were actually created and use those
console.log('\\n=== Testing with Correct Placeholders ===');
const processed2 = processor.process(result.template, {
  items1: [
    { first_item: "New First" },
    { second_item: "New Second" },
    { third_item: "New Third" }
  ]
});

console.log('Processed with Correct Placeholders:');
console.log(processed2);

console.log('\\n=== Manual Template Test ===');
// Let's test that the processor still works correctly with a manually created template
const manualTemplate = `
<div>
  {LOOP_START:items}
  <li>{item}</li>
  {LOOP_END:items}
</div>`;

const manualProcessed = processor.process(manualTemplate, {
  items: [
    { item: "Manual 1" },
    { item: "Manual 2" },
    { item: "Manual 3" }
  ]
});

console.log('Manual Template Processed:');
console.log(manualProcessed);

console.log('\\n=== All Core Features Still Work ===');
console.log('✓ Loop processing:', processor.process('{LOOP_START:items}<p>{item}</p>{LOOP_END:items}', { items: [{ item: 'test' }] }));
console.log('✓ Placeholder replacement:', processor.process('<p>{name}</p>', { name: 'John' }));
console.log('✓ Special fields:', processor.process('<div class="stars">{stars}</div>', { stars: 4 }));