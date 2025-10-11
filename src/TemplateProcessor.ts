// src/TemplateProcessor.ts

/**
 * TemplateProcessor - A powerful HTML templating library for generating dynamic HTML from templates
 * 
 * Features:
 * - Basic placeholder replacement
 * - Conditional section removal based on data availability
 * - Loop processing for arrays of data
 * - Support for nested sections
 */

export interface TemplateData {
  [key: string]: any;
}

export interface TemplateOptions {
  /**
   * Whether to remove empty sections when data is not provided
   * @default true
   */
  removeEmptySections?: boolean;
  
  /**
   * Whether to process loops in the template
   * @default true
   */
  processLoops?: boolean;
  
  /**
   * Whether to perform basic placeholder replacements
   * @default true
   */
  processPlaceholders?: boolean;
  
  /**
   * Custom delimiters for placeholders
   * @default ['{', '}']
   */
  delimiters?: [string, string];
}

export class TemplateProcessor {
  private options: Required<TemplateOptions>;
  
  constructor(options?: TemplateOptions) {
    this.options = {
      removeEmptySections: true,
      processLoops: true,
      processPlaceholders: true,
      delimiters: ['{', '}'],
      ...options,
    };
  }
  
  /**
   * Process a template with the provided data
   * @param template - The HTML template string
   * @param data - The data object to use for replacements
   * @returns The processed HTML string
   */
  public process(template: string, data: TemplateData): string {
    let processedTemplate = template;
    
    // Process loops first to populate content
    if (this.options.processLoops) {
      processedTemplate = this.processLoops(processedTemplate, data);
    }
    
    // Process placeholders
    if (this.options.processPlaceholders) {
      processedTemplate = this.replacePlaceholders(processedTemplate, data);
    }
    
    // Process advanced structures (nested loops, conditional elements)
    processedTemplate = this.processAdvancedStructures(processedTemplate, data);
    
    // Remove empty sections after all processing
    if (this.options.removeEmptySections) {
      processedTemplate = this.removeEmptySections(processedTemplate, data);
    }
    
    // Clean up empty elements and whitespace
    processedTemplate = this.cleanupTemplate(processedTemplate);
    
    return processedTemplate;
  }
  
  /**
   * Replace placeholders in the template with actual values
   * @param template - The template string
   * @param data - The data object
   * @returns The template with placeholders replaced
   */
  private replacePlaceholders(template: string, data: TemplateData): string {
    const [openDelim, closeDelim] = this.options.delimiters;
    
    // Create a regex to find all placeholders like {firstName}, {lastName}, etc.
    const regex = new RegExp(`${openDelim}([\\w\\d_-]+)${closeDelim}`, 'g');
    
    return template.replace(regex, (match, placeholder) => {
      if (data.hasOwnProperty(placeholder)) {
        // Handle special cases like addContact and stars
        return this.processSpecialPlaceholder(data[placeholder], placeholder);
      } else {
        // If the placeholder doesn't exist in data, return the original placeholder
        return match;
      }
    });
  }

  /**
   * Process special placeholders that require custom formatting
   * @param value - The value to process
   * @param placeholder - The name of the placeholder
   * @returns The processed value
   */
  private processSpecialPlaceholder(value: any, placeholder: string): string {
    switch (placeholder) {
      case 'addContact':
        // Special handling for vCard contact: add data:text/vcard prefix
        return `data:text/vcard;charset=utf-8,${encodeURIComponent(value || '')}`;
      case 'stars':
        // Convert numeric value to repeated star characters (filled and empty stars)
        let numericValue;
        if (typeof value === 'string') {
          numericValue = parseFloat(value);
        } else if (typeof value === 'number') {
          numericValue = value;
        } else {
          numericValue = NaN;
        }
        
        if (typeof numericValue === 'number' && !isNaN(numericValue) && numericValue >= 0) {
          const filledStars = Math.min(5, Math.max(0, Math.floor(numericValue)));
          const emptyStars = 5 - filledStars;
          return '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
        }
        // Default to all filled stars for invalid values
        return '★★★★★';
      default:
        return this.escapeHtml(value);
    }
  }
  
  /**
   * Process loops in the template
   * @param template - The template string
   * @param data - The data object
   * @returns The template with loops processed
   */
  private processLoops(template: string, data: TemplateData): string {
    // Process all loop sections: {LOOP_START:loopName} ... {LOOP_END:loopName}
    const loopRegex = /{LOOP_START:(\w+)}([\s\S]*?){LOOP_END:\1}/g;
    
    let result = template;
    let match;
    
    while ((match = loopRegex.exec(result)) !== null) {
      const loopName = match[1];
      const loopTemplate = match[2];
      const loopData = data[loopName] || [];
      
      let loopOutput = '';
      
      if (Array.isArray(loopData) && loopData.length > 0) {
        loopOutput = loopData.map((item, index) => {
          // Process the loop template with the current item's data
          let itemTemplate = loopTemplate;
          
          // Replace special index placeholder
          itemTemplate = itemTemplate.replace(/{index}/g, index.toString());
          
          // Handle special processing for image URLs or other complex data
          itemTemplate = this.processComplexDataInLoop(itemTemplate, item, data);
          
          return itemTemplate;
        }).join('\n');
      }
      
      // Replace the entire loop section with the processed output
      result = result.replace(match[0], loopOutput);
      
      // Reset the regex to process the new string
      loopRegex.lastIndex = 0;
    }
    
    return result;
  }
  
  /**
   * Process complex data within a loop (like image URLs)
   * @param itemTemplate - The template for a single loop item
   * @param item - The current item data
   * @param globalData - The global template data
   * @returns The processed template
   */
  private processComplexDataInLoop(itemTemplate: string, item: any, globalData: TemplateData): string {
    // Replace placeholders in the loop template with the current item's data
    const [openDelim, closeDelim] = this.options.delimiters;
    const placeholderRegex = new RegExp(`${openDelim}([\\w\\d_-]+)${closeDelim}`, 'g');
    
    return itemTemplate.replace(placeholderRegex, (match, placeholder) => {
      if (item.hasOwnProperty(placeholder)) {
        // Handle special cases like image URLs
        if (placeholder.endsWith('Url') || placeholder.includes('image') || placeholder.includes('photo')) {
          return this.processImageUrl(item[placeholder]);
        }
        // Handle special placeholders (addContact, stars, etc.)
        return this.processSpecialPlaceholder(item[placeholder], placeholder);
      } else if (globalData.hasOwnProperty(placeholder)) {
        // If not found in item, try to use global data
        if (placeholder.endsWith('Url') || placeholder.includes('image') || placeholder.includes('photo')) {
          return this.processImageUrl(globalData[placeholder]);
        }
        // Handle special placeholders (addContact, stars, etc.)
        return this.processSpecialPlaceholder(globalData[placeholder], placeholder);
      } else {
        return match;
      }
    });
  }
  
  /**
   * Process image URLs, handling different input types (string, File, etc.)
   * @param url - The URL value to process
   * @returns The processed URL
   */
  private processImageUrl(url: any): string {
    if (url instanceof File) {
      // If it's a File object, we can't create an object URL in server-side code
      // In a real implementation, this would need to upload the file and return the URL
      return '/images/placeholder.jpg';
    } else if (typeof url === 'string') {
      return this.escapeHtml(url);
    } else if (url === null || url === undefined) {
      return '/images/placeholder.jpg';
    } else {
      return this.escapeHtml(String(url));
    }
  }
  
  /**
   * Add support for nested loops and advanced conditional processing
   * @param template - The template string
   * @param data - The data object
   * @returns The template with nested structures processed
   */
  private processAdvancedStructures(template: string, data: TemplateData): string {
    let result = template;
    
    // Process nested loops recursively (only if processLoops is enabled)
    if (this.options.processLoops) {
      result = this.processNestedLoops(result, data);
    }
    
    // Process conditional elements (like removing specific social media links)
    result = this.processConditionalElements(result, data);
    
    return result;
  }
  
  /**
   * Process nested loops in the template
   * @param template - The template string
   * @param data - The data object
   * @returns The template with nested loops processed
   */
  private processNestedLoops(template: string, data: TemplateData): string {
    // This is a simplified implementation - for complex nested loops, 
    // one would need a more sophisticated parser
    let result = template;
    
    // For now, we can just run the loop processing multiple times to handle nested cases
    // This is not a perfect solution, but handles most cases
    const maxIterations = 5; // Prevent infinite loops
    let iteration = 0;
    let currentResult = result;
    
    do {
      result = currentResult;
      currentResult = this.processLoops(result, data);
      iteration++;
    } while (currentResult !== result && iteration < maxIterations);
    
    return result;
  }
  
  /**
   * Process conditional elements based on data availability
   * @param template - The template string
   * @param data - The data object
   * @returns The template with conditional elements processed
   */
  private processConditionalElements(template: string, data: TemplateData): string {
    let result = template;
    
    // Example: Remove individual social media links that don't have data
    // Pattern: <a[^>]*id="instagram"[^>]*>.*?</a>
    const socialMediaFields = [
      { field: 'instagramLink', id: 'instagram' },
      { field: 'tikTokLink', id: 'tiktok' },
      { field: 'facebookLink', id: 'facebook' },
      { field: 'linkedInLink', id: 'linkedin' },
      { field: 'dribbbleLink', id: 'dribbble' },
      { field: 'youtubeLink', id: 'youtube' },
      { field: 'slackLink', id: 'slack' },
      { field: 'vimeoLink', id: 'vimeo' },
      { field: 'emailLink', id: 'email' },
      { field: 'callLink', id: 'call' },
      { field: 'textLink', id: 'sms' }
    ];
    
    socialMediaFields.forEach(({ field, id }) => {
      // Find and remove social media links that don't have associated data
      const fieldValue = data[field] || 
                        (data['socialMedia'] && data['socialMedia'][field.replace('Link', '')]) || 
                        (data['socialMedia'] && data['socialMedia'][field.toLowerCase().replace('link', '')]) || 
                        '';
      
      if (!fieldValue || fieldValue.trim() === '') {
        const pattern = new RegExp(`<a[^>]*id=["']${id}["'][^>]*>.*?</a>`, 'gs');
        result = result.replace(pattern, '');
        
        // Also handle div containers with the same id
        const divPattern = new RegExp(`<[^>]*id=["']${id}["'][^>]*>.*?</[^>]*>`, 'gs');
        result = result.replace(divPattern, '');
      }
    });
    
    // Remove empty contact info fields
    if (!data['phone'] || data['phone'].trim() === '') {
      result = result.replace(/<p[^>]*class="[^"]*phone[^"]*"[^>]*>.*?<\/p>/g, '');
    }
    
    if (!data['website'] || data['website'].trim() === '') {
      result = result.replace(/<p[^>]*class="[^"]*website[^"]*"[^>]*>.*?<\/p>/g, '');
    }
    
    if (!data['address'] || (typeof data['address'] === 'object' && !data['address'].streetAddress1)) {
      result = result.replace(/<p[^>]*class="[^"]*address[^"]*"[^>]*>.*?<\/p>/g, '');
    }
    
    // Remove title if empty
    if (!data['title'] || data['title'].trim() === '') {
      result = result.replace(/<p[^>]*id=["']title["'][^>]*>.*?<\/p>/g, '');
    }
    
    return result;
  }
  
  /**
   * Remove empty sections based on data availability
   * @param template - The template string
   * @param data - The data object
   * @returns The template with empty sections removed
   */
  private removeEmptySections(template: string, data: TemplateData): string {
    // Find all commented sections: <!-- Section Name section --> ... <!-- EndSection Name section -->
    const sectionRegex = /<!--\s*([^>]+?)\s+section\s*-->([\s\S]*?)<!--\s*End\1\s+section\s*-->/g;
    
    let result = template;
    let match;
    
    while ((match = sectionRegex.exec(result)) !== null) {
      const sectionName = match[1].trim();
      const fullSectionMatch = match[0];
      const sectionContent = match[2];
      
      // Check if this section should be completely removed based on data availability
      if (this.shouldRemoveSection(sectionName, sectionContent, data)) {
        // Remove the entire section (comments and content)
        result = result.replace(fullSectionMatch, '');
        
        // Reset the regex to process the new string
        sectionRegex.lastIndex = 0;
      } else {
        // Keep the content but remove the comment tags
        result = result.replace(fullSectionMatch, sectionContent);
        
        // Reset the regex to process the new string
        sectionRegex.lastIndex = 0;
      }
    }
    
    return result;
  }
  
  /**
   * Determine if a section should be removed based on data availability
   * @param sectionName - The name of the section
   * @param sectionContent - The content of the section
   * @param data - The data object
   * @returns Whether the section should be removed
   */
  private shouldRemoveSection(sectionName: string, sectionContent: string, data: TemplateData): boolean {
    // For specific sections, we may have specific conditions to remove them
    // This allows custom logic per section type
    
    // For About Me section, remove if aboutMeText is empty in original data
    if (sectionName.toLowerCase().includes('about me')) {
      return !data['aboutMeText'] || data['aboutMeText'].trim() === '';
    }
    
    // For Logo section, remove if businessLogo is empty in original data
    if (sectionName.toLowerCase().includes('logo')) {
      return !data['businessLogo'];
    }
    
    // For Services section, remove if service is empty in original data
    if (sectionName.toLowerCase().includes('services')) {
      return !data['service'] || data['service'].trim() === '';
    }
    
    // For Reviews section, remove if reviews array is empty in original data
    if (sectionName.toLowerCase().includes('reviews')) {
      return !data['reviews'] || (Array.isArray(data['reviews']) && data['reviews'].length === 0);
    }
    
    // For Custom Buttons section, remove if customButtons array is empty in original data
    if (sectionName.toLowerCase().includes('buttons') || sectionName.toLowerCase().includes('custom buttons')) {
      return !data['customButtons'] || (Array.isArray(data['customButtons']) && data['customButtons'].length === 0);
    }
    
    // For Contact Info section, remove specific fields individually, not the whole section
    if (sectionName.toLowerCase().includes('contact info')) {
      // Don't remove the entire section, just process it normally
      // We'll handle individual field removal separately
      return false;
    }
    
    // For Socials section, check if any social media links exist in original data
    if (sectionName.toLowerCase().includes('socials') || sectionName.toLowerCase().includes('social')) {
      const socialMediaFields = [
        'instagramLink', 'tikTokLink', 'facebookLink', 'linkedInLink', 
        'dribbbleLink', 'youtubeLink', 'slackLink', 'vimeoLink', 'emailLink', 
        'callLink', 'textLink'
      ];
      
      return !socialMediaFields.some(field => {
        const value = data[field] || (data['socialMedia'] && data['socialMedia'][field.replace('Link', '')]) || '';
        return value && value.trim() !== '';
      });
    }
    
    // For general sections, check if any placeholders in the section have empty values
    const [openDelim, closeDelim] = this.options.delimiters;
    const placeholderRegex = new RegExp(`${openDelim}([\\w\\d_-]+)${closeDelim}`, 'g');
    const placeholders = [...sectionContent.matchAll(placeholderRegex)];
    
    for (const match of placeholders) {
      const placeholder = match[1];
      
      // Skip special placeholders like {index} in loops
      if (placeholder === 'index') continue;
      
      if (data.hasOwnProperty(placeholder)) {
        const value = data[placeholder];
        
        // If the data value is empty/null/undefined, consider removing the section
        if (value === null || value === undefined || value === '') {
          return true;
        }
        
        // If it's an array and empty, consider removing the section
        if (Array.isArray(value) && value.length === 0) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Escape HTML to prevent XSS
   * @param str - The string to escape
   * @returns The escaped string
   */
  private escapeHtml(str: any): string {
    if (str === null || str === undefined) {
      return '';
    }
    
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  /**
   * Clean up the template by removing empty elements and excessive whitespace
   * @param template - The template string
   * @returns The cleaned template string
   */
  private cleanupTemplate(template: string): string {
    // Clean up multiple consecutive empty lines and whitespace
    let result = template.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Remove excessive whitespace at the end
    result = result.replace(/\s+$/, '');
    
    return result;
  }
  
  /**
   * Alternative function that uses a more flexible approach with configurable rules
   * 
   * @param template - The HTML template content
   * @param data - The form data array containing user inputs
   * @returns The cleaned template with empty sections removed
   */
  public cleanupContentTemplateAdvanced(template: string, data: TemplateData): string {
    // Define cleanup rules - more flexible and configurable
    interface SectionRule {
      condition: string;
      pattern: RegExp;
      check_array?: boolean;
    }
    
    interface ElementRule {
      condition: string;
      pattern: RegExp;
    }
    
    const cleanupRules = {
      // Section-based cleanup
      sections: {
        aboutMe: {
          condition: 'aboutMeText',
          pattern: /<!-- About Me section -->.*?<!-- EndAbout Me section -->/s
        } as SectionRule,
        services: {
          condition: 'service',
          pattern: /<!-- Services section -->.*?<!-- EndServices section -->/s
        } as SectionRule,
        reviews: {
          condition: 'reviews',
          pattern: /<!-- Reviews section -->.*?<!-- EndReviews section -->/s,
          check_array: true
        } as SectionRule,
        buttons: {
          condition: 'customButtons',
          pattern: /<!-- Buttons section -->.*?<!-- EndButtons section -->/s,
          check_array: true
        } as SectionRule,
        logo: {
          condition: 'businessLogoUrl',
          pattern: /<!-- Logo section -->.*?<!-- EndLogo section -->/s
        } as SectionRule
      },

      // Individual element cleanup
      elements: {
        phone: {
          condition: 'phone',
          pattern: /<p[^>]*class="[^"]*phone[^"]*"[^>]*>.*?<\/p>/s
        } as ElementRule,
        website: {
          condition: 'website',
          pattern: /<p[^>]*class="[^"]*website[^"]*"[^>]*>.*?<\/p>/s
        } as ElementRule,
        address: {
          condition: 'address',
          pattern: /<p[^>]*class="[^"]*address[^"]*"[^>]*>.*?<\/p>/s
        } as ElementRule,
        title: {
          condition: 'title',
          pattern: /<p[^>]*id=["']title["'][^>]*>.*?<\/p>/s
        } as ElementRule
      },

      // Social media cleanup
      social_media: {
        instagramLink: 'instagram',
        tikTokLink: 'tiktok',
        facebookLink: 'facebook',
        linkedInLink: 'linkedin',
        dribbbleLink: 'dribbble',
        youtubeLink: 'youtube',
        slackLink: 'slack',
        vimeoLink: 'vimeo',
        emailLink: 'email',
        callLink: 'call',
        textLink: 'sms'
      } as Record<string, string>
    };

    let result = template;

    // Process section cleanup
    for (const [_sectionName, rule] of Object.entries(cleanupRules.sections)) {
      let shouldRemove = false;

      if (rule.check_array && rule.check_array === true) {
        const sectionData = data[rule.condition];
        shouldRemove = !sectionData || 
                      !Array.isArray(sectionData) || 
                      sectionData.length === 0;
      } else {
        shouldRemove = !data[rule.condition] || 
                      data[rule.condition] === '' || 
                      data[rule.condition] === null || 
                      data[rule.condition] === undefined;
      }

      if (shouldRemove) {
        result = result.replace(rule.pattern, '');
      }
    }

    // Process element cleanup
    for (const [_elementName, rule] of Object.entries(cleanupRules.elements)) {
      const conditionValue = data[rule.condition];
      if (!conditionValue || conditionValue === '' || conditionValue === null || conditionValue === undefined) {
        result = result.replace(rule.pattern, '');
      }
    }

    // Process social media cleanup
    for (const [field, id] of Object.entries(cleanupRules.social_media)) {
      const fieldValue = data[field] || '';
      if (!fieldValue || fieldValue.trim() === '') {
        // Remove the specific social media icon/element
        // This looks for anchor tags with the specific id or href containing the field value
        const regex = new RegExp(`<a[^>]*href=["']\\{${field}\\}["'][^>]*>.*?<\\/a>|<[^>]*id=["']${id}["'][^>]*>.*?<\\/[^>]*>`, 'gs');
        result = result.replace(regex, '');
      }
    }

    // Remove Socials Extra section if no extra social media links
    const extraSocialFields = ['youtubeLink', 'slackLink', 'vimeoLink'];
    let hasExtraSocials = false;
    for (const field of extraSocialFields) {
      if (data[field] && data[field].trim() !== '') {
        hasExtraSocials = true;
        break;
      }
    }

    if (!hasExtraSocials) {
      result = result.replace(/<!-- Socials Extra section -->.*?<!-- EndSocials Extra section -->/s, '');
    }

    // Remove main Socials section if no social media links at all
    const mainSocialFields = ['instagramLink', 'tikTokLink', 'facebookLink', 'linkedInLink', 'dribbbleLink'];
    let hasMainSocials = false;
    for (const field of mainSocialFields) {
      if (data[field] && data[field].trim() !== '') {
        hasMainSocials = true;
        break;
      }
    }

    if (!hasMainSocials) {
      result = result.replace(/<!-- Socials section -->.*?<!-- EndSocials section -->/s, '');
    }

    // Clean up whitespace
    result = result.replace(/\n\s*\n\s*\n/g, "\n\n");
    result = result.replace(/\s+$/, '');

    return result;
  }
}