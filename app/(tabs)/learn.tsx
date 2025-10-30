import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Info, FileText, Scale, TrendingUp, Rocket, ExternalLink, Shield, DollarSign, Landmark, FileCheck } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { TabScreenWrapper } from '@/components/TabScreenWrapper';

type MainTabId = 'education' | 'resources';
type TabId = 'how-it-works' | 'tracking' | 'cra-rules' | 'maximize' | 'whats-next';

interface Tab {
  id: TabId;
  title: string;
  icon: typeof Info;
  emoji: string;
}

const TABS: Tab[] = [
  { id: 'how-it-works', title: 'How It Works', icon: Info, emoji: '📱' },
  { id: 'tracking', title: 'Tracking', icon: FileText, emoji: '🧾' },
  { id: 'cra-rules', title: 'CRA Rules', icon: Scale, emoji: '🇨🇦' },
  { id: 'maximize', title: 'Maximize', icon: TrendingUp, emoji: '💰' },
  { id: 'whats-next', title: "What's Next", icon: Rocket, emoji: '🚀' },
];

export default function LearnScreen() {
  const [mainTab, setMainTab] = useState<MainTabId>('education');
  const [activeTab, setActiveTab] = useState<TabId>('how-it-works');

  const renderContent = () => {
    switch (activeTab) {
      case 'how-it-works':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>📱</Text>
            <Text style={styles.contentTitle}>How Deductly Works</Text>

            <Text style={styles.paragraph}>
              Deductly helps gig workers like Uber, Lyft, and DoorDash drivers stay organized and tax-ready — automatically tracking income, mileage, expenses, and vehicle depreciation so tax time is stress-free.
            </Text>

            <Text style={styles.sectionHeader}>💵 1. Record Your Income</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Use the Income tab whenever you receive a payout from Uber, Lyft, or another platform.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Enter your gross sales and any additional income like tips, bonuses, or referral rewards.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly automatically calculates your gross business income and adjusts for GST/HST if applicable.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🧾 2. Log Your Expenses</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Add every business-related cost — from gas and maintenance to insurance, licenses, and car washes.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Expenses are grouped into Vehicle and Operating categories for CRA accuracy.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly tracks your totals, applies your business-use percentage, and ensures every deduction is counted.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🚗 3. Track Your Mileage</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Record your business and personal kilometres directly in the Mileage tab.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly calculates your business-use % automatically and applies it to your vehicle deductions.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Use this to stay compliant with CRA record-keeping rules and maximize your deductions.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>⚙️ 4. Calculate Vehicle Depreciation (CCA)</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly helps you calculate your Capital Cost Allowance (CCA) — the CRA's method of depreciating your vehicle.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Select your vehicle class (10, 10.1, or 54 for electric), enter your purchase details, and Deductly does the rest.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                The app applies the half-year rule, tracks your remaining UCC, and automatically connects your deduction to the T2125 form.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>📤 5. Export When You're Ready to File</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                When tax season arrives, simply export your data.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly automatically fills out your CRA Form T2125 – Statement of Business or Professional Activities, complete with all income, expenses, and CCA values.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Download your T2125 PDF and share it with your accountant or upload it directly when you file your taxes.
              </Text>
            </View>

            <Text style={[styles.paragraph, styles.highlight]}>
              🧠 Stay Organized. Maximize Deductions. File with Confidence.{'\n\n'}
              Deductly keeps your records CRA-compliant and your deductions accurate — so you can focus on driving while we handle the math.
            </Text>
          </View>
        );

      case 'tracking':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>📊</Text>
            <Text style={styles.contentTitle}>Tracking Expenses, Mileage & Depreciation</Text>

            <Text style={styles.paragraph}>
              Accurate tracking is the foundation of maximizing your deductions. Deductly keeps all your expenses, mileage, and vehicle depreciation (CCA) in one place so your CRA export is always complete and compliant.
            </Text>

            <Text style={styles.sectionHeader}>🧾 1. Logging Expenses</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Add every business-related cost — like gas, oil changes, repairs, insurance, phone bills, parking, or car washes — right in the app.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Enter the date, amount, vendor, and category to keep everything organized.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly automatically assigns each cost to the correct CRA expense line so it's ready for your T2125 export later.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>💡 Tip: Keep every receipt!</Text>
              <Text style={styles.infoBoxText}>
                The CRA can request proof for up to six years. Snap photos or upload screenshots — Deductly stores them securely so you're always audit-ready.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🚗 2. Tracking Mileage</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Log your start and end odometer readings for each business trip or driving day.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Add short notes (e.g., "Airport rides – 4 trips") for clear recordkeeping.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly automatically calculates your business-use percentage, which determines how much of your vehicle expenses and depreciation are deductible.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Update mileage regularly — daily or weekly — for the most accurate results.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>⚙️ 3. Vehicle Depreciation (CCA)</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                The Capital Cost Allowance (CCA) lets you deduct the decline in value of your vehicle over time.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly makes this simple — enter your vehicle class (10, 10.1, or 54 for electric vehicles), purchase details, and whether the half-year rule applies.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                The app automatically calculates your annual CCA deduction and tracks your remaining Undepreciated Capital Cost (UCC) each year.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                On your T2125 export, Deductly applies your business-use percentage to your CCA so your deduction is accurate and CRA-ready.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🧮 4. Why It Matters</Text>

            <Text style={styles.paragraph}>
              Precise tracking means bigger deductions and less audit risk. Every kilometre, receipt, and CCA entry adds up to real savings.
            </Text>

            <Text style={[styles.paragraph, styles.highlight]}>
              Deductly keeps everything organized — so your income, expenses, mileage, and vehicle depreciation flow seamlessly into your CRA T2125 export, saving you time and stress at tax season.
            </Text>
          </View>
        );

      case 'cra-rules':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>🇨🇦</Text>
            <Text style={styles.contentTitle}>CRA Rules for Rideshare & Delivery Drivers</Text>

            <Text style={styles.paragraph}>
              If you drive for Uber, Lyft, DoorDash, or any other gig platform, the Canada Revenue Agency (CRA) considers you self-employed — meaning you operate your own small business. You're responsible for tracking your income, recording expenses, and paying your own taxes. Deductly is built to make that process simple and CRA-compliant.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>💵 1. How Taxes Work</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Rideshare and delivery income is reported on Form T2125 – Statement of Business or Professional Activities, which you file along with your personal return (T1).
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Platforms don't withhold taxes, so you'll likely owe income tax and CPP contributions at year-end (roughly 11% of your net income for both portions of CPP).
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Making quarterly installment payments can help avoid a large balance owing.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>💡 Tip: Think of yourself as running a small business</Text>
              <Text style={styles.infoBoxText}>
                You keep what's left after expenses and taxes.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>🧾 2. What You Can Deduct</Text>

            <Text style={styles.paragraph}>
              The CRA allows you to deduct any reasonable expense used to earn business income. Deductly automatically assigns these to the correct T2125 lines.
            </Text>

            <Text style={styles.subheading}>Common deductible expenses include:</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Fuel & Oil</Text> – gas used for business driving
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Maintenance & Repairs</Text> – tire changes, brakes, oil, detailing, car washes
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Insurance</Text> – business or rideshare coverage
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>License & Registration</Text> – vehicle licensing and Uber or Lyft fees
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Phone & Data</Text> – portion used for navigation or apps
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Parking & Tolls</Text> – business-related only
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Interest on Car Loan</Text> – business-use portion
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Capital Cost Allowance (CCA)</Text> – yearly vehicle depreciation (Deductly calculates this automatically)
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Home Office (optional)</Text> – if you manage trips, records, or admin work from home
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>🚗 3. Business-Use Percentage</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                You can only claim the portion of expenses that relates to business driving.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly uses your logged mileage to calculate this automatically.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Example:</Text> If 60% of your kilometres are for Uber, Deductly applies 60% to your fuel, insurance, repairs, and CCA.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>💰 4. GST/HST Rules</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Once you earn $30,000 or more in a 12-month period, you must register for GST/HST.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Uber and Lyft usually collect GST/HST on fares, but you may still need to file and remit it to the CRA.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                If registered, you can claim Input Tax Credits (ITCs) on eligible business expenses such as fuel, repairs, and car washes.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly records GST/HST on income and expenses so your totals are ready for your return.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>⚙️ 5. How Deductly Keeps You CRA-Ready</Text>

            <Text style={styles.paragraph}>
              Deductly automatically organizes your income, mileage, vehicle depreciation, and expenses, and maps them to the correct lines on Form T2125.
            </Text>

            <Text style={styles.paragraph}>
              You'll know exactly what to report, what to deduct, and what your true taxable income is — without messy spreadsheets or missed write-offs.
            </Text>

            <Text style={[styles.paragraph, styles.highlight]}>
              🧮 Stay organized. Stay compliant. Save at tax time.
            </Text>
          </View>
        );

      case 'maximize':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>💰</Text>
            <Text style={styles.contentTitle}>Maximize Your Deductions</Text>

            <Text style={styles.paragraph}>
              Every dollar you track matters. As a self-employed driver, your taxes are based on your profit (income minus expenses) — so the more eligible expenses you claim, the less tax you owe. Deductly keeps everything organized and CRA-compliant so you can legally reduce your tax bill and keep more of what you earn.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>🧾 1. Track Everything — Big or Small</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Every tank of gas, parking fee, car wash, oil change, and Uber service cost adds up.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Small daily purchases can turn into hundreds of dollars in deductions by year-end.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Add expenses right away in Deductly — it's faster than catching up months later.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>💡 Tip: Upload a photo of each receipt as soon as you get it.</Text>
              <Text style={styles.infoBoxText}>
                The CRA can request proof for up to six years, and Deductly keeps everything stored safely for you.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>🚗 2. Maximize Your Mileage</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Track your start and end odometer readings for every driving day or trip.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly automatically calculates your business-use percentage, which determines how much of your car expenses — gas, insurance, maintenance, and even depreciation (CCA) — you can claim.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Example:</Text> If 75% of your kilometres are for rideshare driving, you can claim 75% of those related vehicle costs.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>💡 Tip: Make it a habit</Text>
              <Text style={styles.infoBoxText}>
                Log mileage each time you refuel or start your shift.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>📱 3. Claim Your Phone and Data</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                The CRA allows you to deduct the business portion of your cell phone plan.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Estimate how much you use your phone for work (usually 50–70%) and apply that percentage to your monthly bill.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Don't forget to include navigation apps, data add-ons, or subscriptions you use for driving.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>🏠 4. Don't Miss Home-Office Deductions</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                If you manage your bookings, invoices, or accounting from home, you can claim part of your rent, utilities, and internet.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Calculate your workspace percentage (e.g., 10% of your home) and apply it to those costs.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Keep a note in Deductly to remind yourself which expenses you've included.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>📊 5. Review Your Totals Regularly</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Open your Reports page often to check your income, expenses, and estimated deductions.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Make sure every cost and trip is logged — completeness means bigger savings.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly automatically updates your totals, CCA, and business-use percentage, so you always know where you stand.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.subheading}>✅ Remember:</Text>

            <Text style={styles.paragraph}>
              Deductly doesn't just record numbers — it turns organization into savings.
            </Text>

            <Text style={[styles.paragraph, styles.highlight]}>
              By keeping consistent logs, mileage, and receipts, you'll have everything ready for your CRA T2125 export, knowing you've claimed every deduction you're entitled to.
            </Text>
          </View>
        );

      case 'whats-next':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>🚀</Text>
            <Text style={styles.contentTitle}>What's Next for Deductly</Text>

            <Text style={styles.paragraph}>
              We built Deductly to make taxes simple for rideshare and delivery drivers — but this is just the beginning. Our goal is to become the best tax app for every self-employed Canadian, no spreadsheets or stress required.
            </Text>

            <Text style={styles.paragraph}>Here's what's coming next:</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>🧠 Smarter, Simpler Automation</Text>

            <Text style={styles.paragraph}>
              Deductly will soon include an AI Tax Assistant that helps you understand deductions, CRA rules, and personalized savings opportunities — all in plain language. Just ask a question, and get clear answers instantly.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>🔗 Direct Integrations</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Uber & Lyft API Connections</Text> — automatically sync your trip earnings, mileage, and fees right into Deductly.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Bank Account Linking</Text> — securely connect your bank to automatically import business transactions and categorize them for CRA reporting.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>📑 Built-In Tax Filing</Text>

            <Text style={styles.paragraph}>
              We're working toward in-app tax filing, so you can go from tracking to submitting your return without ever leaving Deductly. Your data will flow directly into your T2125 and T1 return, ready for instant submission.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>🇨🇦 Full CRA Compliance</Text>

            <Text style={styles.paragraph}>
              Every update moves Deductly closer to being fully CRA-certified, ensuring every line, category, and export meets official tax standards. Our mission is to make Deductly the easiest and most trusted way for Canadian gig workers and small business owners to stay compliant year-round.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>🌟 Our Vision</Text>

            <Text style={styles.paragraph}>
              To be the #1 tax and finance app for the self-employed — empowering drivers, freelancers, creators, and contractors to take control of their money, automate their taxes, and keep more of what they earn.
            </Text>

            <View style={styles.divider} />

            <Text style={styles.sectionHeader}>💡 Stay Tuned</Text>

            <Text style={styles.paragraph}>
              We're constantly improving Deductly based on your feedback. Keep your app updated to access new features as they roll out — and help shape the future of self-employed tax tools in Canada.
            </Text>
          </View>
        );
    }
  };

  const renderResources = () => {
    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>🔗</Text>
          <Text style={styles.contentTitle}>Helpful Resources</Text>
          <Text style={styles.paragraph}>
            Explore curated resources to help you succeed as a self-employed driver.
          </Text>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => Linking.openURL('https://www.insurancehotline.com/car-insurance/rideshare/')}
          >
            <View style={styles.resourceIcon}>
              <Shield size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Insurance Quotes</Text>
              <Text style={styles.resourceDescription}>
                Compare business-use car insurance tailored for Uber & Lyft drivers.
              </Text>
            </View>
            <ExternalLink size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => Linking.openURL('https://www.wealthsimple.com/en-ca/product/tax-free-savings-account')}
          >
            <View style={styles.resourceIcon}>
              <TrendingUp size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>TFSA Setup (Wealthsimple)</Text>
              <Text style={styles.resourceDescription}>
                Start investing tax-free with your refund.
              </Text>
            </View>
            <ExternalLink size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => Linking.openURL('https://www.nerdwallet.com/ca/banking/best-business-bank-accounts')}
          >
            <View style={styles.resourceIcon}>
              <Landmark size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>Business Bank Accounts</Text>
              <Text style={styles.resourceDescription}>
                Explore options to separate work and personal income.
              </Text>
            </View>
            <ExternalLink size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => Linking.openURL('https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/sole-proprietorships-partnerships/business-expenses.html')}
          >
            <View style={styles.resourceIcon}>
              <FileCheck size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>CRA Resources</Text>
              <Text style={styles.resourceDescription}>
                Learn about tax deductions for self-employed drivers.
              </Text>
            </View>
            <ExternalLink size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => Linking.openURL('https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses.html')}
          >
            <View style={styles.resourceIcon}>
              <DollarSign size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>GST/HST Registration</Text>
              <Text style={styles.resourceDescription}>
                Register for GST/HST and understand your obligations.
              </Text>
            </View>
            <ExternalLink size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <TabScreenWrapper>
      <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.primaryLight]}
        style={styles.hero}
      >
        <Text style={styles.greeting}>Learn & Grow</Text>
        <Text style={styles.heroTitle}>Resources</Text>
      </LinearGradient>

      <View style={styles.mainTabBar}>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'education' && styles.mainTabActive]}
          onPress={() => setMainTab('education')}
        >
          <Text style={[styles.mainTabText, mainTab === 'education' && styles.mainTabTextActive]}>
            Tax Education
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainTab, mainTab === 'resources' && styles.mainTabActive]}
          onPress={() => setMainTab('resources')}
        >
          <Text style={[styles.mainTabText, mainTab === 'resources' && styles.mainTabTextActive]}>
            Resources
          </Text>
        </TouchableOpacity>
      </View>

      {mainTab === 'education' && (
        <>
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Icon
                    size={20}
                    color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
        </>
      )}

      {mainTab === 'resources' && renderResources()}
      </View>
    </TabScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.base,
    paddingBottom: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  tabActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  tabText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  tabTextActive: {
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: theme.spacing.lg,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: theme.spacing.base,
  },
  contentTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  paragraph: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.base,
  },
  highlight: {
    backgroundColor: theme.colors.primaryLight,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  subheading: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.base,
    marginBottom: theme.spacing.sm,
  },
  sectionHeader: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.base,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
    paddingLeft: theme.spacing.sm,
  },
  bullet: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
  },
  bold: {
    fontWeight: theme.typography.fontWeight.semibold,
  },
  infoBox: {
    backgroundColor: theme.colors.secondaryLight,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.base,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    marginVertical: theme.spacing.base,
  },
  infoBoxTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoBoxText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    lineHeight: 22,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.base,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  checkmark: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
    opacity: 0.3,
  },
  mainTabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  mainTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.borderRadius.base,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  mainTabActive: {
    backgroundColor: theme.colors.primary,
  },
  mainTabText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  mainTabTextActive: {
    color: theme.colors.surface,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.base,
    ...theme.shadows.sm,
    gap: theme.spacing.sm,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
});
