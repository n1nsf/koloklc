import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Mission = Database['public']['Tables']['missions']['Row'];
type CheckIn = Database['public']['Tables']['check_ins']['Row'];

export function useCheckIn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMissions = async (locationId: string) => {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('location_id', locationId)
        .eq('active', true);

      if (error) throw error;
      return data as Mission[];
    } catch (err) {
      setError('Failed to load missions');
      console.error('Error:', err);
      return [];
    }
  };

  const getCheckIns = async () => {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select(`
          *,
          missions (
            title,
            description,
            points
          ),
          locations (
            name,
            city,
            country
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (CheckIn & {
        missions: Pick<Mission, 'title' | 'description' | 'points'>;
        locations: Pick<Database['public']['Tables']['locations']['Row'], 'name' | 'city' | 'country'>;
      })[];
    } catch (err) {
      setError('Failed to load check-ins');
      console.error('Error:', err);
      return [];
    }
  };

  const checkIn = async (locationId: string, missionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .rpc('handle_check_in', {
          p_location_id: locationId,
          p_mission_id: missionId,
        });

      if (error) throw error;
      return data as CheckIn;
    } catch (err) {
      setError('Failed to check in');
      console.error('Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getMissions,
    getCheckIns,
    checkIn,
  };
} 