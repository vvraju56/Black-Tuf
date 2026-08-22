export const SITE_NAME = 'Black Tuf';
export const SITE_TAGLINE = 'Buy Smart. Sell More.';
export const SITE_DESCRIPTION = 'A modern multi-vendor marketplace where customers discover great products and sellers grow their businesses.';
export const ACCENT_COLOR = '#3b82f6';
export const COPYRIGHT = '© 2026 Black Tuf. All rights reserved. Made with ❤️ by VV';

export const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Deals', href: '/products?sort=-discount' },
  { name: 'Seller Center', href: '/seller' },
  { name: 'Help', href: '/help' },
];

export const footerLinks = {
  Features: [{ name: 'Products', href: '/products' }, { name: 'Deals', href: '/deals' }, { name: 'Wishlist', href: '/wishlist' }, { name: 'Seller Center', href: '/seller' }],
  Resources: [{ name: 'Help Center', href: '/help' }, { name: 'Shipping', href: '/shipping-policy' }, { name: 'Returns', href: '/return-policy' }, { name: 'Documentation', href: '/docs' }],
  Support: [{ name: 'Contact', href: '/contact' }, { name: 'Support Tickets', href: '/support' }, { name: 'Privacy', href: '/privacy-policy' }, { name: 'Terms', href: '/terms' }],
};

export const socialLinks = [
  { name: 'Website', href: 'https://vvraju.netlify.app/', label: 'vvraju.netlify.app' },
  { name: 'GitHub', href: 'https://github.com/vvraju56', label: 'GitHub' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/vishnuraju-v-757b9929b', label: 'LinkedIn' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh',
  'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export const ORDER_STATUSES: { value: string; label: string; color: string }[] = [
  { value: 'pending', label: 'Pending', color: 'muted-foreground' },
  { value: 'confirmed', label: 'Confirmed', color: 'info' },
  { value: 'processing', label: 'Processing', color: 'info' },
  { value: 'packed', label: 'Packed', color: 'info' },
  { value: 'shipped', label: 'Shipped', color: 'info' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'info' },
  { value: 'delivered', label: 'Delivered', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'danger' },
  { value: 'return_requested', label: 'Return Requested', color: 'warning' },
  { value: 'returned', label: 'Returned', color: 'warning' },
  { value: 'refunded', label: 'Refunded', color: 'danger' },
];

export const SELLER_STATUS: { value: string; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];
