import DOMPurify from 'dompurify';
import React from 'react';

export function sanitize(html: string) {
  return DOMPurify.sanitize(html, {
    ALLOWED_ATTR: ['class','href','target','rel','aria-*','role'],
    ALLOWED_TAGS: ['b','i','u','em','strong','a','p','span','div','ul','ol','li','br','small','code','pre','table','thead','tbody','tr','th','td','svg','path'],
    RETURN_TRUSTED_TYPE: false
  });
}

export function setSafeHtml(el: HTMLElement, html: string) {
  el.innerHTML = sanitize(html);
}

export const SafeHtml: React.FC<{ html: string; className?: string }> = ({ html, className }) => (
  <div className={className} dangerouslySetInnerHTML={{ __html: sanitize(html) }} />
);