# Core Concepts

Understand the fundamental concepts of template processing with QuickPlate Template Library.

## Templates

A template is an HTML string that contains placeholders. Placeholders are enclosed in curly braces `{}` by default.

**Example:**
```html
<h1>Welcome, {firstName} {lastName}!</h1>
<p>Your email is: {email}</p>
```

## Placeholders

Placeholders are keys that will be replaced with actual values from your data object.

### Standard Placeholders
- Format: `{keyName}`
- Replaced with corresponding values from the data object
- Special handling for certain keys (see Advanced Features)

### Escaping
All placeholder values are automatically HTML-escaped to prevent XSS attacks.

## Loops

Use loops to process arrays of data.

### Syntax
```html
{LOOP_START:arrayName}
  Content with {placeholders}
{LOOP_END:arrayName}
```

### Example
```html
<ul>
  {LOOP_START:items}
    <li>{name} - ${price}</li>
  {LOOP_END:items}
</ul>
```

With data:
```javascript
{
  items: [
    { name: 'Laptop', price: 999.99 },
    { name: 'Mouse', price: 29.99 }
  ]
}
```

## Conditional Sections

Remove sections based on data availability using HTML comments.

### Syntax
```html
<!-- Section Name section -->
Content to conditionally include
<!-- EndSection Name section -->
```

If the corresponding data value is empty, the entire section will be removed.

### Example
```html
<!-- About Me section -->
<div class="about">{aboutMeText}</div>
<!-- EndAbout Me section -->
```

If `aboutMeText` is empty, the entire section will be removed from the output.

## Processing Order

The library processes templates in this order:
1. Process loops
2. Process placeholders
3. Process advanced structures
4. Remove empty sections
5. Clean up whitespace