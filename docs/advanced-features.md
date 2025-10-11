# Advanced Features

Explore the advanced features of the QuickPlate Template Library that enhance template processing.

## Special Field Processing

The library provides special handling for certain fields to enhance functionality.

### addContact (vCard Support)

When processing the `addContact` field, the library automatically adds the vCard prefix:

**Template:**
```html
<a href="{addContact}">Save Contact</a>
```

**Data:**
```javascript
{
  addContact: 'BEGIN:VCARD\\nFN:John Doe\\nTEL:+1234567890\\nEND:VCARD'
}
```

**Result:**
```html
<a href="data:text/vcard;charset=utf-8,BEGIN%3AVCARD%5CnFN%3AJohn%20Doe%5CnTEL%3A%2B1234567890%5CnEND%3AVCARD">Save Contact</a>
```

This allows users to save contact information directly from the template.

### stars (Rating System)

The `stars` field is converted to a visual 5-star rating system:

**Template:**
```html
<div class="stars">{stars}</div>
```

**Data:**
```javascript
{ stars: 3 }  // Can be number or string
```

**Result:**
```html
<div class="stars">★★★☆☆</div>  <!-- 3 filled stars, 2 empty -->
```

This creates a visual representation of ratings, where filled stars (★) represent the rating value and empty stars (☆) represent the remaining out of 5.

## Advanced Cleanup

The library provides an advanced cleanup method that uses configurable rules:

```typescript
const processor = new TemplateProcessor();
const cleanedTemplate = processor.cleanupContentTemplateAdvanced(template, data);
```

This method offers more flexible section and element removal based on configurable rules, making it suitable for complex templates.

## Custom Delimiters

You can customize the placeholder delimiters to avoid conflicts:

```typescript
const processor = new TemplateProcessor({
  delimiters: ['{{', '}}']  // Use double curly braces
});

const result = processor.process('<p>Hello {{name}}!</p>', { name: 'World' });
// Result: '<p>Hello World!</p>'
```

## Generic Processing

The library maintains its generic nature - it processes any field that follows the template conventions, not just the predefined special fields. This means it can handle custom fields introduced by users around the world without requiring code changes.