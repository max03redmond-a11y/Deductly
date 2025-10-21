import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { T2125Data, formatCurrency, formatPercent } from './mapper';

export interface T2125CSVRow {
  section: string;
  lineNumber: string;
  description: string;
  amount: string;
}

export function generateT2125CSV(data: T2125Data): string {
  const rows: T2125CSVRow[] = [];

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'IDENTIFICATION',
    amount: '',
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Your name',
    amount: data.identification.yourName,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Social Insurance Number',
    amount: data.identification.sin,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Business name',
    amount: data.identification.businessName,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Business number',
    amount: data.identification.businessNumber,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Business address',
    amount: data.identification.businessAddress,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'City',
    amount: data.identification.city,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Province',
    amount: data.identification.province,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Postal code',
    amount: data.identification.postalCode,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Fiscal period start',
    amount: data.identification.fiscalPeriodStart,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Fiscal period end',
    amount: data.identification.fiscalPeriodEnd,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Main product or service',
    amount: data.identification.mainProductService,
  });

  rows.push({
    section: 'Part 1',
    lineNumber: '',
    description: 'Industry code',
    amount: data.identification.industryCode,
  });

  // Only include Part 2 if there are internet business activities
  if (data.part2_internet.numWebsites > 0) {
    rows.push({
      section: 'Part 2',
      lineNumber: '',
      description: 'INTERNET BUSINESS ACTIVITIES',
      amount: '',
    });

    rows.push({
      section: 'Part 2',
      lineNumber: '',
      description: 'Number of websites',
      amount: data.part2_internet.numWebsites.toString(),
    });

    if (data.part2_internet.website1) {
      rows.push({
        section: 'Part 2',
        lineNumber: '',
        description: 'Website 1',
        amount: data.part2_internet.website1,
      });
    }

    if (data.part2_internet.website2) {
      rows.push({
        section: 'Part 2',
        lineNumber: '',
        description: 'Website 2',
        amount: data.part2_internet.website2,
      });
    }

    if (data.part2_internet.website3) {
      rows.push({
        section: 'Part 2',
        lineNumber: '',
        description: 'Website 3',
        amount: data.part2_internet.website3,
      });
    }

    rows.push({
      section: 'Part 2',
      lineNumber: '',
      description: 'Percentage of income from website(s)',
      amount: data.part2_internet.incomeFromWebPercent.toString() + '%',
    });
  }

  rows.push({
    section: 'Part 3A',
    lineNumber: '3A',
    description: 'Gross sales (including GST/HST)',
    amount: formatCurrency(data.part3a_businessIncome.line3A_grossSales),
  });

  rows.push({
    section: 'Part 3A',
    lineNumber: '3B',
    description: 'GST/HST collected',
    amount: formatCurrency(data.part3a_businessIncome.line3B_gstHstCollected),
  });

  rows.push({
    section: 'Part 3A',
    lineNumber: '3C',
    description: 'Net sales (3A - 3B)',
    amount: formatCurrency(data.part3a_businessIncome.line3C_subtotal),
  });

  rows.push({
    section: 'Part 3C',
    lineNumber: '8000',
    description: 'Adjusted gross sales or adjusted professional fees',
    amount: formatCurrency(data.part3c_income.line8000_adjustedGrossSales),
  });

  if (data.part3c_income.line8230_otherIncome > 0) {
    rows.push({
      section: 'Part 3C',
      lineNumber: '8230',
      description: 'Other income (tips, bonuses, referrals)',
      amount: formatCurrency(data.part3c_income.line8230_otherIncome),
    });
  }

  rows.push({
    section: 'Part 3C',
    lineNumber: '8299',
    description: 'Gross business income (3C + 8230)',
    amount: formatCurrency(data.part3c_income.line8299_grossBusinessIncome),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '',
    description: 'EXPENSES',
    amount: '',
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8521',
    description: 'Advertising',
    amount: formatCurrency(data.part4_expenses.line8521_advertising),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8523',
    description: 'Meals and entertainment (50%)',
    amount: formatCurrency(data.part4_expenses.line8523_mealsEntertainment),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8590',
    description: 'Bad debts',
    amount: formatCurrency(data.part4_expenses.line8590_badDebts),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8690',
    description: 'Insurance',
    amount: formatCurrency(data.part4_expenses.line8690_insurance),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8710',
    description: 'Interest and bank charges',
    amount: formatCurrency(data.part4_expenses.line8710_interestBankCharges),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8760',
    description: 'Business taxes, licences and memberships',
    amount: formatCurrency(data.part4_expenses.line8760_businessTaxesLicences),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8810',
    description: 'Office expenses',
    amount: formatCurrency(data.part4_expenses.line8810_officeExpenses),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8811',
    description: 'Office stationery and supplies',
    amount: formatCurrency(data.part4_expenses.line8811_officeStationery),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8860',
    description: 'Professional fees',
    amount: formatCurrency(data.part4_expenses.line8860_professionalFees),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8871',
    description: 'Management and administration fees',
    amount: formatCurrency(data.part4_expenses.line8871_managementFees),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8910',
    description: 'Rent',
    amount: formatCurrency(data.part4_expenses.line8910_rent),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '8960',
    description: 'Repairs and maintenance',
    amount: formatCurrency(data.part4_expenses.line8960_repairsMaintenance),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9060',
    description: 'Salaries, wages and benefits',
    amount: formatCurrency(data.part4_expenses.line9060_salariesWages),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9180',
    description: 'Property taxes',
    amount: formatCurrency(data.part4_expenses.line9180_propertyTaxes),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9200',
    description: 'Travel expenses',
    amount: formatCurrency(data.part4_expenses.line9200_travelExpenses),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9225',
    description: 'Telephone and utilities',
    amount: formatCurrency(data.part4_expenses.line9225_telephone),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9220',
    description: 'Utilities',
    amount: formatCurrency(data.part4_expenses.line9220_utilities),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9224',
    description: 'Fuel costs (except for motor vehicles)',
    amount: formatCurrency(data.part4_expenses.line9224_fuelCosts),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9270',
    description: 'Other expenses',
    amount: formatCurrency(data.part4_expenses.line9270_otherExpenses),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9275',
    description: 'Delivery, freight and express',
    amount: formatCurrency(data.part4_expenses.line9275_deliveryFreight),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9281',
    description: 'Motor vehicle expenses (not including CCA)',
    amount: formatCurrency(data.part4_expenses.line9281_motorVehicleExpenses),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9936',
    description: 'Capital cost allowance (CCA)',
    amount: formatCurrency(data.part4_expenses.line9936_cca),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9945',
    description: 'Business-use-of-home expenses',
    amount: formatCurrency(data.part5_netIncome.line9945_businessUseOfHome),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9368',
    description: 'Total expenses',
    amount: formatCurrency(data.part4_expenses.line9368_totalExpenses),
  });

  rows.push({
    section: 'Part 4',
    lineNumber: '9369',
    description: 'Net income (loss) before adjustments',
    amount: formatCurrency(data.part5_netIncome.line9369_netIncomeBeforeAdjustments),
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '',
    description: 'MOTOR VEHICLE EXPENSES',
    amount: '',
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '1',
    description: 'Business kilometres',
    amount: data.chartA_motorVehicle.line1_businessKm.toString(),
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '2',
    description: 'Total kilometres',
    amount: data.chartA_motorVehicle.line2_totalKm.toString(),
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '',
    description: 'Business use percentage',
    amount: formatPercent(data.chartA_motorVehicle.businessUsePercent) + '%',
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '3',
    description: 'Fuel and oil',
    amount: formatCurrency(data.chartA_motorVehicle.line3_fuelOil),
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '5',
    description: 'Insurance',
    amount: formatCurrency(data.chartA_motorVehicle.line5_insurance),
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '6',
    description: 'Licence and registration',
    amount: formatCurrency(data.chartA_motorVehicle.line6_licenceRegistration),
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '7',
    description: 'Maintenance and repairs',
    amount: formatCurrency(data.chartA_motorVehicle.line7_maintenance),
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '12',
    description: 'Total motor vehicle expenses',
    amount: formatCurrency(data.chartA_motorVehicle.line12_totalExpenses),
  });

  rows.push({
    section: 'Chart A',
    lineNumber: '13',
    description: 'Business use part',
    amount: formatCurrency(data.chartA_motorVehicle.line13_businessPortion),
  });

  rows.push({
    section: 'Part 5',
    lineNumber: '',
    description: 'NET INCOME (LOSS)',
    amount: '',
  });

  rows.push({
    section: 'Part 5',
    lineNumber: '9369',
    description: 'Net income (loss) before adjustments',
    amount: formatCurrency(data.part5_netIncome.line9369_netIncomeBeforeAdjustments),
  });

  if (data.part5_netIncome.line5B_canadianJournalismCredit > 0) {
    rows.push({
      section: 'Part 5',
      lineNumber: '—',
      description: 'Canadian journalism labour tax credit',
      amount: formatCurrency(data.part5_netIncome.line5B_canadianJournalismCredit),
    });
  }

  if (data.part5_netIncome.line9974_gstHstRebate > 0) {
    rows.push({
      section: 'Part 5',
      lineNumber: '9974',
      description: 'GST/HST rebate',
      amount: formatCurrency(data.part5_netIncome.line9974_gstHstRebate),
    });
  }

  rows.push({
    section: 'Part 5',
    lineNumber: '9943',
    description: 'Net income (loss) after adjustments',
    amount: formatCurrency(data.part5_netIncome.line5D_netIncomeAfterAdjustments),
  });

  rows.push({
    section: 'Part 5',
    lineNumber: '9945',
    description: 'Business-use-of-home expenses',
    amount: formatCurrency(data.part5_netIncome.line9945_businessUseOfHome),
  });

  rows.push({
    section: 'Part 5',
    lineNumber: '9946',
    description: 'Net income (loss) - Enter on line 13500 of your return',
    amount: formatCurrency(data.part5_netIncome.line9946_yourNetIncome),
  });

  rows.push({
    section: '',
    lineNumber: '',
    description: '',
    amount: '',
  });

  rows.push({
    section: 'DETAILED EXPENSES',
    lineNumber: '',
    description: '',
    amount: '',
  });

  rows.push({
    section: 'Date',
    lineNumber: 'Line',
    description: 'Merchant / Description / Category',
    amount: 'Deductible Amount',
  });

  data.expenseDetails.forEach((expense) => {
    const descriptionText = [
      expense.merchant,
      expense.description ? `- ${expense.description}` : '',
      `[${expense.categoryLabel}]`,
    ].filter(Boolean).join(' ');

    rows.push({
      section: expense.date,
      lineNumber: expense.lineNumber,
      description: descriptionText,
      amount: formatCurrency(expense.deductibleAmount),
    });
  });

  rows.push({
    section: '',
    lineNumber: '',
    description: 'Total Deductible Expenses',
    amount: formatCurrency(data.expenseDetails.reduce((sum, e) => sum + e.deductibleAmount, 0)),
  });

  const csvHeader = 'Section,Line Number,Description,Amount\n';
  const csvBody = rows
    .map((row) => `"${row.section}","${row.lineNumber}","${row.description}","${row.amount}"`)
    .join('\n');

  return csvHeader + csvBody;
}

export async function downloadCSV(csvContent: string, filename: string = 't2125_export.csv') {
  if (Platform.OS === 'web') {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    const fileUri = FileSystem.documentDirectory + filename;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export T2125 Data',
        UTI: 'public.comma-separated-values-text',
      });
    }
  }
}
