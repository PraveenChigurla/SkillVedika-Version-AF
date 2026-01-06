// 'use client';

// import DOMPurify from 'dompurify';

// interface SafeHTMLProps {
//   readonly html: string;
//   readonly className?: string;
//   readonly allowedTags?: string[];
//   readonly allowedAttributes?: string[];
// }

// /**
//  * SafeHTML component - Sanitizes HTML content to prevent XSS attacks
//  *
//  * This component uses DOMPurify to sanitize HTML before rendering,
//  * ensuring that malicious scripts cannot be executed.
//  *
//  * @param html - The HTML string to sanitize and render
//  * @param className - Optional CSS class name
//  * @param allowedTags - Optional array of allowed HTML tags (defaults to safe set)
//  * @param allowedAttributes - Optional array of allowed HTML attributes (defaults to safe set)
//  */
// export default function SafeHTML({
//   html,
//   className,
//   allowedTags = [
//     'p',
//     'br',
//     'strong',
//     'em',
//     'b',
//     'i',
//     'u',
//     'ul',
//     'ol',
//     'li',
//     'a',
//     'h1',
//     'h2',
//     'h3',
//     'h4',
//     'h5',
//     'h6',
//     'blockquote',
//     'code',
//     'pre',
//     'span',
//     'div',
//     'section',
//     'article',
//   ],
//   allowedAttributes = ['href', 'target', 'rel', 'class', 'id', 'style'],
// }: SafeHTMLProps) {
//   if (!html) {
//     return null;
//   }

//   const sanitized = DOMPurify.sanitize(html, {
//     ALLOWED_TAGS: allowedTags as string[],
//     ALLOWED_ATTR: allowedAttributes as string[],
//     ALLOW_DATA_ATTR: false,
//     // Prevent script execution
//     FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
//     FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
//   });

//   return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
// }


'use client';

import { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  readonly html: string;
  readonly className?: string;
  readonly allowedTags?: string[];
  readonly allowedAttributes?: string[];
}

export default function SafeHTML({
  html,
  className,
  allowedTags = [
    'p',
    'br',
    'strong',
    'em',
    'b',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'code',
    'pre',
    'span',
    'div',
    'section',
    'article',
  ],
  allowedAttributes = ['href', 'target', 'rel', 'class', 'id'],
}: SafeHTMLProps) {
  const [sanitized, setSanitized] = useState<string>('');

  useEffect(() => {
    if (!html) {
      setSanitized('');
      return;
    }

    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      ALLOW_DATA_ATTR: false,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
      FORBID_ATTR: [
        'onerror',
        'onload',
        'onclick',
        'onmouseover',
        'onmouseenter',
        'onfocus',
      ],
      ADD_ATTR: ['rel'],
    });

    setSanitized(clean);
  }, [html, allowedTags, allowedAttributes]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
