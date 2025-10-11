# Getting Started

This guide will walk you through the basics of using the QuickPlate Template Library. By the end, you'll have a working example that demonstrates the core functionality.

## Prerequisites

- Node.js v12 or higher
- Basic knowledge of HTML and JavaScript/TypeScript

## Hello World Example

Let's start with a simple example that demonstrates basic placeholder replacement:

```typescript
import { TemplateProcessor } from '@quickplate/template';

// Create a processor instance
const processor = new TemplateProcessor();

// Define your template with placeholders
const template = '<h1>Hello {name}!</h1>';

// Define the data to populate the template
const data = { name: 'World' };

// Process the template with the data
const result = processor.process(template, data);

console.log(result); // Output: <h1>Hello World!</h1>
```

## Understanding the Process

1. **Template**: An HTML string with placeholders like `{name}`
2. **Data**: A JavaScript object that provides values for the placeholders  
3. **Process**: The processor replaces placeholders with corresponding values from the data object

## Next Steps

Now that you've seen how the basic functionality works, continue to the [Installation](./installation.md) guide to learn how to set up the library in your project.