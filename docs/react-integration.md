# Using QuickPlate with React/Next.js

The QuickPlate Template Library now supports AST (Abstract Syntax Tree) export, which makes it easy to convert processed templates to React components or other formats.

## Basic Usage

```javascript
import { TemplateProcessor } from '@quickplate/template';

const processor = new TemplateProcessor();

// Define your template
const template = `
  <div className="profile">
    <h1>{name}</h1>
    <p>{title}</p>
    <ul>
      {LOOP_START:skills}
        <li>{skill}</li>
      {LOOP_END:skills}
    </ul>
  </div>
`;

// Process the template
const processedHtml = processor.process(template, {
  name: 'John Doe',
  title: 'Senior Developer',
  skills: [
    { skill: 'React' },
    { skill: 'TypeScript' },
    { skill: 'Node.js' }
  ]
});

// Get the AST representation
const ast = processor.export(processedHtml, 'ast');
```

## Converting to React Components

The AST can be converted to React components using a mapping function:

```javascript
function astToReact(node) {
  if (node.type === 'text') {
    return node.content;
  } else if (node.type === 'element') {
    const children = node.children.map(astToReact);
    return React.createElement(
      node.tagName,
      { ...node.attributes },
      ...children
    );
  }
}

// Convert the AST to React component
const reactElement = astToReact(ast.nodes[0]); // Assuming single root
```

## Next.js Integration Example

```javascript
// pages/profile.js
import { TemplateProcessor } from '@quickplate/template';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const [profileElement, setProfileElement] = useState(null);
  
  useEffect(() => {
    const processor = new TemplateProcessor();
    
    // Your template
    const template = `
      <div className="profile">
        <h1>{firstName} {lastName}</h1>
        <p>{title}</p>
        <div className="contact">
          <span>Phone: {phone}</span>
          <span>Email: {email}</span>
        </div>
      </div>
    `;
    
    // Process with real data
    const html = processor.process(template, {
      firstName: 'John',
      lastName: 'Doe', 
      title: 'Developer',
      phone: '+1-234-567-8900',
      email: 'john@example.com'
    });
    
    // Convert to AST and then to React
    const ast = processor.export(html, 'ast');
    const reactElement = astToReactElement(ast.nodes[0]);
    setProfileElement(reactElement);
  }, []);
  
  return (
    <div className="page">
      {profileElement || <p>Loading...</p>}
    </div>
  );
}

// Simple AST to React element converter
function astToReactElement(node) {
  if (node.type === 'text') {
    return node.content;
  }
  
  if (node.type === 'element') {
    const children = node.children.map(astToReactElement);
    return React.createElement(
      node.tagName,
      { key: Math.random(), ...formatAttributes(node.attributes) },
      ...children
    );
  }
  
  return null;
}

// Convert HTML attributes to React-compatible attributes
function formatAttributes(attrs) {
  const formatted = {};
  Object.keys(attrs).forEach(key => {
    // Convert class to className, etc.
    const reactKey = key === 'class' ? 'className' : key;
    formatted[reactKey] = attrs[key];
  });
  return formatted;
}
```

## Integration with @react-pdf/renderer

For your @react-pdf/renderer use case:

```javascript
import { TemplateProcessor } from '@quickplate/template';
import { Document, Page, Text, View } from '@react-pdf/renderer';

// Process your template
const processor = new TemplateProcessor();
const html = processor.process(template, data);

// Get AST representation
const ast = processor.export(html, 'ast');

// Convert to PDF components
function astToPdfComponents(node) {
  if (node.type === 'text') {
    return <Text>{node.content}</Text>;
  } else if (node.type === 'element') {
    switch(node.tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
        return <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{node.children.map(astToPdfComponents)}</Text>;
      case 'p':
        return <Text style={{ marginBottom: 5 }}>{node.children.map(astToPdfComponents)}</Text>;
      case 'div':
        return <View style={{ marginBottom: 10 }}>{node.children.map(astToPdfComponents)}</View>;
      default:
        return <Text>{node.children.map(astToPdfComponents)}</Text>;
    }
  }
  return null;
}

// Create PDF document
const MyDocument = () => (
  <Document>
    <Page>
      <View>
        {ast.nodes.map(astToPdfComponents)}
      </View>
    </Page>
  </Document>
);
```

The AST export functionality makes QuickPlate much more versatile for React/Next.js projects by providing structured data that can be easily transformed into the appropriate component format for your target framework.