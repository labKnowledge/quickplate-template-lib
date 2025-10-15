// tests/TemplateProcessor.test.ts

import { TemplateProcessor, TemplateData } from '../src/TemplateProcessor';

describe('TemplateProcessor', () => {
  let processor: TemplateProcessor;

  beforeEach(() => {
    processor = new TemplateProcessor();
  });

  describe('Basic placeholder replacement', () => {
    test('should replace simple placeholders', () => {
      const template = '<h1>Hello {name}!</h1>';
      const data: TemplateData = { name: 'John' };
      const expected = '<h1>Hello John!</h1>';
      
      const result = processor.process(template, data);
      expect(result).toBe(expected);
    });

    test('should handle multiple placeholders', () => {
      const template = '<p>Name: {firstName} {lastName}</p>';
      const data: TemplateData = { firstName: 'John', lastName: 'Doe' };
      const expected = '<p>Name: John Doe</p>';
      
      const result = processor.process(template, data);
      expect(result).toBe(expected);
    });

    test('should handle missing placeholders', () => {
      const template = '<h1>Hello {name}! Welcome {title}.</h1>';
      const data: TemplateData = { name: 'John' };
      const expected = '<h1>Hello John! Welcome .</h1>';

      const result = processor.process(template, data);
      expect(result).toBe(expected);
    });

    test('should escape HTML in placeholders', () => {
      const template = '<p>{content}</p>';
      const data: TemplateData = { content: '<script>alert("xss")</script>' };
      const expected = '<p>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</p>';
      
      const result = processor.process(template, data);
      expect(result).toBe(expected);
    });
  });

  describe('Loop processing', () => {
    test('should process simple loops', () => {
      const template = `
        <ul>
          {LOOP_START:items}
          <li>{name} - {value}</li>
          {LOOP_END:items}
        </ul>
      `;
      const data: TemplateData = {
        items: [
          { name: 'Item 1', value: 'Value 1' },
          { name: 'Item 2', value: 'Value 2' }
        ]
      };
      const result = processor.process(template, data);
      
      // Check that the loop was processed correctly, ignoring whitespace
      expect(result).toContain('<li>Item 1 - Value 1</li>');
      expect(result).toContain('<li>Item 2 - Value 2</li>');
      expect(result).not.toContain('{LOOP_START:items}');
      expect(result).not.toContain('{LOOP_END:items}');
    });

    test('should handle empty loops', () => {
      const template = `
        <ul>
          {LOOP_START:items}
          <li>{name}</li>
          {LOOP_END:items}
        </ul>
      `;
      const data: TemplateData = { items: [] };
      const expected = `
        <ul>
          
        </ul>
      `;
      
      const result = processor.process(template, data);
      expect(result.trim()).toBe(expected.trim());
    });

    test('should use global data in loops when item data is missing', () => {
      const template = `
        <ul>
          {LOOP_START:items}
          <li>{name} - {globalTitle}</li>
          {LOOP_END:items}
        </ul>
      `;
      const data: TemplateData = {
        globalTitle: 'Global',
        items: [
          { name: 'Item 1' },
          { name: 'Item 2' }
        ]
      };
      const result = processor.process(template, data);
      
      // Check that the loop was processed correctly with global data, ignoring whitespace
      expect(result).toContain('<li>Item 1 - Global</li>');
      expect(result).toContain('<li>Item 2 - Global</li>');
      expect(result).not.toContain('{LOOP_START:items}');
      expect(result).not.toContain('{LOOP_END:items}');
    });
  });

  describe('Section removal', () => {
    test('should remove empty sections', () => {
      const template = `
        <div>
          <!-- About Me section -->
          <div class="about-me">{aboutMeText}</div>
          <!-- EndAbout Me section -->
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = { aboutMeText: '' };
      const expected = `
        <div>
          
          <p>Content</p>
        </div>
      `;
      
      const result = processor.process(template, data);
      expect(result.trim()).toBe(expected.trim());
    });

    test('should keep sections with content', () => {
      const template = `
        <div>
          <!-- About Me section -->
          <div class="about-me">{aboutMeText}</div>
          <!-- EndAbout Me section -->
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = { aboutMeText: 'This is about me' };
      const expected = `
        <div>
          
          <div class="about-me">This is about me</div>
          
          <p>Content</p>
        </div>
      `;
      
      const result = processor.process(template, data);
      expect(result.trim()).toBe(expected.trim());
    });

    test('should remove sections with empty arrays', () => {
      const template = `
        <div>
          <!-- Reviews section -->
          <div class="reviews">{reviews}</div>
          <!-- EndReviews section -->
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = { reviews: [] };
      const expected = `
        <div>
          
          <p>Content</p>
        </div>
      `;
      
      const result = processor.process(template, data);
      expect(result.trim()).toBe(expected.trim());
    });
  });

  describe('Conditional element removal', () => {
    test('should remove social media links with empty data', () => {
      const template = `
        <div>
          <a id="instagram" href="{instagramLink}">Instagram</a>
          <a id="facebook" href="{facebookLink}">Facebook</a>
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = {
        instagramLink: '',
        facebookLink: 'https://facebook.com/test',
        socialMedia: { facebook: 'https://facebook.com/test' }
      };

      const result = processor.process(template, data);
      // Should remove the instagram link with empty href
      expect(result).toContain('<a id="facebook" href="https://facebook.com/test">Facebook</a>');
      expect(result).not.toContain('<a id="instagram"');
    });

    test('should remove anchor tags with nested images when href is empty', () => {
      const template = `
        <div class="social-grid">
          <a href="{instagramLink}" id="instagram" class="social" target="_blank">
            <img id="instagramLink" src="https://storage.googleapis.com/liii/SDAssets/Templates/InstaBeige.png" alt="Instagram logo" />
          </a>
          <a href="{tiktokLink}" id="tiktok" class="social" target="_blank">
            <img id="tikTokLink" src="https://storage.googleapis.com/liii/SDAssets/Templates/tikTokBeige.png" alt="TikTok logo" />
          </a>
          <a href="{facebookLink}" id="facebook-2" class="socialFooter" target="_blank">
            <img id="facebookLink-2" src="https://storage.googleapis.com/liii/SDAssets/Templates/facebookBeige.png" alt="Facebook logo" />
          </a>
        </div>
      `;
      const data: TemplateData = {
        instagramLink: 'https://www.instagram.com/test'
        // tiktokLink and facebookLink are missing - should be replaced with empty string
      };

      const result = processor.process(template, data);
      // Should keep instagram link with valid href
      expect(result).toContain('<a href="https://www.instagram.com/test"');
      expect(result).toContain('alt="Instagram logo"');
      // Should remove tiktok and facebook links with empty href (including their nested images)
      expect(result).not.toContain('id="tiktok"');
      expect(result).not.toContain('id="facebook-2"');
      expect(result).not.toContain('alt="TikTok logo"');
      expect(result).not.toContain('alt="Facebook logo"');
    });

    test('should remove empty contact fields', () => {
      const template = `
        <div>
          <p class="phone">{phone}</p>
          <p class="website">{website}</p>
          <p class="address">{address}</p>
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = { 
        phone: '', 
        website: 'https://example.com',
        address: null
      };
      const expected = `
        <div>
          
          <p class="website">https://example.com</p>
          
          <p>Content</p>
        </div>
      `;
      
      const result = processor.process(template, data);
      expect(result.trim()).toBe(expected.trim());
    });
  });

  describe('Advanced features', () => {
    test('should process nested content correctly', () => {
      const template = `
        <div class="profile">
          <h1>{firstName} {lastName}</h1>
          <!-- About Me section -->
          <div class="about-me">{aboutMeText}</div>
          <!-- EndAbout Me section -->
          {LOOP_START:skills}
          <span class="skill">{name}</span>
          {LOOP_END:skills}
        </div>
      `;
      const data: TemplateData = {
        firstName: 'John',
        lastName: 'Doe',
        aboutMeText: 'Software developer',
        skills: [
          { name: 'JavaScript' },
          { name: 'TypeScript' }
        ]
      };
      const result = processor.process(template, data);
      
      // Check that all expected content is present
      expect(result).toContain('<h1>John Doe</h1>');
      expect(result).toContain('<div class="about-me">Software developer</div>');
      expect(result).toContain('<span class="skill">JavaScript</span>');
      expect(result).toContain('<span class="skill">TypeScript</span>');
      
      // Check that comment markers and loop markers are removed
      expect(result).not.toContain('<!-- About Me section -->');
      expect(result).not.toContain('<!-- EndAbout Me section -->');
      expect(result).not.toContain('{LOOP_START:skills}');
      expect(result).not.toContain('{LOOP_END:skills}');
    });
  });

  describe('Special placeholder handling', () => {
    test('should handle addContact with vcard prefix', () => {
      const template = '<a href="{addContact}">Contact</a>';
      const data: TemplateData = { addContact: 'BEGIN:VCARD...END:VCARD' };
      const result = processor.process(template, data);
      
      expect(result).toBe('<a href="data:text/vcard;charset=utf-8,BEGIN%3AVCARD...END%3AVCARD">Contact</a>');
    });
    
    test('should handle stars with repeat functionality', () => {
      const template = '<div class="stars">{stars}</div>';
      
      // Test with number value (5 stars = all filled)
      let data: TemplateData = { stars: 5 };
      let result = processor.process(template, data);
      expect(result).toBe('<div class="stars">★★★★★</div>');
      
      // Test with partial stars (3 stars = 3 filled, 2 empty)
      data = { stars: 3 };
      result = processor.process(template, data);
      expect(result).toBe('<div class="stars">★★★☆☆</div>');
      
      // Test with string value (3 stars = 3 filled, 2 empty)
      data = { stars: '3' };
      result = processor.process(template, data);
      expect(result).toBe('<div class="stars">★★★☆☆</div>');
      
      // Test with 0 stars
      data = { stars: 0 };
      result = processor.process(template, data);
      expect(result).toBe('<div class="stars">☆☆☆☆☆</div>');
      
      // Test with invalid value (defaults to all filled)
      data = { stars: 'invalid' };
      result = processor.process(template, data);
      expect(result).toBe('<div class="stars">★★★★★</div>');
    });
  });

  describe('Advanced cleanup functionality', () => {
    test('should remove sections with empty content using advanced cleanup', () => {
      const template = `
        <div>
          <!-- About Me section -->
          <div class="about-me"></div>
          <!-- EndAbout Me section -->
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = { aboutMeText: '' };
      const result = processor.cleanupContentTemplateAdvanced(template, data);
      
      expect(result).not.toContain('<!-- About Me section -->');
      expect(result).not.toContain('<!-- EndAbout Me section -->');
    });
    
    test('should remove social media links with empty data using advanced cleanup', () => {
      const template = `
        <div>
          <a href="" id="instagram">Instagram</a>
          <a href="https://facebook.com/test" id="facebook">Facebook</a>
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = { 
        instagramLink: '', 
        facebookLink: 'https://facebook.com/test'
      };
      const result = processor.cleanupContentTemplateAdvanced(template, data);
      
      expect(result).not.toContain('id="instagram"');
      expect(result).toContain('https://facebook.com/test');
      expect(result).toContain('Facebook');
    });
    
    test('should remove empty contact fields using advanced cleanup', () => {
      const template = `
        <div>
          <p class="phone"></p>
          <p class="website">https://example.com</p>
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = { 
        phone: '', 
        website: 'https://example.com'
      };
      const result = processor.cleanupContentTemplateAdvanced(template, data);
      
      expect(result).not.toContain('class="phone"');
      expect(result).toContain('https://example.com');
    });
  });

  describe('Generic section handling', () => {
    test('should remove unknown sections with missing data', () => {
      const template = `
        <div>
          <!-- Team Members section -->
          <h2>Team</h2>
          <p>{teamDescription}</p>
          <!-- EndTeam Members section -->
          <!-- Achievements section -->
          <h2>Awards</h2>
          <p>{awards}</p>
          <!-- EndAchievements section -->
          <p>Footer</p>
        </div>
      `;
      const data: TemplateData = {
        // No teamDescription or awards in data - both sections should be removed
      };

      const result = processor.process(template, data);
      expect(result).not.toContain('Team Members');
      expect(result).not.toContain('Achievements');
      expect(result).toContain('Footer');
    });

    test('should remove unknown loop sections with empty arrays', () => {
      const template = `
        <div>
          <!-- Products section -->
          {LOOP_START:products}
          <div class="product">{name}</div>
          {LOOP_END:products}
          <!-- EndProducts section -->
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = {
        products: [] // Empty array - section should be removed
      };

      const result = processor.process(template, data);
      expect(result).not.toContain('Products section');
      expect(result).not.toContain('product');
      expect(result).toContain('Content');
    });

    test('should keep unknown sections with valid data', () => {
      const template = `
        <div>
          <!-- Testimonials section -->
          <h2>What People Say</h2>
          <p>{testimonialText}</p>
          <!-- EndTestimonials section -->
        </div>
      `;
      const data: TemplateData = {
        testimonialText: 'This is amazing!'
      };

      const result = processor.process(template, data);
      expect(result).toContain('What People Say');
      expect(result).toContain('This is amazing!');
    });
  });

  describe('Options', () => {
    test('should respect removeEmptySections option', () => {
      const template = `
        <div>
          <!-- About Me section -->
          <div class="about-me">{aboutMeText}</div>
          <!-- EndAbout Me section -->
          <p>Content</p>
        </div>
      `;
      const data: TemplateData = { aboutMeText: '' };
      
      // With removeEmptySections: false
      const processorWithOptions = new TemplateProcessor({ removeEmptySections: false });
      const result1 = processorWithOptions.process(template, data);
      expect(result1).toContain('<!-- About Me section -->');
      
      // With removeEmptySections: true (default)
      const result2 = processor.process(template, data);
      expect(result2).not.toContain('<!-- About Me section -->');
    });

    test('should respect processLoops option', () => {
      const template = `
        <ul>
          {LOOP_START:items}
          <li>{name}</li>
          {LOOP_END:items}
        </ul>
      `;
      const data: TemplateData = { items: [{ name: 'Test' }] };
      
      // With processLoops: false
      const processorWithOptions = new TemplateProcessor({ processLoops: false });
      const result1 = processorWithOptions.process(template, data);
      expect(result1).toContain('{LOOP_START:items}');
      
      // With processLoops: true (default)
      const result2 = processor.process(template, data);
      expect(result2).not.toContain('{LOOP_START:items}');
    });
  });
});