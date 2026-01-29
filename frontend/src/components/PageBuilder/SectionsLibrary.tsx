import React from 'react';

// Sample section data for 20+ sections (expandable to 300+)
export const SECTION_LIBRARY = [
  {
    type: 'hero',
    label: 'Hero Section',
    category: 'Hero',
    preview: (
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg">Hero Section</div>
        <div className="text-xs">Large headline, CTA, background image</div>
      </div>
    ),
  },
  {
    type: 'feature',
    label: 'Feature Section',
    category: 'Features',
    preview: (
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-blue-700">Feature Section</div>
        <div className="text-xs text-gray-500">List of features, icons, grid</div>
      </div>
    ),
  },
  {
    type: 'footer',
    label: 'Footer Section',
    category: 'Footer',
    preview: (
      <div className="bg-gray-900 text-gray-200 p-4 rounded shadow text-center">
        <div className="font-bold text-lg">Footer Section</div>
        <div className="text-xs">Links, copyright, social</div>
      </div>
    ),
  },
  // ...add 17+ more sample sections for demo (expandable)
  {
    type: 'hero2',
    label: 'Hero Section 2',
    category: 'Hero',
    preview: (
      <div className="bg-blue-700 text-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg">Hero Section 2</div>
        <div className="text-xs">Alt hero layout</div>
      </div>
    ),
  },
  {
    type: 'feature2',
    label: 'Feature Section 2',
    category: 'Features',
    preview: (
      <div className="bg-blue-50 p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-blue-700">Feature Section 2</div>
        <div className="text-xs text-gray-500">Alt feature grid</div>
      </div>
    ),
  },
  {
    type: 'cta',
    label: 'Call to Action',
    category: 'CTA',
    preview: (
      <div className="bg-green-500 text-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg">Call to Action</div>
        <div className="text-xs">CTA button, text</div>
      </div>
    ),
  },
  {
    type: 'testimonial',
    label: 'Testimonial',
    category: 'Social Proof',
    preview: (
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-gray-800">Testimonial</div>
        <div className="text-xs text-gray-500">Customer quote, avatar</div>
      </div>
    ),
  },
  {
    type: 'pricing',
    label: 'Pricing Table',
    category: 'Pricing',
    preview: (
      <div className="bg-yellow-50 p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-yellow-700">Pricing Table</div>
        <div className="text-xs text-gray-500">Plans, prices, features</div>
      </div>
    ),
  },
  {
    type: 'faq',
    label: 'FAQ',
    category: 'FAQ',
    preview: (
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-gray-800">FAQ</div>
        <div className="text-xs text-gray-500">Questions & answers</div>
      </div>
    ),
  },
  {
    type: 'gallery',
    label: 'Gallery',
    category: 'Media',
    preview: (
      <div className="bg-pink-100 p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-pink-700">Gallery</div>
        <div className="text-xs text-gray-500">Images, grid, lightbox</div>
      </div>
    ),
  },
  {
    type: 'contact',
    label: 'Contact Form',
    category: 'Forms',
    preview: (
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-gray-800">Contact Form</div>
        <div className="text-xs text-gray-500">Form fields, submit</div>
      </div>
    ),
  },
  {
    type: 'newsletter',
    label: 'Newsletter Signup',
    category: 'Forms',
    preview: (
      <div className="bg-blue-100 p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-blue-700">Newsletter Signup</div>
        <div className="text-xs text-gray-500">Email input, subscribe</div>
      </div>
    ),
  },
  {
    type: 'stats',
    label: 'Stats Section',
    category: 'Stats',
    preview: (
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-gray-800">Stats Section</div>
        <div className="text-xs text-gray-500">Numbers, icons</div>
      </div>
    ),
  },
  {
    type: 'team',
    label: 'Team Section',
    category: 'Team',
    preview: (
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-gray-800">Team Section</div>
        <div className="text-xs text-gray-500">Avatars, bios</div>
      </div>
    ),
  },
  {
    type: 'video',
    label: 'Video Embed',
    category: 'Media',
    preview: (
      <div className="bg-black text-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg">Video Embed</div>
        <div className="text-xs">YouTube/Vimeo</div>
      </div>
    ),
  },
  {
    type: 'map',
    label: 'Map Section',
    category: 'Location',
    preview: (
      <div className="bg-green-100 p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-green-700">Map Section</div>
        <div className="text-xs text-gray-500">Google Maps, address</div>
      </div>
    ),
  },
  {
    type: 'steps',
    label: 'Steps Section',
    category: 'Process',
    preview: (
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-gray-800">Steps Section</div>
        <div className="text-xs text-gray-500">How it works</div>
      </div>
    ),
  },
  {
    type: 'blog',
    label: 'Blog Posts',
    category: 'Blog',
    preview: (
      <div className="bg-yellow-100 p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-yellow-700">Blog Posts</div>
        <div className="text-xs text-gray-500">Recent articles</div>
      </div>
    ),
  },
  {
    type: 'carousel',
    label: 'Carousel',
    category: 'Media',
    preview: (
      <div className="bg-white p-4 rounded shadow text-center">
        <div className="font-bold text-lg text-gray-800">Carousel</div>
        <div className="text-xs text-gray-500">Image slider</div>
      </div>
    ),
  },
  {
    type: 'divider',
    label: 'Divider',
    category: 'Utility',
    preview: (
      <div className="bg-gray-200 p-2 rounded shadow text-center">
        <div className="font-bold text-xs text-gray-600">Divider</div>
      </div>
    ),
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'Utility',
    preview: (
      <div className="bg-white p-2 rounded shadow text-center">
        <div className="font-bold text-xs text-gray-400">Spacer</div>
      </div>
    ),
  },
];

export type SectionLibraryItemType = typeof SECTION_LIBRARY[number];
