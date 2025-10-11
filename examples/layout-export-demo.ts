// examples/layout-export-demo.ts

import { TemplateProcessor } from '../src';

const processor = new TemplateProcessor();

console.log('=== QuickPlate Template Library - Advanced Features Demo ===\\n');

// 1. Basic layout reordering (for a business card template) 
console.log('1. Layout Reordering Demo:');
const businessCardTemplate = `
<div class="business-card">
  <!-- REORDER -->
  <!-- BLOCK:header -->
  <header class="card-header">
    <h1>{firstName} {lastName}</h1>
    <p class="title">{jobTitle}</p>
  </header>
  <!-- ENDBLOCK:header -->
  
  <!-- BLOCK:contact -->
  <div class="contact-info">
    <p>📞 {phone}</p>
    <p>✉️ {email}</p>
    <p>🌐 {website}</p>
  </div>
  <!-- ENDBLOCK:contact -->
  
  <!-- BLOCK:about -->
  <div class="about-section">
    <h3>About</h3>
    <p>{aboutMe}</p>
  </div>
  <!-- ENDBLOCK:about -->
  
  <!-- BLOCK:services -->
  <div class="services-section">
    <h3>Services</h3>
    <ul>
      {LOOP_START:services}
        <li>{name}</li>
      {LOOP_END:services}
    </ul>
  </div>
  <!-- ENDBLOCK:services -->
  <!-- ENDREORDER -->
</div>
`;

const businessCardData = {
  firstName: 'John',
  lastName: 'Doe',
  jobTitle: 'Senior Developer',
  phone: '+1-234-567-8900',
  email: 'john.doe@example.com',
  website: 'https://johndoe.dev',
  aboutMe: 'Experienced developer with 10+ years in the industry.',
  services: [
    { name: 'Web Development' },
    { name: 'Consulting' },
    { name: 'Training' }
  ],
  layoutOrder: ['header', 'services', 'about', 'contact']  // Custom layout: header, services, about, contact
};

const reorderedCard = processor.process(businessCardTemplate, businessCardData);
console.log('Result with reordered layout:');
console.log(reorderedCard);

// 2. Block swapping demo
console.log('\\n2. Block Swapping Demo:');
const swapTemplate = `
<div class="layout">
  <!-- BLOCK:left-column -->
  <div class="left">Left Column: {leftContent}</div>
  <!-- ENDBLOCK:left-column -->
  
  <!-- BLOCK:right-column -->
  <div class="right">Right Column: {rightContent}</div>
  <!-- ENDBLOCK:right-column -->
</div>
`;

const swapData = {
  leftContent: 'Original Left Content',
  rightContent: 'Original Right Content',
  swaps: [{ from: 'left-column', to: 'right-column' }]  // Swap left and right columns
};

const swappedResult = processor.process(swapTemplate, swapData);
console.log('Result with swapped columns:');
console.log(swappedResult);

// 3. Export functionality demo
console.log('\\n3. Export Functionality Demo:');

// Process a template first
const profileTemplate = `
<div class="profile">
  <h1>{name}</h1>
  <p>{title}</p>
  <div class="skills">
    <h2>Skills</h2>
    <ul>
      {LOOP_START:skills}
        <li>{skill}</li>
      {LOOP_END:skills}
    </ul>
  </div>
  <p>Contact: {contact}</p>
</div>
`;

const profileData = {
  name: 'Jane Smith',
  title: 'UX Designer',
  skills: [
    { skill: 'UI Design' },
    { skill: 'Prototyping' },
    { skill: 'User Research' }
  ],
  contact: 'jane@example.com'
};

const processedProfile = processor.process(profileTemplate, profileData);

// Export to different formats
console.log('HTML Export:');
console.log(processedProfile);

console.log('\\nMarkdown Export:');
const markdownProfile = processor.export(processedProfile, 'markdown');
console.log(markdownProfile);

console.log('\\nPlain Text Export:');
const textProfile = processor.export(processedProfile, 'text');
console.log(textProfile);

console.log('\\n=== Demo Complete ===');