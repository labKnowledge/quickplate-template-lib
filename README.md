# @quickplate/template

A powerful HTML templating library for generating dynamic HTML from templates with support for placeholders, loops, conditional sections, and more.

## Features

- **Placeholder replacement**: Replace `{placeholder}` with actual values from your data
- **Loop processing**: Generate repeated content with `{LOOP_START:name}` and `{LOOP_END:name}`
- **Conditional sections**: Automatically remove sections based on data availability using comment markers
- **HTML escaping**: Prevent XSS by automatically escaping HTML in values
- **Flexible options**: Customize behavior with various options
- **TypeScript support**: Full type definitions included

## Installation

```bash
npm install @quickplate/template
# or
yarn add @quickplate/template
```

## Usage

### Basic Usage

```typescript
import { TemplateProcessor } from '@quickplate/template';

const processor = new TemplateProcessor();

const template = `
  <h1>Hello {name}!</h1>
  <p>You are {age} years old.</p>
`;

const data = {
  name: 'John Doe',
  age: 30
};

const result = processor.process(template, data);
// Output: <h1>Hello John Doe!</h1><p>You are 30 years old.</p>
```

### Loops

```typescript
const template = `
  <ul>
    {LOOP_START:items}
      <li>{name}: {value}</li>
    {LOOP_END:items}
  </ul>
`;

const data = {
  items: [
    { name: 'Apple', value: 5 },
    { name: 'Orange', value: 3 }
  ]
};

const result = processor.process(template, data);
// Output: 
// <ul>
//   <li>Apple: 5</li>
//   <li>Orange: 3</li>
// </ul>
```

### Conditional Sections

```typescript
const template = `
  <div>
    <!-- About Me section -->
    <div class="about-me">About: {aboutMeText}</div>
    <!-- EndAbout Me section -->
    
    <!-- Skills section -->
    <div class="skills">
      {LOOP_START:skills}
        <span class="skill">{name}</span>
      {LOOP_END:skills}
    </div>
    <!-- EndSkills section -->
  </div>
`;

const dataWithContent = {
  aboutMeText: 'Software developer',
  skills: [{ name: 'JavaScript' }, { name: 'TypeScript' }]
};

const result = processor.process(template, dataWithContent);
// Output: sections with content remain, comment markers removed

const dataWithoutSkills = {
  aboutMeText: 'Software developer'
  // skills array is missing or empty
};

const result2 = processor.process(template, dataWithoutSkills);
// Output: skills section is completely removed
```

### Advanced Options

```typescript
const processor = new TemplateProcessor({
  removeEmptySections: true,    // Remove sections with no content (default: true)
  processLoops: true,           // Process loop structures (default: true)
  processPlaceholders: true,    // Process placeholders (default: true)
  delimiters: ['{', '}']        // Custom delimiters (default: ['{', '}'])
});
```

## API

### TemplateProcessor

#### constructor(options?: TemplateOptions)

Create a new template processor with optional configuration.

#### process(template: string, data: TemplateData): string

Process a template with the provided data and return the result.

### TemplateOptions

```typescript
interface TemplateOptions {
  removeEmptySections?: boolean;  // Whether to remove empty sections
  processLoops?: boolean;         // Whether to process loops
  processPlaceholders?: boolean;  // Whether to process placeholders
  delimiters?: [string, string];  // Custom placeholder delimiters
}
```

## Use Cases

This library is perfect for:
- Generating HTML emails
- Creating dynamic web pages from templates
- Building static site generators
- Processing form data into HTML
- Converting template data to full HTML documents

## License

MIT