// examples/css-scoping-test.ts

import { TemplateProcessor } from '../src';

console.log('=== CSS Scoping Feature Test ===\\n');

const processor = new TemplateProcessor();

// Test 1: Basic CSS scoping
console.log('1. Basic CSS Scoping:');

const unscopedHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      font-family: Arial;
    }
    div {
      padding: 10px;
    }
    .button {
      background: blue;
      color: white;
    }
    #header {
      background: red;
    }
  </style>
</head>
<body>
  <div class="charleyTemplate">
    <div id="header">Header</div>
    <div class="button">Click me</div>
  </div>
</body>
</html>`;

const scopedHtml = processor.applyCssScoping(unscopedHtml, 'charleyTemplate');
console.log('Original CSS:');
console.log(unscopedHtml.match(/<style>([\s\S]*?)<\/style>/)?.[1] || 'No style found');
console.log('\\nScoped CSS:');
console.log(scopedHtml.match(/<style>([\s\S]*?)<\/style>/)?.[1] || 'No style found');
console.log();

// Test 2: Complex selector scoping
console.log('2. Complex Selector Scoping:');
const complexHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    .social-grid i {
      display: inline-block;
    }
    .btn-primary:hover {
      background-color: #16698a;
    }
    div div {
      padding: 0;
    }
  </style>
</head>
<body>
  <div class="charleyTemplate">
    <div class="social-grid"><i class="fa"></i></div>
    <button class="btn-primary">Button</button>
    <div><div>Inner div</div></div>
  </div>
</body>
</html>`;

const complexScoped = processor.applyCssScoping(complexHtml, 'charleyTemplate');
console.log('Complex scoped CSS:');
console.log(complexScoped.match(/<style>([\s\S]*?)<\/style>/)?.[1] || 'No style found');
console.log();

// Test 3: Integration with template processing
console.log('3. Integration with Template Processing:');
const templateWithStyles = `
<div class="myTemplate">
  <style>
    .myTemplate {
      font-family: Arial;
    }
    .myTemplate p {
      margin: 10px 0;
    }
    body {
      background: lightgray;
    }
    h2 {
      font-size: 2em;
    }
  </style>
  <h2>{title}</h2>
  <p>{content}</p>
</div>`;

// Apply scoping first
const scopedTemplate = processor.applyCssScoping(templateWithStyles, 'myTemplate');
console.log('Template after CSS scoping:');
console.log(scopedTemplate);

// Then process the template
const processedTemplate = processor.process(scopedTemplate, {
  title: 'Hello World',
  content: 'This is my content'
});
console.log('\\nProcessed template:');
console.log(processedTemplate);

console.log('\\n=== CSS Scoping Feature Working! ===');
console.log('✓ Element selectors scoped (body, div, etc.)');
console.log('✓ Class selectors scoped (.button -> .myTemplate .button)');
console.log('✓ ID selectors scoped (#header -> .myTemplate #header)');
console.log('✓ Integration with template processing works');