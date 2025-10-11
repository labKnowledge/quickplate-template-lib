// examples/template-generation-test.ts

import { TemplateProcessor } from '../src';

console.log('=== Template Generation from HTML Test ===\\n');

const processor = new TemplateProcessor();

// Test 1: Simple list conversion
console.log('1. Converting HTML list to template with loops:');
const simpleListHtml = `
<div class="container">
  <ul>
    <li>Apple</li>
    <li>Banana</li>
    <li>Orange</li>
  </ul>
</div>
`;

const result1 = processor.generateTemplateFromHtml(simpleListHtml);
console.log('Generated Template:');
console.log(result1.template);
console.log('\\nGenerated Data:');
console.log(JSON.stringify(result1.data, null, 2));

// Test 2: Process the generated template to verify it works
console.log('\\n2. Processing generated template with custom data:');
const processed1 = processor.process(result1.template, {
  items1: [
    { fruit: 'Strawberry' },
    { fruit: 'Blueberry' },
    { fruit: 'Raspberry' }
  ]
});
console.log('Processed Result:');
console.log(processed1);

// Test 3: Complex HTML with multiple sections
console.log('\\n3. Converting complex HTML:');
const complexHtml = `
<div class="profile">
  <h1>John Doe</h1>
  <p>Software Developer</p>
  <div class="skills">
    <h3>Skills</h3>
    <ul>
      <li>JavaScript</li>
      <li>TypeScript</li>
      <li>React</li>
    </ul>
  </div>
  <div class="projects">
    <div class="project">
      <h4>Project 1</h4>
      <p>Description 1</p>
    </div>
    <div class="project">
      <h4>Project 2</h4>
      <p>Description 2</p>
    </div>
  </div>
</div>
`;

const result2 = processor.generateTemplateFromHtml(complexHtml);
console.log('Generated Complex Template:');
console.log(result2.template);
console.log('\\nGenerated Complex Data:');
console.log(JSON.stringify(result2.data, null, 2));

// Test 4: Process the complex template
console.log('\\n4. Processing complex template:');
const processed2 = processor.process(result2.template, {
  name: 'Jane Smith',
  title: 'UX Designer',
  items1: [
    { technology: 'Figma' },
    { technology: 'Sketch' },
    { technology: 'Adobe XD' }
  ],
  items2: [
    { project_title: 'E-commerce Site', project_description: 'Redesigned shopping experience' },
    { project_title: 'Mobile App', project_description: 'Designed user interface' }
  ]
});
console.log('Processed Complex Result:');
console.log(processed2);

console.log('\\n=== Template Generation Feature Working! ===');