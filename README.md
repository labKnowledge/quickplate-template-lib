# QuickPlate Template Library

QuickPlate Template Library is a flexible HTML templating solution that allows developers to create dynamic HTML from templates using placeholder replacement, loops, and conditional sections. The library is designed to work with generic templates regardless of their structure, making it ideal for use in applications where the template format is unknown ahead of time.

## Installation

```bash
npm install quickplate-template
```

> **Note**: The package is published as `quickplate-template` due to npm naming requirements, but contains all the powerful QuickPlate templating features.

### Alternative installation methods:

**Via yarn:**
```bash
yarn add quickplate-template
```

**Direct from GitHub:**
```bash
npm install git+https://github.com/yourusername/quickplate.git
```

## Features

- **Generic Template Support**: Works with any HTML template structure
- **Placeholder Replacement**: Replace `{key}` placeholders with data values
- **Loop Processing**: Process arrays with `{LOOP_START:name}...{LOOP_END:name}` syntax  
- **Conditional Sections**: Automatically remove empty sections based on data availability
- **Special Field Processing**: Enhanced handling for specific fields like `stars` and `addContact`
- **Layout Reordering**: Dynamically reorder template sections using `<!-- BLOCK:name -->...<!-- ENDBLOCK:name -->` and `layoutOrder` data property
- **Block Swapping**: Swap template blocks with `{SWAP:block1:block2}` directive or `swaps` data property
- **HTML-to-Template Conversion**: Generate templates and expected data structures from existing HTML (`generateTemplateFromHtml`)
- **Advanced Export Options**: Convert processed templates to multiple formats (HTML, Markdown, Text, AST for component conversion)
- **AST Export**: Get Abstract Syntax Tree representation for easy conversion to React/Next.js components or PDF formats
- **React Integration Ready**: AST format makes conversion to React components straightforward
- **@react-pdf/renderer Compatible**: AST structure can be mapped to PDF components
- **Automatic HTML Escaping**: Prevents XSS vulnerabilities
- **Configurable**: Customize behavior with options
- **TypeScript Support**: Full TypeScript definitions included

## Installation

```bash
npm install @quickplate/template
```

## Quick Start

```typescript
import { TemplateProcessor } from '@quickplate/template';

// Create a processor instance
const processor = new TemplateProcessor();

// Define your template with placeholders
const template = `
  <div class="profile">
    <h1>{firstName} {lastName}</h1>
    <p>Email: {email}</p>
    
    <!-- Reviews section -->
    <div class="reviews">
      {LOOP_START:reviews}
        <div class="review">
          <h3>{name}</h3>
          <div class="stars">{stars}</div>
          <p>{comment}</p>
        </div>
      {LOOP_END:reviews}
    </div>
    <!-- EndReviews section -->
  </div>
`;

// Define the data
const data = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  reviews: [
    { name: 'Jane Smith', stars: 5, comment: 'Great service!' },
    { name: 'Bob Johnson', stars: 4, comment: 'Professional work.' }
  ]
};

// Process the template
const result = processor.process(template, data);
console.log(result);
```

## Documentation

For complete documentation, visit:
- [Getting Started](./docs/getting-started.md)
- [Installation](./docs/installation.md) 
- [Core Concepts](./docs/core-concepts.md)
- [API Reference](./docs/api-reference.md)
- [Advanced Features](./docs/advanced-features.md)
- [Best Practices](./docs/best-practices.md)
- [Examples](./docs/examples.md)

## Special Field Processing

The library provides special handling for specific fields:

### stars
Converts numeric values to 5-star rating display:
- `{stars: 4}` becomes `★★★★☆`
- `{stars: 2}` becomes `★★☆☆☆`

### addContact
Automatically adds vCard prefix for contact information:
- `{addContact: 'VCARD_DATA'}` becomes `data:text/vcard;charset=utf-8,ENCODED_VCARD_DATA`

## Compatibility

- Node.js v12 or higher
- Works with both JavaScript and TypeScript
- Browser environments (with bundler)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for more details.

## License

MIT