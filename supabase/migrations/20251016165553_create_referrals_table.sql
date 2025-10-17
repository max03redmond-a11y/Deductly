/*
  # Create Referrals Table for Financial Services Hub

  ## New Table: referrals
  
  1. Table Structure
    - `id` (uuid, primary key) - Unique identifier
    - `title` (text) - Service/company name (e.g., "Wealthsimple")
    - `description` (text) - Short 1-2 line description
    - `reward_text` (text, optional) - Reward message (e.g., "Get $50 when you sign up")
    - `logo_url` (text) - URL to company logo image
    - `link_url` (text) - External link to service
    - `display_order` (integer) - Order for display (lower = first)
    - `is_active` (boolean) - Whether to show this referral
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS
    - All authenticated users can read active referrals
    - No user writes (admin-managed content)
  
  3. Seed Data
    - Wealthsimple for investing
    - Koho for prepaid cards
    - QuickBooks for bookkeeping
    - Wave for invoicing
*/

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  reward_text text,
  logo_url text NOT NULL,
  link_url text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read active referrals
CREATE POLICY "Authenticated users can read active referrals"
  ON referrals
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create index on display order and active status
CREATE INDEX IF NOT EXISTS idx_referrals_display ON referrals(display_order, is_active);

-- Seed referral data
INSERT INTO referrals (title, description, reward_text, logo_url, link_url, display_order) VALUES
  (
    'Wealthsimple',
    'Invest in stocks, ETFs, and crypto. Build wealth for your future with low fees and smart portfolios.',
    'Get $25 when you sign up and fund your account',
    'https://cdn.wealthsimple.com/assets/logo.svg',
    'https://www.wealthsimple.com/invite/9WT8PA',
    1
  ),
  (
    'Koho',
    'Get a prepaid Visa card with no fees, instant cashback, and tools to manage your gig income better.',
    'Get $20 when you sign up with a referral code',
    'https://www.koho.ca/press/koho-logo.png',
    'https://www.koho.ca',
    2
  ),
  (
    'QuickBooks Self-Employed',
    'Track expenses, mileage, and income automatically. Generate tax reports and maximize deductions.',
    'Try free for 30 days',
    'https://quickbooks.intuit.com/ca/resources/wp-content/themes/quickbooks/assets/img/qb-logo.svg',
    'https://quickbooks.intuit.com/ca/self-employed/',
    3
  ),
  (
    'Wave',
    'Free invoicing and accounting software designed for small businesses and freelancers.',
    'Free forever - no credit card required',
    'https://www.waveapps.com/assets/img/wave-logo.svg',
    'https://www.waveapps.com',
    4
  ),
  (
    'Stripe',
    'Accept online payments easily. Perfect for gig workers who sell products or services online.',
    'Get started with no monthly fees',
    'https://images.ctfassets.net/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_icon_-_square.svg',
    'https://stripe.com/ca',
    5
  )
ON CONFLICT DO NOTHING;