import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Switch, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '@/lib/supabase';
import { Car, Plus, Calendar } from 'lucide-react-native';
import { showToast } from '@/lib/toast';

interface MileageLog {
  id: string;
  user_id: string;
  date: string;
  start_odometer: number;
  end_odometer: number;
  distance_km: number;
  business_km: number;
  purpose: string | null;
  is_business: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_USER_ID = 'default-user';

export default function MileageScreen() {
  const currentYear = new Date().getFullYear();

  const [logs, setLogs] = useState<MileageLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [yearStartOdo, setYearStartOdo] = useState('');
  const [yearEndOdo, setYearEndOdo] = useState('');
  const [yearSettingsId, setYearSettingsId] = useState<string | null>(null);

  const [tripDate, setTripDate] = useState(new Date().toISOString().split('T')[0]);
  const [startOdo, setStartOdo] = useState('');
  const [endOdo, setEndOdo] = useState('');
  const [distance, setDistance] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isBusiness, setIsBusiness] = useState(true);
  const [useOdometer, setUseOdometer] = useState(false);

  const loadData = useCallback(async () => {
    const [logsRes, settingsRes] = await Promise.all([
      supabase
        .from('mileage_logs')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .gte('date', `${currentYear}-01-01`)
        .lte('date', `${currentYear}-12-31`)
        .order('date', { ascending: false }),
      supabase
        .from('mileage_settings')
        .select('*')
        .eq('user_id', DEFAULT_USER_ID)
        .eq('year', currentYear)
        .maybeSingle(),
    ]);

    if (logsRes.error) {
      console.error('Error loading mileage logs:', logsRes.error);
    } else {
      setLogs(logsRes.data || []);
    }

    if (settingsRes.data) {
      setYearStartOdo(settingsRes.data.jan1_odometer_km.toString());
      setYearEndOdo(settingsRes.data.current_odometer_km.toString());
      setYearSettingsId(settingsRes.data.id);
    }

    setLoading(false);
  }, [currentYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const businessKmYTD = logs
    .filter((log) => log.is_business)
    .reduce((sum, log) => sum + log.distance_km, 0);

  const totalKmYTD = yearStartOdo && yearEndOdo
    ? parseFloat(yearEndOdo) - parseFloat(yearStartOdo)
    : 0;

  const businessUsePercent = totalKmYTD > 0
    ? Math.min(100, Math.max(0, (businessKmYTD / totalKmYTD) * 100))
    : 0;

  const saveYearOdometer = async (startKm: string, endKm: string) => {
    const startNum = parseFloat(startKm) || 0;
    const endNum = parseFloat(endKm) || 0;

    const dataToSave = {
      user_id: DEFAULT_USER_ID,
      year: currentYear,
      jan1_odometer_km: startNum,
      current_odometer_km: endNum,
      manual_total_km_ytd: null,
      updated_at: new Date().toISOString(),
    };

    if (yearSettingsId) {
      await supabase
        .from('mileage_settings')
        .update(dataToSave)
        .eq('id', yearSettingsId);
    } else {
      const { data } = await supabase
        .from('mileage_settings')
        .insert([dataToSave])
        .select()
        .single();

      if (data) {
        setYearSettingsId(data.id);
      }
    }
  };

  const handleAddTrip = async () => {

    let distanceNum: number;
    let startOdoNum = 0;
    let endOdoNum = 0;

    if (useOdometer) {
      startOdoNum = parseFloat(startOdo);
      endOdoNum = parseFloat(endOdo);

      if (isNaN(startOdoNum) || isNaN(endOdoNum)) {
        Alert.alert('Validation Error', 'Please enter valid odometer readings');
        return;
      }

      if (endOdoNum < startOdoNum) {
        Alert.alert('Validation Error', 'End odometer must be greater than or equal to start odometer');
        return;
      }

      if (startOdoNum < 0 || endOdoNum < 0) {
        Alert.alert('Validation Error', 'Odometer readings cannot be negative');
        return;
      }

      distanceNum = endOdoNum - startOdoNum;
    } else {
      distanceNum = parseFloat(distance);

      if (isNaN(distanceNum) || distanceNum <= 0) {
        Alert.alert('Validation Error', 'Please enter a valid distance');
        return;
      }
    }

    const { error } = await supabase
      .from('mileage_logs')
      .insert([{
        user_id: DEFAULT_USER_ID,
        date: tripDate,
        start_odometer: startOdoNum,
        end_odometer: endOdoNum,
        distance_km: distanceNum,
        business_km: isBusiness ? distanceNum : 0,
        purpose: purpose || null,
        is_business: isBusiness,
      }]);

    if (error) {
      Alert.alert('Error', 'Failed to add trip');
      console.error(error);
      return;
    }

    setStartOdo('');
    setEndOdo('');
    setDistance('');
    setPurpose('');
    setIsBusiness(true);
    showToast('Trip added');
    loadData();
  };

  const handleDeleteTrip = async (id: string) => {
    const { error} = await supabase
      .from('mileage_logs')
      .delete()
      .eq('id', id);

    if (error) {
      Alert.alert('Error', 'Failed to delete trip');
      console.error(error);
    } else {
      showToast('Trip deleted');
      loadData();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex1}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerLabel}>MILEAGE TRACKING</Text>
            <Text style={styles.headerTitle}>Business vs Personal KM</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Car size={20} color="#111827" />
            <Text style={styles.sectionTitle}>{currentYear} Summary</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Business KM</Text>
                <Text style={styles.summaryValue}>{businessKmYTD.toFixed(0)}</Text>
                <Text style={styles.summarySource}>from logged trips</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total KM</Text>
                <Text style={styles.summaryValue}>{totalKmYTD.toFixed(0)}</Text>
                <Text style={styles.summarySource}>from odometer</Text>
              </View>
            </View>

            <View style={styles.businessUseCard}>
              <Text style={styles.businessUseLabel}>Business Use %</Text>
              <Text style={styles.businessUseValue}>{businessUsePercent.toFixed(1)}%</Text>
              <Text style={styles.businessUseSubtext}>
                Business KM ÷ Total KM × 100
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Year Odometer</Text>
          </View>

          <View style={styles.card}>
            {!yearStartOdo && !yearEndOdo && (
              <View style={styles.helperBanner}>
                <Text style={styles.helperText}>
                  💡 Enter your odometer readings to calculate Total KM and Business Use %
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start (Jan 1)</Text>
              <TextInput
                style={styles.input}
                value={yearStartOdo}
                onChangeText={(text) => {
                  setYearStartOdo(text);
                  saveYearOdometer(text, yearEndOdo);
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                editable={true}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Current KM</Text>
              <TextInput
                style={styles.input}
                value={yearEndOdo}
                onChangeText={(text) => {
                  setYearEndOdo(text);
                  saveYearOdometer(yearStartOdo, text);
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                editable={true}
              />
            </View>

            <View style={styles.yearCalcCard}>
              <View style={styles.yearCalcRow}>
                <Text style={styles.yearCalcLabel}>Total KM (YTD):</Text>
                <Text style={styles.yearCalcValue}>{totalKmYTD.toFixed(0)}</Text>
              </View>
              <View style={styles.yearCalcRow}>
                <Text style={styles.yearCalcLabel}>Business KM (YTD):</Text>
                <Text style={styles.yearCalcValue}>{businessKmYTD.toFixed(0)}</Text>
              </View>
              <View style={[styles.yearCalcRow, styles.yearCalcHighlight]}>
                <Text style={styles.yearCalcLabelBold}>Business Use %:</Text>
                <Text style={styles.yearCalcValueBold}>{businessUsePercent.toFixed(1)}%</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Plus size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Add Trip</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={tripDate}
                onChangeText={setTripDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.businessToggle}>
              <Text style={styles.inputLabel}>Use Odometer Readings?</Text>
              <Switch
                value={useOdometer}
                onValueChange={(value) => {
                  setUseOdometer(value);
                  if (value) {
                    setDistance('');
                  } else {
                    setStartOdo('');
                    setEndOdo('');
                  }
                }}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {useOdometer ? (
              <>
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Start Odometer</Text>
                    <TextInput
                      style={styles.input}
                      value={startOdo}
                      onChangeText={setStartOdo}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>End Odometer</Text>
                    <TextInput
                      style={styles.input}
                      value={endOdo}
                      onChangeText={setEndOdo}
                      keyboardType="decimal-pad"
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>
                {startOdo && endOdo && (
                  <View style={styles.distancePreview}>
                    <Text style={styles.distancePreviewText}>
                      Distance: {(parseFloat(endOdo) - parseFloat(startOdo)).toFixed(1)} km
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Distance (km)</Text>
                <TextInput
                  style={styles.input}
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Purpose (optional)</Text>
              <TextInput
                style={styles.input}
                value={purpose}
                onChangeText={setPurpose}
                placeholder="e.g., Client meeting, Delivery"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.businessToggle}>
              <Text style={styles.inputLabel}>Business Trip?</Text>
              <Switch
                value={isBusiness}
                onValueChange={setIsBusiness}
                trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.addButton,
                (useOdometer ? (!startOdo || !endOdo) : !distance) && styles.addButtonDisabled
              ]}
              onPress={handleAddTrip}
              disabled={useOdometer ? (!startOdo || !endOdo) : !distance}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Trip</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Trip History</Text>
          </View>

          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Car size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No trips recorded yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first trip above to start tracking</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {logs.map((log) => (
                <View key={log.id} style={styles.tripItem}>
                  <View style={styles.tripHeader}>
                    <Text style={styles.tripDate}>{log.date}</Text>
                    {log.is_business && (
                      <View style={styles.businessBadge}>
                        <Text style={styles.businessBadgeText}>Business</Text>
                      </View>
                    )}
                  </View>
                  {log.purpose && <Text style={styles.tripPurpose}>{log.purpose}</Text>}
                  <View style={styles.tripFooter}>
                    <View>
                      <Text style={styles.tripDistance}>
                        {log.distance_km.toFixed(1)} km
                        {log.start_odometer > 0 && log.end_odometer > 0 && (
                          <Text style={styles.tripOdometer}>
                            {' '}({log.start_odometer.toFixed(0)} → {log.end_odometer.toFixed(0)})
                          </Text>
                        )}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteTrip(log.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6B7280',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: 'Montserrat-Regular',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontFamily: 'Montserrat-Bold',
    color: '#111827',
  },
  summarySource: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
  },
  businessUseCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  businessUseLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#1E40AF',
    marginBottom: 8,
  },
  businessUseValue: {
    fontSize: 36,
    fontFamily: 'Montserrat-Bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  businessUseSubtext: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    textAlign: 'center',
  },
  helperBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  helperText: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#1E40AF',
    lineHeight: 18,
  },
  yearCalcCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  yearCalcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  yearCalcHighlight: {
    backgroundColor: '#DBEAFE',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginTop: 8,
    paddingTop: 12,
    borderRadius: 8,
  },
  yearCalcLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: '#6B7280',
  },
  yearCalcValue: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  yearCalcLabelBold: {
    fontSize: 15,
    fontFamily: 'Montserrat-Bold',
    color: '#1E40AF',
  },
  yearCalcValueBold: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: '#1E40AF',
  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  distancePreview: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  distancePreviewText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#15803D',
    textAlign: 'center',
  },
  businessToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  addButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Montserrat-SemiBold',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: '#9CA3AF',
    marginTop: 4,
  },
  tripItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: '#111827',
  },
  businessBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  businessBadgeText: {
    fontSize: 10,
    fontFamily: 'Montserrat-SemiBold',
    color: '#065F46',
  },
  tripPurpose: {
    fontSize: 13,
    fontFamily: 'Montserrat-Regular',
    color: '#6B7280',
    marginBottom: 4,
  },
  tripDistance: {
    fontSize: 12,
    fontFamily: 'Montserrat-Medium',
    color: '#9CA3AF',
  },
  tripOdometer: {
    fontSize: 11,
    fontFamily: 'Montserrat-Regular',
    color: '#D1D5DB',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    fontSize: 12,
    fontFamily: 'Montserrat-SemiBold',
    color: '#EF4444',
  },
  flex1: {
    flex: 1,
  },
});
