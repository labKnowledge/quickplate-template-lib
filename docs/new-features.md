# New Features Documentation

## Layout Reordering & Swapping

The QuickPlate Template Library now supports advanced layout manipulation features that allow users to customize the arrangement of template sections without modifying the template itself.

### 1. Layout Reordering

Define reorderable sections in your template using block markers:

```html
<div class="container">
  <!-- REORDER -->
  <!-- BLOCK:header -->
  <header>Header Content</header>
  <!-- ENDBLOCK:header -->
  
  <!-- BLOCK:main -->
  <main>Main Content</main>
  <!-- ENDBLOCK:main -->
  
  <!-- BLOCK:sidebar -->
  <aside>Sidebar Content</aside>
  <!-- ENDBLOCK:sidebar -->
  <!-- ENDREORDER -->
</div>
```

Control the order with your data:
```javascript
{
  // ... other data
  layoutOrder: ['main', 'sidebar', 'header']  // Reorder to: main, sidebar, header
}
```

### 2. Block Swapping

#### Method A: Data-based Swapping
```javascript
{
  // ... other data
  swaps: [
    { from: 'left-column', to: 'right-column' }
  ]
}
```

#### Method B: Inline Swap Directive
```html
<!-- BLOCK:sectionA -->Content A<!-- ENDBLOCK:sectionA -->
<!-- BLOCK:sectionB -->Content B<!-- ENDBLOCK:sectionB -->
{SWAP:sectionA:sectionB}  <!-- This swaps sections A and B -->
```

### 3. Export Functionality

Export processed templates to different formats:

```typescript
const processor = new TemplateProcessor();
const html = processor.process(template, data);

// Export to different formats
const markdown = processor.export(html, 'markdown');
const text = processor.export(html, 'text');
```

## Complete Example

Here's a comprehensive example showing all new features:

```html
<!-- template.html -->
<div class="business-card">
  <!-- REORDER -->
  <!-- BLOCK:header -->
  <header>
    <h1>{firstName} {lastName}</h1>
    <p class="title">{jobTitle}</p>
  </header>
  <!-- ENDBLOCK:header -->
  
  <!-- BLOCK:contact -->
  <div class="contact">
    <p>Phone: {phone}</p>
    <p>Email: {email}</p>
  </div>
  <!-- ENDBLOCK:contact -->
  
  <!-- BLOCK:about -->
  <div class="about">
    <h3>About</h3>
    <p>{aboutMe}</p>
  </div>
  <!-- ENDBLOCK:about -->
  <!-- ENDREORDER -->
  
  <!-- BLOCK:social -->
  <div class="social">
    {LOOP_START:socialLinks}
      <a href="{url}">{platform}</a>
    {LOOP_END:socialLinks}
  </div>
  <!-- ENDBLOCK:social -->
</div>
```

```javascript
// data.js
const data = {
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Developer',
  phone: '+1-234-567-8900',
  email: 'john@example.com',
  aboutMe: 'Experienced developer...',
  socialLinks: [
    { url: 'https://linkedin.com', platform: 'LinkedIn' }
  ],
  
  // Reorder the main sections
  layoutOrder: ['about', 'contact', 'header'],
  
  // Swap specific blocks
  swaps: [
    { from: 'social', to: 'header' }  // Move social links to header
  ]
};
```

This allows for maximum flexibility - users can choose their preferred layout without the template author having to create multiple versions of the same template.