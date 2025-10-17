import { supabase } from './supabase';

export const generateDemoData = async (userId: string) => {
  console.log('generateDemoData called with userId:', userId);
  const today = new Date();
  const expenses = [];
  const income = [];

  for (let i = 0; i < 90; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    if (i % 3 === 0) {
      expenses.push({
        user_id: userId,
        date: dateStr,
        merchant_name: 'Shell Gas Station',
        amount: Math.random() * 30 + 40,
        category: 'fuel',
        business_percentage: 100,
        is_business: true,
        is_recurring: false,
        imported_from: 'demo',
      });
    }

    if (i % 4 === 0) {
      expenses.push({
        user_id: userId,
        date: dateStr,
        merchant_name: 'Esso',
        amount: Math.random() * 25 + 35,
        category: 'fuel',
        business_percentage: 100,
        is_business: true,
        is_recurring: false,
        imported_from: 'demo',
      });
    }

    if (i % 7 === 0) {
      expenses.push({
        user_id: userId,
        date: dateStr,
        merchant_name: 'Quick Lube Oil Change',
        amount: Math.random() * 20 + 50,
        category: 'maintenance',
        business_percentage: 100,
        is_business: true,
        is_recurring: false,
        imported_from: 'demo',
      });
    }

    if (i % 10 === 0) {
      const restaurants = ['Tim Hortons', "McDonald's", 'Subway', 'Starbucks', 'Pizza Pizza'];
      expenses.push({
        user_id: userId,
        date: dateStr,
        merchant_name: restaurants[Math.floor(Math.random() * restaurants.length)],
        amount: Math.random() * 10 + 8,
        category: 'meals',
        business_percentage: 50,
        is_business: true,
        is_recurring: false,
        imported_from: 'demo',
      });
    }

    if (i % 15 === 0) {
      expenses.push({
        user_id: userId,
        date: dateStr,
        merchant_name: 'Rogers Wireless',
        amount: 75,
        category: 'phone',
        business_percentage: 100,
        is_business: true,
        is_recurring: true,
        imported_from: 'demo',
      });
    }

    if (i % 8 === 0) {
      expenses.push({
        user_id: userId,
        date: dateStr,
        merchant_name: 'Touchless Car Wash',
        amount: Math.random() * 5 + 12,
        category: 'carwash',
        business_percentage: 100,
        is_business: true,
        is_recurring: false,
        imported_from: 'demo',
      });
    }

    if (i % 20 === 0) {
      expenses.push({
        user_id: userId,
        date: dateStr,
        merchant_name: 'Canadian Tire',
        amount: Math.random() * 100 + 50,
        category: 'maintenance',
        business_percentage: 100,
        is_business: true,
        is_recurring: false,
        imported_from: 'demo',
      });
    }

    if (i % 30 === 0) {
      expenses.push({
        user_id: userId,
        date: dateStr,
        merchant_name: 'Green P Parking',
        amount: Math.random() * 10 + 15,
        category: 'parking',
        business_percentage: 100,
        is_business: true,
        is_recurring: false,
        imported_from: 'demo',
      });
    }

    if (i % 2 === 0) {
      income.push({
        user_id: userId,
        date: dateStr,
        source: 'Uber',
        amount: Math.random() * 100 + 150,
        trips_completed: Math.floor(Math.random() * 10 + 8),
        imported_from: 'demo',
      });
    }

    if (i % 3 === 0) {
      income.push({
        user_id: userId,
        date: dateStr,
        source: 'DoorDash',
        amount: Math.random() * 80 + 80,
        trips_completed: Math.floor(Math.random() * 8 + 5),
        imported_from: 'demo',
      });
    }
  }

  console.log(`Generated ${expenses.length} expenses and ${income.length} income records`);

  const { error: expenseError } = await supabase.from('expenses').insert(expenses);
  if (expenseError) {
    console.error('Error inserting expenses:', expenseError);
    throw new Error('Failed to insert expenses: ' + expenseError.message);
  }

  const { error: incomeError } = await supabase.from('income_records').insert(income);
  if (incomeError) {
    console.error('Error inserting income:', incomeError);
    throw new Error('Failed to insert income: ' + incomeError.message);
  }

  return {
    expensesCount: expenses.length,
    incomeCount: income.length,
  };
};

export const clearDemoData = async (userId: string) => {
  await supabase.from('expenses').delete().eq('user_id', userId).eq('imported_from', 'demo');
  await supabase.from('income_records').delete().eq('user_id', userId).eq('imported_from', 'demo');
};
