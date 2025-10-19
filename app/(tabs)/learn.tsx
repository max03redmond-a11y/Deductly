import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Info, FileText, Scale, TrendingUp } from 'lucide-react-native';
import { theme } from '@/constants/theme';

type TabId = 'how-it-works' | 'tracking' | 'cra-rules' | 'maximize';

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
];

export default function LearnScreen() {
  const [activeTab, setActiveTab] = useState<TabId>('how-it-works');

  const renderContent = () => {
    switch (activeTab) {
      case 'how-it-works':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>📱</Text>
            <Text style={styles.contentTitle}>How Deductly Works (Beta)</Text>

            <Text style={styles.paragraph}>
              Deductly helps gig workers like Uber, Lyft, and DoorDash drivers organize income, mileage, and expenses so that tax time is easy — even if you're doing it all manually right now.
            </Text>

            <Text style={styles.paragraph}>
              Because Deductly is in beta, you'll need to manually record everything you spend and earn. Here's how to do it properly:
            </Text>

            <Text style={styles.sectionHeader}>💵 1. Record Your Income</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Open the Revenue or Income tab each time you receive a payout from Uber, Lyft, or another platform.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Enter the amount received, date, and source (e.g., "Uber – Weekly Payout").
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Keep notes for bonuses or tips so they're included in your tax totals later.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🧾 2. Log Every Expense</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Record any cost directly related to your gig work — gas, maintenance, repairs, insurance, phone bill, parking, or car washes.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Always enter the amount, date, and short description (e.g., "Gas – Shell Station").
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Keep receipts! Snap photos and store them securely for CRA records.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🚗 3. Track Your Mileage</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Log your start and end odometer readings each day or trip.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly will calculate your business-use percentage automatically (e.g., 75% business use = 75% of vehicle costs deductible).
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Tip:</Text> Reset your odometer log every January 1st for accurate yearly totals.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🧮 4. Export When You're Ready to File</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                When tax season comes, use the Export feature to automatically fill out your CRA Form T2125 – Statement of Business or Professional Activities.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                This form summarizes your total income, total expenses, and vehicle deductions for self-employed drivers.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                You can download the T2125 PDF and send it to your tax preparer or upload it with your return.
              </Text>
            </View>

            <Text style={[styles.paragraph, styles.highlight]}>
              Even though Deductly is still in beta, these steps help you stay organized and compliant — so you're always ready for tax season and never miss a deduction.
            </Text>
          </View>
        );

      case 'tracking':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>🧾</Text>
            <Text style={styles.contentTitle}>Tracking Expenses & Mileage</Text>

            <Text style={styles.paragraph}>
              In Deductly Beta, everything needs to be logged manually — but doing it right now saves you hours later at tax time. The CRA requires you to keep detailed records for all your self-employment expenses and mileage.
            </Text>

            <Text style={styles.sectionHeader}>🧾 1. Logging Expenses</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Each time you pay for something work-related (gas, oil changes, repairs, insurance, phone bill, parking, etc.), add a new expense entry in the app.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Record the date, amount, and a short description like "Gas – Shell Station."
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Select the correct category so it exports properly to your CRA T2125 later.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>💡 Keep every receipt.</Text>
              <Text style={styles.infoBoxText}>
                The CRA can request proof for up to 6 years. Snap photos of all paper receipts or upload screenshots for digital ones. Deductly stores them securely so you never lose evidence of your claims.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🚗 2. Tracking Mileage</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Log each trip's start and end odometer readings in the Mileage tab.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Include a brief note for each trip (e.g., "Airport rides – 4 trips").
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                At year-end, Deductly calculates your business-use percentage, which determines how much of your car expenses are deductible.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Try to record your mileage daily or weekly for accuracy — it's much easier than catching up months later.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🧮 3. Why Accurate Tracking Matters</Text>

            <Text style={styles.paragraph}>
              The more precise your records, the larger your legal deductions and the smaller your audit risk. Every kilometer and every receipt adds up to real tax savings.
            </Text>

            <Text style={[styles.paragraph, styles.highlight]}>
              Deductly helps you stay organized — all your income, expenses, and mileage are stored together so your export to the T2125 is accurate and CRA-ready.
            </Text>
          </View>
        );

      case 'cra-rules':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>🇨🇦</Text>
            <Text style={styles.contentTitle}>CRA Rules for Rideshare & Delivery Drivers</Text>

            <Text style={styles.paragraph}>
              When you drive for Uber, Lyft, or do deliveries, the Canada Revenue Agency (CRA) considers you self-employed — not an employee.
            </Text>

            <Text style={styles.paragraph}>
              This means you run your own small business, and you're responsible for tracking your income, claiming deductions, and paying taxes yourself.
            </Text>

            <Text style={styles.sectionHeader}>💵 1. How Taxes Work</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                You report all your business income on Form T2125 – Statement of Business or Professional Activities.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                You'll include this form with your personal tax return (T1).
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Taxes aren't withheld from your pay, so you'll likely owe tax at year-end unless you make installment payments.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                You also pay CPP contributions (Canada Pension Plan) as both the employer and employee portions — roughly 11% total on your net income.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>💡 Think of yourself as your own boss</Text>
              <Text style={styles.infoBoxText}>
                You keep what's left after business costs and taxes.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🧾 2. What You Can Deduct</Text>

            <Text style={styles.paragraph}>
              You can deduct any reasonable expense used to earn income from your rideshare or delivery work.
            </Text>

            <Text style={styles.subheading}>Common Deductions:</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Fuel & Oil:</Text> Gas for business driving.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Maintenance & Repairs:</Text> Tire changes, brakes, oil changes, car washes.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Insurance:</Text> Vehicle and commercial coverage.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>License & Registration Fees:</Text> Uber fees, vehicle licensing costs.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Phone & Data:</Text> Portion used for rideshare apps and navigation.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Parking & Tolls:</Text> Business-related only.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Interest on Car Loan:</Text> The business-use percentage only.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Home Office (optional):</Text> If you manage bookings or records from home.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🚗 3. Business Use Percentage</Text>

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
                <Text style={styles.bold}>Example:</Text> If 70% of your total kilometres are for Uber, you can claim 70% of your gas, insurance, and maintenance costs.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>💰 4. GST/HST Rules</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                If your total earnings from ridesharing exceed $30,000 in a 12-month period, you must register for GST/HST.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Uber and Lyft usually collect GST/HST on fares for you, but you may need to file and remit it.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Once registered, you can claim input tax credits (ITCs) on eligible expenses (e.g., gas, repairs).
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🧮 5. Why Deductly Helps</Text>

            <Text style={styles.paragraph}>
              Deductly keeps everything in one place — your income, mileage, and expenses — and automatically assigns them to the right CRA categories on the T2125 form.
            </Text>

            <Text style={styles.paragraph}>
              This means when tax season arrives, your data is organized, CRA-compliant, and ready to export.
            </Text>

            <Text style={[styles.paragraph, styles.highlight]}>
              No messy spreadsheets. No missed deductions. Just clean, accurate records.
            </Text>
          </View>
        );

      case 'maximize':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>💰</Text>
            <Text style={styles.contentTitle}>Tips to Maximize Deductions</Text>

            <Text style={styles.paragraph}>
              Smart recordkeeping means bigger refunds and fewer headaches. Here's how to maximize your deductions:
            </Text>

            <View style={styles.tipCard}>
              <Text style={styles.checkmark}>✅</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Track Every Trip</Text>
                <Text style={styles.tipText}>
                  Use Deductly's mileage tracker for every business drive. Even short trips matter.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.checkmark}>✅</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Snap Every Receipt</Text>
                <Text style={styles.tipText}>
                  Gas, maintenance, parking, and even car washes are deductible. Upload a quick photo — no more lost papers.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.checkmark}>✅</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Separate Business & Personal Spending</Text>
                <Text style={styles.tipText}>
                  Use a different card or account for your rideshare work to make recordkeeping cleaner.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.checkmark}>✅</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Claim Phone & Internet</Text>
                <Text style={styles.tipText}>
                  Estimate how much of your phone and data plan you use for work (usually 50–70%) and record it in Deductly.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.checkmark}>✅</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Don't Miss Home Office Deductions</Text>
                <Text style={styles.tipText}>
                  If you manage bookings or accounting from home, you may be able to claim a portion of your rent, utilities, and internet.
                </Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.checkmark}>✅</Text>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Check Your Summary Often</Text>
                <Text style={styles.tipText}>
                  Deductly's dashboard shows your estimated deductions and potential tax savings in real time.
                </Text>
              </View>
            </View>

            <Text style={[styles.paragraph, styles.highlight]}>
              More tracking = more deductions = less tax.
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.primaryLight]}
        style={styles.hero}
      >
        <Text style={styles.greeting}>Tax Education</Text>
        <Text style={styles.heroTitle}>Learn</Text>
      </LinearGradient>

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
    </View>
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
});
