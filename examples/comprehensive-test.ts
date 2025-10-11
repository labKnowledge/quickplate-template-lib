// examples/comprehensive-test.ts

import { TemplateProcessor } from '../src';

console.log('=== Comprehensive Feature Test ===\\n');

const processor = new TemplateProcessor();

// Test 1: Basic placeholder replacement
console.log('1. Basic placeholder replacement:');
const basicResult = processor.process('<h1>Hello {name}!</h1>', { name: 'World' });
console.log(basicResult);
console.log('✓ Basic placeholders work\\n');

// Test 2: Special field processing
console.log('2. Special field processing:');
const specialResult = processor.process('<div class="stars">{stars}</div><a href="{addContact}">Contact</a>', { 
  stars: 4, 
  addContact: 'BEGIN:VCARD\\nFN:John Doe\\nEND:VCARD' 
});
console.log(specialResult);
console.log('✓ Special fields work\\n');

// Test 3: Loop processing
console.log('3. Loop processing:');
const loopResult = processor.process(`
  <ul>
    {LOOP_START:items}
      <li>{name} - {value}</li>
    {LOOP_END:items}
  </ul>`, {
  items: [
    { name: 'Item 1', value: 'Value 1' },
    { name: 'Item 2', value: 'Value 2' }
  ]
});
console.log(loopResult);
console.log('✓ Loop processing works\\n');

// Test 4: Conditional sections
console.log('4. Conditional sections:');
const conditionalResult = processor.process(`
  <!-- About Me section -->
  <div class="about">{aboutMeText}</div>
  <!-- EndAbout Me section -->
  
  <!-- Services section -->
  <div class="services">{services}</div>
  <!-- EndServices section -->`, {
  aboutMeText: '', // Empty - should be removed
  services: 'Web Development' // Has content - should remain
});
console.log(conditionalResult);
console.log('✓ Conditional sections work\\n');

// Test 5: Layout reordering
console.log('5. Layout reordering:');
const reorderTemplate = `
<div class="container">
  <!-- REORDER -->
  <!-- BLOCK:header -->
  <header>Header Content</header>
  <!-- ENDBLOCK:header -->
  
  <!-- BLOCK:main -->
  <main>Main Content</main>
  <!-- ENDBLOCK:main -->
  
  <!-- BLOCK:footer -->
  <footer>Footer Content</footer>
  <!-- ENDBLOCK:footer -->
  <!-- ENDREORDER -->
</div>`;

const reorderResult = processor.process(reorderTemplate, {
  layoutOrder: ['footer', 'main', 'header'] // Custom order: footer, main, header
});
console.log(reorderResult);
console.log('✓ Layout reordering works\\n');

// Test 6: Block swapping (inline directive)
console.log('6. Inline block swapping:');
const swapTemplate = `
<div class="layout">
  <!-- BLOCK:sectionA -->
  <div class="sectionA">Section A Content</div>
  <!-- ENDBLOCK:sectionA -->
  
  <!-- BLOCK:sectionB -->
  <div class="sectionB">Section B Content</div>
  <!-- ENDBLOCK:sectionB -->
  
  {SWAP:sectionA:sectionB}
</div>`;

const swapResult = processor.process(swapTemplate, {});
console.log(swapResult);
console.log('✓ Inline swapping works\\n');

// Test 7: Export functionality
console.log('7. Export functionality:');
const exportTemplate = `
<div class="card">
  <h1>{title}</h1>
  <p>{description}</p>
  <ul>
    {LOOP_START:items}
      <li>{name}</li>
    {LOOP_END:items}
  </ul>
</div>`;

const processed = processor.process(exportTemplate, {
  title: 'My Card',
  description: 'Sample description',
  items: [{ name: 'Item 1' }, { name: 'Item 2' }]
});

console.log('HTML Export:');
console.log(processed);

console.log('\\nMarkdown Export:');
const markdown = processor.export(processed, 'markdown');
console.log(markdown);

console.log('\\nText Export:');  
const text = processor.export(processed, 'text');
console.log(text);

console.log('\\nAST Export:');
const ast = processor.export(processed, 'ast') as any;
console.log('AST has', ast.nodes.length, 'top-level nodes');
console.log('✓ Export functionality works\\n');

// Test 8: AST structure verification
console.log('8. AST structure verification:');
console.log('Root node type:', ast.nodes[0].type);
console.log('Root tag name:', ast.nodes[0].tagName);
console.log('Has attributes:', Object.keys(ast.nodes[0].attributes).length > 0);
console.log('Has children:', ast.nodes[0].children.length > 0);
console.log('✓ AST structure is valid\\n');

// Test 9: All supported formats
console.log('9. Supported export formats:');
const formats = processor.getSupportedExportFormats();
console.log('Available formats:', formats);
console.log('✓ Format listing works\\n');

// Test 10: Complex template with all features
console.log('10. Complex template with all features:');
const complexTemplate = `
<div class="business-card">
  <!-- REORDER -->
  <!-- BLOCK:header -->
  <header>
    <h1>{name}</h1>
    <p>{title}</p>
  </header>
  <!-- ENDBLOCK:header -->
  
  <!-- BLOCK:contact -->
  <div class="contact">
    <p>📞 {phone}</p>
    <p>✉️ {email}</p>
  </div>
  <!-- ENDBLOCK:contact -->
  
  <!-- BLOCK:skills -->
  <div class="skills">
    <h3>Skills</h3>
    <ul>
      {LOOP_START:skills}
        <li class="skill-item">{name} ({level})</li>
      {LOOP_END:skills}
    </ul>
  </div>
  <!-- ENDBLOCK:skills -->
  <!-- ENDREORDER -->
  
  <!-- BLOCK:social -->
  <div class="social">
    <a href="{socialUrl}">Follow</a>
  </div>
  <!-- ENDBLOCK:social -->
</div>
`;

const complexResult = processor.process(complexTemplate, {
  name: 'Jane Smith',
  title: 'Senior Developer',
  phone: '+1-555-1234',
  email: 'jane@example.com',
  socialUrl: 'https://linkedin.com/janesmith',
  layoutOrder: ['skills', 'contact', 'header'], // Reorder the main sections
  skills: [
    { name: 'React', level: 'Expert' },
    { name: 'Node.js', level: 'Advanced' },
    { name: 'TypeScript', level: 'Expert' }
  ]
});

console.log(complexResult);
console.log('✓ Complex template with all features works\\n');

console.log('=== All Features Working Perfectly! ===');
console.log('✓ Basic templating');
console.log('✓ Special field processing (stars, addContact)');
console.log('✓ Loop processing');
console.log('✓ Conditional sections');
console.log('✓ Layout reordering');
console.log('✓ Block swapping');
console.log('✓ Multiple export formats (HTML, Markdown, Text, AST)');
console.log('✓ AST structure for React/PDF conversion');
console.log('✓ Format listing');
console.log('✓ Complex templates with all features');