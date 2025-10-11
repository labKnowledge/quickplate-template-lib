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
    
    // Process layout reordering/swapping after placeholder replacement
    processedTemplate = this.processLayoutReordering(processedTemplate, data);
    
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
  
  /**
   * Process layout reordering/swapping based on template blocks
   * @param template - The template string
   * @param data - The data object
   * @returns The template with reordered blocks
   */
  private processLayoutReordering(template: string, data: TemplateData): string {
    let result = template;
    
    // Handle inline swap directives first: {SWAP:block1:block2}
    // Find all block definitions first
    const blockRegex = /<!--\s*BLOCK:(\w+)\s*-->([\s\S]*?)<!--\s*ENDBLOCK:\1\s*-->/g;
    const inlineSwapRegex = /{SWAP:(\w+):(\w+)}/g;
    
    // Extract all blocks with their content
    const blocks: Record<string, string> = {};
    let blockMatch;
    const originalBlocks: { [key: string]: string } = {};
    const blockPositions: { [key: string]: number } = {};
    let position = 0;
    
    // Create a copy to work with
    let workingTemplate = result;
    
    // Extract blocks and store their original content
    while ((blockMatch = blockRegex.exec(workingTemplate)) !== null) {
      const blockName = blockMatch[1];
      const blockContent = blockMatch[2];
      blocks[blockName] = blockContent;
      originalBlocks[blockName] = blockMatch[0];
      blockPositions[blockName] = position++;
    }
    
    // Process inline swaps if any exist
    const swapMatches = [...workingTemplate.matchAll(inlineSwapRegex)];
    if (swapMatches.length > 0) {
      for (const swapMatch of swapMatches) {
        const [, block1, block2] = swapMatch;
        if (blocks[block1] && blocks[block2]) {
          // Swap the content
          const temp = blocks[block1];
          blocks[block1] = blocks[block2];
          blocks[block2] = temp;
        }
      }
      // Remove swap directives
      workingTemplate = workingTemplate.replace(inlineSwapRegex, '');
    }
    
    // Process configured swaps from data
    if (data['swaps'] && Array.isArray(data['swaps'])) {
      for (const swap of data['swaps'] as Array<{from: string, to: string}>) {
        if (blocks[swap.from] && blocks[swap.to]) {
          const temp = blocks[swap.from];
          blocks[swap.from] = blocks[swap.to];
          blocks[swap.to] = temp;
        }
      }
    }
    
    // Process layout reordering
    if (data['layoutOrder'] && Array.isArray(data['layoutOrder'])) {
      const order = data['layoutOrder'] as string[];
      
      // Create the reordered content by concatenating blocks in the specified order
      let reorderedContent = '';
      for (const blockName of order) {
        if (blocks[blockName]) {
          reorderedContent += blocks[blockName];
        }
      }
      
      // Replace the entire reorder container with the reordered content
      const reorderContainerRegex = /<!--\s*REORDER\s*-->([\s\S]*?)<!--\s*ENDREORDER\s*-->/g;
      workingTemplate = workingTemplate.replace(reorderContainerRegex, (_fullMatch, _containerContent) => {
        return reorderedContent;
      });
    }
    
    // Replace individual block markers with their (potentially modified) content
    for (const [blockName, blockContent] of Object.entries(blocks)) {
      const blockMarkerRegex = new RegExp(`<!--\\s*BLOCK:${blockName}\\s*-->[\\s\\S]*?<!--\\s*ENDBLOCK:${blockName}\\s*-->`, 'g');
      workingTemplate = workingTemplate.replace(blockMarkerRegex, blockContent);
    }
    
    return workingTemplate;
  }
  
  /**
   * Export the processed template to different formats
   * @param template - The processed HTML template
   * @param format - The desired output format
   * @param _options - Export options (not used in this basic implementation)
   * @returns The exported content
   */
  public export(template: string, format: 'html' | 'markdown' | 'text' | 'json' | 'ast', _options?: any): string | object {
    switch (format) {
      case 'html':
        return template;
      case 'markdown':
        return this.htmlToMarkdown(template);
      case 'text':
        return this.htmlToText(template);
      case 'json':
      case 'ast':
        // Export as structured data representation of the HTML
        return this.htmlToStructuredData(template);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
  
  /**
   * Convert HTML to a structured JSON representation
   * This can be useful for conversion to other formats like React components for PDF generation
   * @param html - The HTML string to convert
   * @returns Structured representation as JSON object
   */
  private htmlToStructuredData(html: string): object {
    // Parse HTML to a structured format that can be converted to React components
    // This creates a simple AST representation
    return this.parseHtmlToAst(html);
  }
  
  /**
   * Parse HTML string to an Abstract Syntax Tree (AST)
   * @param html - HTML string to parse
   * @returns AST representation of the HTML
   */
  private parseHtmlToAst(html: string): any {
    // Simple HTML parser to create a basic AST
    // This would be more sophisticated in a full implementation
    
    // Remove comments and extract basic structure
    let cleanedHtml = html.replace(/<!--[\s\S]*?-->/g, '');
    
    // This is a simplified parser - in a real implementation, 
    // you'd want to use a proper HTML parser library
    const ast = this.simpleHtmlParse(cleanedHtml);
    
    return {
      type: 'ast',
      nodes: ast,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Simple HTML parser to convert string to basic AST structure
   * @param html - HTML string to parse
   * @returns Array of node objects
   */
  private simpleHtmlParse(html: string): any[] {
    // This is a very basic parser - a production version would be much more robust
    const nodes: any[] = [];
    
    // Very simple approach: extract elements and their content
    const elementRegex = /<([a-zA-Z][a-zA-Z0-9-]*)\s*([^>]*?)>([\s\S]*?)<\/\1>|<([a-zA-Z][a-zA-Z0-9-]*)\s*([^>]*?)\s*\/?>/g;
    let lastIndex = 0;
    let match;
    
    while ((match = elementRegex.exec(html)) !== null) {
      // Add text node for content before this element
      if (match.index > lastIndex) {
        const textContent = html.substring(lastIndex, match.index).trim();
        if (textContent) {
          nodes.push({
            type: 'text',
            content: textContent
          });
        }
      }
      
      // Process the matched element
      if (match[1]) { // Opening/closing tag
        const elementName = match[1];
        const attributesString = match[2];
        const innerContent = match[3];
        
        nodes.push({
          type: 'element',
          tagName: elementName,
          attributes: this.parseAttributes(attributesString),
          children: innerContent.includes('<') ? this.simpleHtmlParse(innerContent) : [
            { type: 'text', content: innerContent }
          ]
        });
      } else if (match[4]) { // Self-closing tag
        const elementName = match[4];
        const attributesString = match[5];
        
        nodes.push({
          type: 'element',
          tagName: elementName,
          attributes: this.parseAttributes(attributesString),
          children: []
        });
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < html.length) {
      const remainingText = html.substring(lastIndex).trim();
      if (remainingText) {
        nodes.push({
          type: 'text',
          content: remainingText
        });
      }
    }
    
    return nodes;
  }
  
  /**
   * Parse attribute string to key-value pairs
   * @param attrString - String containing attributes
   * @returns Object with attribute key-value pairs
   */
  private parseAttributes(attrString: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    if (!attrString.trim()) return attrs;
    
    // Simple attribute parsing (would be more robust in production)
    const attrRegex = /([a-zA-Z0-9-]+)=["']([^"']*)["']/g;
    let attrMatch;
    
    while ((attrMatch = attrRegex.exec(attrString)) !== null) {
      attrs[attrMatch[1]] = attrMatch[2];
    }
    
    return attrs;
  }
  
  /**
   * Get supported export formats
   * @returns Array of supported export formats
   */
  public getSupportedExportFormats(): string[] {
    return ['html', 'markdown', 'text', 'json', 'ast'];
  }
  
  /**
   * Convert HTML to Markdown
   * @param html - The HTML string to convert
   * @returns The Markdown string
   */
  private htmlToMarkdown(html: string): string {
    // Basic HTML to Markdown conversion
    return html
      // Headers
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1')
      // Paragraphs
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      // Lists
      .replace(/<ul[^>]*>/gi, '')  // Remove opening <ul>
      .replace(/<\/ul>/gi, '\n')   // Close <ul> with newline
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      // Bold/Strong
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      // Italic/Emphasis
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      // Links
      .replace(/<a[^>]+href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      // Images
      .replace(/<img[^>]+src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, '![$2]($1)')
      // Clean up extra spaces and newlines
      .replace(/\n\s*\n\s*\n/g, '\n\n');
  }
  
  /**
   * Convert HTML to plain text
   * @param html - The HTML string to convert
   * @returns The plain text string
   */
  private htmlToText(html: string): string {
    return html
      // Remove all tags
      .replace(/<[^>]*>/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }
}