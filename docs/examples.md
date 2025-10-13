# Examples

Practical examples demonstrating how to use the QuickPlate Template Library in various scenarios.

## Basic Example

A simple template with basic placeholders:

```typescript
import { TemplateProcessor } from 'quickplate-template';

const processor = new TemplateProcessor();

const template = `
  <div class="profile">
    <h1>{firstName} {lastName}</h1>
    <p>Email: {email}</p>
    <p>Phone: {phone}</p>
  </div>
`;

const data = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1-234-567-8900'
};

const result = processor.process(template, data);
console.log(result);
```

## Loop Processing Example

Processing arrays of data:

```typescript
import { TemplateProcessor } from 'quickplate-template';

const processor = new TemplateProcessor();

const template = `
  <div class="products">
    <h2>Products</h2>
    <ul>
      {LOOP_START:products}
        <li class="product">
          <h3>{name}</h3>
          <p>Price: ${price}</p>
          <p>Category: {category}</p>
        </li>
      {LOOP_END:products}
    </ul>
  </div>
`;

const data = {
  products: [
    { name: 'Laptop', price: 999.99, category: 'Electronics' },
    { name: 'Mouse', price: 29.99, category: 'Electronics' },
    { name: 'Desk Chair', price: 199.99, category: 'Furniture' }
  ]
};

const result = processor.process(template, data);
console.log(result);
```

## Conditional Sections Example

Using conditional sections to show/hide content:

```typescript
import { TemplateProcessor } from 'quickplate-template';

const processor = new TemplateProcessor();

const template = `
  <div class="business-card">
    <h1>{businessName}</h1>
    
    <!-- About section -->
    <div class="about">{aboutText}</div>
    <!-- EndAbout section -->
    
    <!-- Services section -->
    <div class="services">
      <h3>Services</h3>
      <ul>
        {LOOP_START:services}
          <li>{name}</li>
        {LOOP_END:services}
      </ul>
    </div>
    <!-- EndServices section -->
    
    <!-- Contact section -->
    <div class="contact">
      <p>Phone: {phone}</p>
      <p>Email: {email}</p>
      <p>Address: {address}</p>
    </div>
    <!-- EndContact section -->
  </div>
`;

const data = {
  businessName: 'ACME Inc',
  aboutText: 'We provide excellent services',
  services: [
    { name: 'Web Development' },
    { name: 'Consulting' }
  ],
  phone: '+1-555-1234',
  email: 'info@acme.com',
  // address is intentionally missing - section will be removed
  // aboutText is present - section will be kept
};

const result = processor.process(template, data);
console.log(result);
```

## Special Fields Example

Using special field processing:

```typescript
import { TemplateProcessor } from 'quickplate-template';

const processor = new TemplateProcessor();

const template = `
  <div class="review">
    <h3>{reviewerName}</h3>
    <div class="stars">{stars}</div>
    <p>{comment}</p>
    <a href="{addContact}" class="save-contact">Save Contact</a>
  </div>
`;

const data = {
  reviewerName: 'Jane Smith',
  stars: 4,  // Will become ★★★★☆
  comment: 'Excellent service!',
  addContact: 'BEGIN:VCARD\\nFN:Jane Smith\\nTEL:+1234567890\\nEMAIL:jane@example.com\\nEND:VCARD'
};

const result = processor.process(template, data);
console.log(result);
// The stars will render as ★★★★☆ (4 filled, 1 empty)
// The addContact will include the vCard prefix
```

## Complex Template Example

A complete business card template combining all features:

```typescript
import { TemplateProcessor } from 'quickplate-template';

const processor = new TemplateProcessor();

const template = `
<!DOCTYPE html>
<html>
<head>
  <title>{firstName} {lastName} - Business Card</title>
</head>
<body>
  <div class="business-card">
    <div class="header">
      <h1>{firstName} {lastName}</h1>
      <p id="title">{jobTitle}</p>
    </div>
    
    <!-- Logo section -->
    <div class="logo">
      <img src="{logoUrl}" alt="{firstName} {lastName} logo">
    </div>
    <!-- EndLogo section -->
    
    <div class="contact-info">
      <p class="phone">{phone}</p>
      <p class="email">{email}</p>
      <p class="website">{website}</p>
      <p class="address">{address}</p>
    </div>
    
    <!-- About section -->
    <div class="about">
      <h2>About</h2>
      <p>{aboutMe}</p>
    </div>
    <!-- EndAbout section -->
    
    <!-- Services section -->
    <div class="services">
      <h2>Services</h2>
      <ul>
        {LOOP_START:services}
          <li>{name}</li>
        {LOOP_END:services}
      </ul>
    </div>
    <!-- EndServices section -->
    
    <!-- Reviews section -->
    <div class="reviews">
      <h2>Reviews</h2>
      {LOOP_START:reviews}
        <div class="review">
          <h3>{reviewerName}</h3>
          <div class="stars">{stars}</div>
          <p class="comment">{comment}</p>
        </div>
      {LOOP_END:reviews}
    </div>
    <!-- EndReviews section -->
    
    <div class="contact-actions">
      <a href="{addContact}" class="btn">Save Contact</a>
      {LOOP_START:socialLinks}
        <a href="{url}" class="social-link">{platform}</a>
      {LOOP_END:socialLinks}
    </div>
  </div>
</body>
</html>
`;

const data = {
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Senior Developer',
  logoUrl: 'https://example.com/logo.png',
  phone: '+1-234-567-8900',
  email: 'john.doe@example.com',
  website: 'https://johndoe.dev',
  aboutMe: 'Experienced developer with 10+ years in the industry.',
  services: [
    { name: 'Web Development' },
    { name: 'Consulting' },
    { name: 'Training' }
  ],
  reviews: [
    { 
      reviewerName: 'Jane Smith', 
      stars: 5, 
      comment: 'Outstanding work!' 
    },
    { 
      reviewerName: 'Bob Johnson', 
      stars: 4, 
      comment: 'Very professional.' 
    }
  ],
  addContact: 'BEGIN:VCARD\\nFN:John Doe\\nTEL:+1-234-567-8900\\nEMAIL:john.doe@example.com\\nEND:VCARD',
  socialLinks: [
    { url: 'https://linkedin.com/in/johndoe', platform: 'LinkedIn' },
    { url: 'https://twitter.com/johndoe', platform: 'Twitter' }
  ]
};

const result = processor.process(template, data);
console.log(result);
```

## Custom Delimiters Example

Using custom delimiters to avoid conflicts:

```typescript
import { TemplateProcessor } from 'quickplate-template';

const processor = new TemplateProcessor({
  delimiters: ['{{', '}}']  // Using double curly braces
});

const template = `
  <div>
    <h1>{{title}}</h1>
    <p>{{description}}</p>
    <ul>
      {LOOP_START:items}  <!-- Still uses single braces for loops -->
        <li>{{name}} - {{value}}</li>
      {LOOP_END:items}
    </ul>
  </div>
`;

const data = {
  title: 'My Custom Template',
  description: 'This uses custom delimiters',
  items: [
    { name: 'Item 1', value: 'Value 1' },
    { name: 'Item 2', value: 'Value 2' }
  ]
};

const result = processor.process(template, data);
console.log(result);
```