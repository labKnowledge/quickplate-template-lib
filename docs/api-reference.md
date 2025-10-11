# API Reference

Complete API documentation for the QuickPlate Template Library.

## TemplateProcessor Class

### Constructor

```typescript
new TemplateProcessor(options?: TemplateOptions)
```

**Parameters:**
- `options` (optional): Configuration options for the processor

**Options:**
- `removeEmptySections` (boolean, default: `true`): Whether to remove sections with empty content
- `processLoops` (boolean, default: `true`): Whether to process loop syntax
- `processPlaceholders` (boolean, default: `true`): Whether to process placeholders
- `delimiters` ([string, string], default: `['{', '}']`): Custom placeholder delimiters

**Example:**
```typescript
const processor = new TemplateProcessor({
  removeEmptySections: false,
  delimiters: ['{{', '}}']
});
```

### Methods

#### process()
Process a template with provided data.

```typescript
process(template: string, data: TemplateData): string
```

**Parameters:**
- `template`: The HTML template string
- `data`: The data object to use for replacements

**Returns:** The processed HTML string

**Example:**
```typescript
const result = processor.process('<h1>Hello {name}!</h1>', { name: 'John' });
// Returns: '<h1>Hello John!</h1>'
```

#### cleanupContentTemplateAdvanced()
Advanced cleanup method that uses configurable rules.

```typescript
cleanupContentTemplateAdvanced(template: string, data: TemplateData): string
```

**Parameters:**
- `template`: The HTML template content
- `data`: The form data array containing user inputs

**Returns:** The cleaned template with empty sections removed

**Note:** This method is typically used internally but can be called directly for advanced scenarios.

## Interfaces

### TemplateData
```typescript
interface TemplateData {
  [key: string]: any;
}
```

A flexible object type that can contain any data for template processing.

### TemplateOptions
```typescript
interface TemplateOptions {
  removeEmptySections?: boolean;
  processLoops?: boolean;
  processPlaceholders?: boolean;
  delimiters?: [string, string];
}
```

Configuration options for the TemplateProcessor.