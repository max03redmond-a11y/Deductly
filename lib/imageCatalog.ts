export const ARTICLE_IMAGES = {
  receipts: 'https://images.unsplash.com/photo-1554224311-beee460ae6ba?auto=format&fit=crop&q=80&w=1200',
  dashboard: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200',
  mileage: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1200',
  car: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=1200',
  taxes: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&q=80&w=1200',
  notebook: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=1200',
  calculator: 'https://images.unsplash.com/photo-1554224311-beee460ae6ba?auto=format&fit=crop&q=80&w=1200',
  money: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1200',
  planning: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200',
  business: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
  savings: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?auto=format&fit=crop&q=80&w=1200',
  insurance: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1200',
  fallback: 'https://images.unsplash.com/photo-1633158829875-e5316a358c6f?auto=format&fit=crop&q=80&w=1200',
};

export type ArticleCategory =
  | 'GST/HST'
  | 'Mileage'
  | 'Write-offs'
  | 'Tax Planning'
  | 'Business'
  | 'Insurance';

export const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  'GST/HST': '#3B82F6',
  'Mileage': '#8B5CF6',
  'Write-offs': '#EC4899',
  'Tax Planning': '#F59E0B',
  'Business': '#10B981',
  'Insurance': '#06B6D4',
};
