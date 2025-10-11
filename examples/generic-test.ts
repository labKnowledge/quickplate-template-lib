// examples/generic-test.ts

import { TemplateProcessor } from '../src';

// Create a template processor instance
const processor = new TemplateProcessor();

// Test 1: Generic placeholder that's not in the special cases
console.log('=== Generic Placeholder Test ===');
const genericTemplate = `<p>Company: {companyName}</p><p>Location: {location}</p>`;
const genericData = {
  companyName: 'Acme Inc',
  location: 'New York'
};

const genericResult = processor.process(genericTemplate, genericData);
console.log(genericResult);
// Should output: <p>Company: Acme Inc</p><p>Location: New York</p>

// Test 2: Mix of special and generic placeholders
console.log('\\n=== Mixed Special and Generic Placeholders ===');
const mixedTemplate = `
<div>
  <p>Business: {businessName}</p>
  <p>Stars: {stars}</p>
  <p>Description: {description}</p>
  <a href="{addContact}">Contact</a>
</div>`;

const mixedData = {
  businessName: 'My Business',
  stars: 3,
  description: 'Great service provider',
  addContact: 'BEGIN:VCARD\\nFN:Jane Doe\\nEND:VCARD'
};

const mixedResult = processor.process(mixedTemplate, mixedData);
console.log(mixedResult);

// Test 3: New custom field that's not in special cases
console.log('\\n=== New Custom Fields Test ===');
const customTemplate = `
<div>
  <p>Custom Field: {myCustomField}</p>
  <p>Another Field: {anotherField}</p>
  <p>Stars: {stars}</p>
  <p>Location: {businessLocation}</p>
</div>`;

const customData = {
  myCustomField: 'Custom Value',
  anotherField: 'Another Value',
  stars: 4,
  businessLocation: 'Downtown'
};

const customResult = processor.process(customTemplate, customData);
console.log(customResult);

// Test 4: Loop with custom fields
console.log('\\n=== Custom Fields in Loop Test ===');
const loopTemplate = `
{LOOP_START:items}
  <div>
    <h3>{itemName}</h3>
    <p>Custom: {customProp}</p>
    <p>Rating: {rating}</p>
    <p>Stars: {stars}</p>
  </div>
{LOOP_END:items}`;

const loopData = {
  items: [
    { 
      itemName: 'Product A', 
      customProp: 'Value A', 
      rating: 4, 
      stars: 5 
    },
    { 
      itemName: 'Product B', 
      customProp: 'Value B', 
      rating: 2, 
      stars: 3 
    }
  ]
};

const loopResult = processor.process(loopTemplate, loopData);
console.log(loopResult);