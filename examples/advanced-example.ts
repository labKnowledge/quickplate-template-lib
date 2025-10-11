// examples/advanced-example.ts

import { TemplateProcessor } from '../src';

// Create a template processor instance
const processor = new TemplateProcessor();

// Example 1: Special addContact handling
console.log('=== Special addContact Handling ===');
const contactTemplate = `<a href="{addContact}" class="btn-primary">Save Contact</a>`;
const contactData = {
  addContact: 'BEGIN:VCARD\\nFN:John Doe\\nTEL:+1234567890\\nEND:VCARD'
};

const contactResult = processor.process(contactTemplate, contactData);
console.log(contactResult);
// Should output: <a href="data:text/vcard;charset=utf-8,BEGIN%3AVCARD%5CnFN%3AJohn%20Doe%5CnTEL%3A%2B1234567890%5CnEND%3AVCARD" class="btn-primary">Save Contact</a>

// Example 2: Stars functionality
console.log('\\n=== Stars Functionality ===');
const starsTemplate = `<div class="stars">{stars}</div>`;
const starsData = { stars: 5 };

const starsResult = processor.process(starsTemplate, starsData);
console.log(starsResult);
// Should output: <div class="stars">★★★★★</div>

// Example 3: Stars with string value
const starsStringData = { stars: '3' };
const starsStringResult = processor.process(starsTemplate, starsStringData);
console.log(starsStringResult);
// Should output: <div class="stars">★★★</div>

// Example 4: Advanced loop with special processing
console.log('\\n=== Advanced Loop with Special Processing ===');
const reviewTemplate = `
  {LOOP_START:reviews}
  <div class="review">
    <img src="{imageUrl}" alt="{name} photo" class="reviewer-photo" />
    <p class="reviewer">{name}</p>
    <p class="reviewerTitle">{title}</p>
    <div class="stars">{stars}</div>
    <p class="quote">{quote}</p>
  </div>
  {LOOP_END:reviews}
`;

const reviewData = {
  reviews: [
    { 
      imageUrl: 'https://example.com/john.jpg', 
      name: 'John Smith', 
      title: 'CEO', 
      stars: 4, 
      quote: 'Great service!' 
    },
    { 
      imageUrl: 'https://example.com/jane.jpg', 
      name: 'Jane Doe', 
      title: 'CTO', 
      stars: 5, 
      quote: 'Excellent work!' 
    }
  ]
};

const reviewResult = processor.process(reviewTemplate, reviewData);
console.log(reviewResult);

// Example 5: Using the advanced cleanup function
console.log('\\n=== Advanced Cleanup Function ===');
const cleanupTemplate = `
  <div class="profile">
    <!-- About Me section -->
    <div class="about-me">{aboutMeText}</div>
    <!-- EndAbout Me section -->
    
    <!-- Reviews section -->
    <div class="reviews">
      {LOOP_START:reviews}
      <div class="review">{name}</div>
      {LOOP_END:reviews}
    </div>
    <!-- EndReviews section -->
    
    <!-- Socials section -->
    <div class="socials">
      <a href="{instagramLink}" id="instagram">Instagram</a>
      <a href="{facebookLink}" id="facebook">Facebook</a>
    </div>
    <!-- EndSocials section -->
  </div>
`;

const cleanupData = {
  aboutMeText: '', // Empty - section should be removed
  reviews: [], // Empty array - section should be removed
  instagramLink: '', // Empty - should be removed
  facebookLink: 'https://facebook.com/test' // Has value - should remain
};

// Use the advanced cleanup function
const cleanupResult = processor.cleanupContentTemplateAdvanced(cleanupTemplate, cleanupData);
console.log('Result after advanced cleanup:');
console.log(cleanupResult);