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
            <Text style={styles.contentTitle}>Proper Expense & Mileage Tracking</Text>

            <Text style={styles.paragraph}>
              To claim deductions, the CRA requires proof that your expenses are business-related. Proper tracking ensures you can back up every claim if asked.
            </Text>

            <Text style={styles.subheading}>What to Track:</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Fuel & Oil:</Text> Every gas purchase related to rides or deliveries.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Maintenance & Repairs:</Text> Oil changes, tires, brake work, cleaning, detailing.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Insurance & Licensing:</Text> Vehicle insurance, Uber or commercial licenses.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Phone & Data:</Text> The portion used for your rideshare or delivery work.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Car Washes & Parking:</Text> Small costs that add up over the year.
              </Text>
            </View>

            <Text style={styles.subheading}>Mileage Tracking:</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Log your start and end odometer readings at the beginning and end of each trip or day.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Deductly will calculate your business-use % (e.g., 70% business, 30% personal).
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                This % is applied across all vehicle-related expenses to calculate your CRA-eligible deductions.
              </Text>
            </View>

            <Text style={[styles.paragraph, styles.highlight]}>
              The more accurately you track, the more you save — and the easier your tax season becomes.
            </Text>
          </View>
        );

      case 'cra-rules':
        return (
          <View style={styles.content}>
            <Text style={styles.emoji}>🇨🇦</Text>
            <Text style={styles.contentTitle}>CRA Rules for Uber/Delivery Drivers</Text>

            <Text style={styles.paragraph}>
              As a rideshare or delivery driver in Canada, you're considered self-employed. That means you don't get a T4 — instead, you report your income and claim deductions using Form T2125 – Statement of Business or Professional Activities.
            </Text>

            <Text style={styles.subheading}>Here's what the CRA expects from you:</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Report all income earned through platforms like Uber, Lyft, SkipTheDishes, etc.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Keep detailed records of business expenses and mileage.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Claim deductions only for the portion used for business purposes (e.g., if you use your car 70% for work, claim 70% of gas, insurance, etc.).
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Keep records for 6 years, in case the CRA requests proof.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>GST/HST Note:</Text>
              <Text style={styles.infoBoxText}>
                If your total income exceeds $30,000 in any 12-month period, you must register for a GST/HST number and begin charging and remitting GST/HST on your fares.
              </Text>
            </View>

            <Text style={[styles.paragraph, styles.highlight]}>
              Deductly helps you stay compliant by keeping all your logs and expenses in one place, ready for your tax preparer or CRA upload.
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
