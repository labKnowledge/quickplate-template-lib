// examples/basic-example.ts

import { TemplateProcessor } from '../src';

// Create a template processor instance
const processor = new TemplateProcessor();

// Example 1: Basic placeholder replacement
console.log('=== Basic Placeholder Replacement ===');
const basicTemplate = `
  <h1>Welcome, {name}!</h1>
  <p>You have {count} new messages.</p>
`;

const basicData = {
  name: 'Alice',
  count: 5
};

const basicResult = processor.process(basicTemplate, basicData);
console.log(basicResult);

// Example 2: Loop processing
console.log('\n=== Loop Processing ===');
const loopTemplate = `
  <div>
    <h2>Products</h2>
    <ul>
      {LOOP_START:products}
        <li class="product">{name} - {price}</li>
      {LOOP_END:products}
    </ul>
  </div>
`;

const loopData = {
  products: [
    { name: 'Laptop', price: 999.99 },
    { name: 'Mouse', price: 29.99 },
    { name: 'Keyboard', price: 79.99 }
  ]
};

const loopResult = processor.process(loopTemplate, loopData);
console.log(loopResult);

// Example 3: Conditional sections
console.log('\n=== Conditional Sections ===');
const conditionalTemplate = `
  <div class="profile">
    <h1>{firstName} {lastName}</h1>
    
    <!-- About section -->
    <div class="about">{aboutText}</div>
    <!-- EndAbout section -->
    
    <!-- Skills section -->
    <div class="skills">
      {LOOP_START:skills}
        <span class="skill">{name}</span>
      {LOOP_END:skills}
    </div>
    <!-- EndSkills section -->
    
    <!-- Contact section -->
    <div class="contact">
      <p>Email: {email}</p>
      <p>Phone: {phone}</p>
    </div>
    <!-- EndContact section -->
  </div>
`;

// With all data present
const fullData = {
  firstName: 'John',
  lastName: 'Doe',
  aboutText: 'Software developer with 5 years of experience.',
  skills: [
    { name: 'JavaScript' },
    { name: 'TypeScript' },
    { name: 'React' }
  ],
  email: 'john@example.com',
  phone: '+1 234 567 8900'
};

const fullResult = processor.process(conditionalTemplate, fullData);
console.log('With all data:');
console.log(fullResult);

// With some data missing (skills section will be removed)
const partialData = {
  firstName: 'Jane',
  lastName: 'Smith',
  aboutText: 'Designer',
  skills: [], // Empty array - section will be removed
  email: 'jane@example.com'
  // phone is missing - field will be removed
};

const partialResult = processor.process(conditionalTemplate, partialData);
console.log('\nWith partial data (skills section removed, phone field removed):');
console.log(partialResult);

// Example 4: Using options
console.log('\n=== Using Options ===');
const optionsProcessor = new TemplateProcessor({
  removeEmptySections: false, // Keep empty sections
  delimiters: ['{{', '}}']    // Custom delimiters
});

const customTemplate = '<p>Hello {{name}}! You have {{items}} items.</p>';
const customData = { name: 'Bob' }; // items is missing

const customResult = optionsProcessor.process(customTemplate, customData);
console.log(customResult); // Delimiters remain for missing data: <p>Hello Bob! You have {{items}} items.</p>