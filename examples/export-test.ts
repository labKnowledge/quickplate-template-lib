// examples/export-test.ts

import { TemplateProcessor } from '../src';

const processor = new TemplateProcessor();

// Test the new JSON export functionality
const template = `
<div class="profile">
  <h1>John Doe</h1>
  <p>Senior Developer</p>
  <ul>
    <li>Skill 1</li>
    <li>Skill 2</li>
  </ul>
</div>
`;

const processedTemplate = processor.process(template, {});

console.log('HTML Export:');
console.log(processor.export(processedTemplate, 'html'));

console.log('\\nJSON Export:');
const jsonExport = processor.export(processedTemplate, 'json');
console.log(JSON.stringify(jsonExport, null, 2));

console.log('\\nSupported Formats:');
console.log(processor.getSupportedExportFormats());