import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Info, FileText, Scale, TrendingUp, Search, Bookmark, Calculator } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useAppState } from '@/lib/state/appStore';
import { calculateSummaryTotals, getYTDFilter } from '@/lib/calcs/summary';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedSections, setBookmarkedSections] = useState<Set<TabId>>(new Set());
  const [readSections, setReadSections] = useState<Set<TabId>>(new Set());

  const expenses = useAppState((state) => state.expenses);
  const income = useAppState((state) => state.income);
  const mileage = useAppState((state) => state.mileage);

  const totals = useMemo(() => {
    return calculateSummaryTotals(expenses, income, mileage, getYTDFilter());
  }, [expenses, income, mileage]);

  const estimatedTaxRate = 0.30;
  const estimatedTaxOwing = Math.max(0, (totals.totalIncome - totals.totalDeductible) * estimatedTaxRate);
  const taxSavings = totals.totalDeductible * estimatedTaxRate;

  const toggleBookmark = (tabId: TabId) => {
    setBookmarkedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tabId)) {
        newSet.delete(tabId);
      } else {
        newSet.add(tabId);
      }
      return newSet;
    });
  };

  const markAsRead = (tabId: TabId) => {
    setReadSections(prev => new Set(prev).add(tabId));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'how-it-works':
        return (
          <View style={styles.content}>
            <View style={styles.contentHeader}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>📱</Text>
              </View>
              <Text style={styles.contentTitle}>How Deductly Works (Beta)</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>Getting Started</Text>
              </View>
            </View>

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
            <View style={styles.contentHeader}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>🧾</Text>
              </View>
              <Text style={styles.contentTitle}>Tracking Expenses & Mileage</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>Essential Skills</Text>
              </View>
            </View>

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
            <View style={styles.contentHeader}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>🇨🇦</Text>
              </View>
              <Text style={styles.contentTitle}>CRA Rules for Rideshare & Delivery Drivers</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>Compliance Guide</Text>
              </View>
            </View>

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
            <View style={styles.contentHeader}>
              <View style={styles.emojiCircle}>
                <Text style={styles.emoji}>💰</Text>
              </View>
              <Text style={styles.contentTitle}>Maximize Your Deductions</Text>
              <View style={styles.progressBadge}>
                <Text style={styles.progressText}>Pro Tips</Text>
              </View>
            </View>

            <Text style={styles.paragraph}>
              Every dollar you track matters. As a self-employed driver, your taxes are based on profit (income minus expenses) — so the more expenses you claim, the less tax you pay.
            </Text>

            <Text style={styles.paragraph}>
              Deductly helps you stay organized so you can legally reduce your tax bill and keep more of what you earn.
            </Text>

            <Text style={styles.sectionHeader}>🧾 1. Track Everything, Big or Small</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Every tank of gas, parking fee, car wash, and oil change counts.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Even small daily expenses can add up to hundreds in savings.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Use Deductly to log each expense right when it happens — it's easier than catching up later.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>💡 Tip: Keep your receipts organized</Text>
              <Text style={styles.infoBoxText}>
                Upload photos in Deductly. The CRA can ask for proof for up to 6 years.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🚗 2. Maximize Your Mileage</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Record your start and end odometer readings every day or each trip.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                The higher your business-use percentage, the more of your car expenses you can deduct.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.bold}>Example:</Text> If 80% of your driving is for Uber, 80% of your fuel, insurance, and maintenance costs are deductible.
              </Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>💡 Tip: Make a habit</Text>
              <Text style={styles.infoBoxText}>
                Log mileage whenever you refuel or start your day.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>📱 3. Claim Phone and Data</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                The CRA allows you to deduct part of your cell phone bill used for rideshare work.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Estimate the business-use percentage (usually 50–70%) and apply it to your monthly bill.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Include any extra data costs or navigation subscriptions.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>🏠 4. Don't Miss Home Office Deductions</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                If you manage your rides, bookings, or accounting from home, you may claim part of your rent, utilities, or internet.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Calculate your workspace percentage (e.g., 10% of your home) and apply that to those bills.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Keep a simple note in Deductly to remember which expenses you claimed.
              </Text>
            </View>

            <Text style={styles.sectionHeader}>📊 5. Review Your Totals Regularly</Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Open your Reports page often to see your estimated deductions and business-use percentage.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                Check for missing expenses or trips to make sure nothing is left out.
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                The more complete your records, the smoother your tax filing — and the bigger your legal deductions.
              </Text>
            </View>

            <Text style={styles.subheading}>✅ Remember:</Text>

            <Text style={styles.paragraph}>
              Deductly doesn't just record your data — it turns your effort into savings.
            </Text>

            <Text style={[styles.paragraph, styles.highlight]}>
              By keeping detailed logs, receipts, and mileage, you can confidently export your T2125 knowing you've claimed every deduction you're entitled to.
            </Text>
          </View>
        );
    }
  };

  const filteredTabs = useMemo(() => {
    if (!searchQuery.trim()) return TABS;
    const query = searchQuery.toLowerCase();
    return TABS.filter(tab =>
      tab.title.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.surface, theme.colors.primaryLight]}
        style={styles.hero}
      >
        <View style={styles.heroHeader}>
          <View>
            <Text style={styles.greeting}>Tax Education</Text>
            <Text style={styles.heroTitle}>Learn</Text>
          </View>
          <View style={styles.heroStats}>
            <Text style={styles.statLabel}>Read</Text>
            <Text style={styles.statValue}>{readSections.size}/{TABS.length}</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search topics..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {totals.totalIncome > 0 && (
          <View style={styles.calculatorCard}>
            <View style={styles.calculatorHeader}>
              <Calculator size={20} color={theme.colors.primary} />
              <Text style={styles.calculatorTitle}>Quick Tax Estimate</Text>
            </View>
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Gross Income:</Text>
              <Text style={styles.calculatorValue}>${totals.totalIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Deductions:</Text>
              <Text style={[styles.calculatorValue, styles.successText]}>-${totals.totalDeductible.toFixed(2)}</Text>
            </View>
            <View style={styles.calculatorDivider} />
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabelBold}>Est. Tax (30%):</Text>
              <Text style={styles.calculatorValueBold}>${estimatedTaxOwing.toFixed(2)}</Text>
            </View>
            <View style={styles.calculatorSavings}>
              <Text style={styles.savingsText}>You saved ~${taxSavings.toFixed(2)} in taxes!</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {filteredTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isBookmarked = bookmarkedSections.has(tab.id);
          const isRead = readSections.has(tab.id);
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => {
                setActiveTab(tab.id);
                markAsRead(tab.id);
              }}
            >
              <View style={styles.tabIconRow}>
                <Icon
                  size={20}
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                />
                {isRead && <View style={styles.readDot} />}
              </View>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.title}
              </Text>
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleBookmark(tab.id);
                }}
              >
                <Bookmark
                  size={14}
                  color={isBookmarked ? theme.colors.warning : theme.colors.border}
                  fill={isBookmarked ? theme.colors.warning : 'none'}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

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
    paddingBottom: theme.spacing.base,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.base,
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
  heroStats: {
    alignItems: 'flex-end',
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.base,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text,
    padding: 0,
  },
  calculatorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing.base,
    marginTop: theme.spacing.sm,
  },
  calculatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  calculatorTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calculatorLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  calculatorValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  calculatorLabelBold: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  calculatorValueBold: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  calculatorDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  calculatorSavings: {
    backgroundColor: theme.colors.successLight,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  savingsText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
  },
  successText: {
    color: theme.colors.success,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabBarContent: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  tab: {
    minWidth: 100,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
    position: 'relative',
  },
  tabActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  tabIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
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
  bookmarkButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 2,
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
  contentHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emojiCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  emoji: {
    fontSize: 40,
  },
  contentTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.base,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#fff',
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
