# Installation

Learn how to install and set up the QuickPlate Template Library in your project.

## npm Installation

Install the library using npm:

```bash
npm install quickplate-template
```

> **Note**: The package is published as `quickplate-template` due to npm naming requirements.

## Yarn Installation

If you're using Yarn:

```bash
yarn add quickplate-template
```

## Import in Your Project

### ES6 Modules
```typescript
import { TemplateProcessor } from 'quickplate-template';
```

### CommonJS
```javascript
const { TemplateProcessor } = require('quickplate-template');
```

## Verify Installation

After installation, verify that everything is working by running this simple test:

```typescript
import { TemplateProcessor } from 'quickplate-template';

const processor = new TemplateProcessor();
const result = processor.process('<p>Hello {name}!</p>', { name: 'Test' });
console.log(result); // Should output: <p>Hello Test!</p>
```

## TypeScript Support

The library includes TypeScript definitions out of the box, so you don't need to install separate type definition files.