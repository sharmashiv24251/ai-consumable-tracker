import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ScoreData {
  health: number;
  planet: number;
  healthDelta: number;
  planetDelta: number;
}

export interface TrendPoint {
  day: string;
  health: number;
  planet: number;
}

export interface ImpactItem {
  id: string;
  type: 'health' | 'planet';
  delta: number;
  message: string;
  timestamp: number;
}

export interface ScanResult {
  id: string;
  productName: string;
  healthScore: number;
  planetScore: number;
  goodPoints: string[];
  okayPoints: string[];
  badPoints: string[];
  timestamp: number;
  imageUri?: string;
}

export interface InsightCard {
  id: string;
  type: 'tip' | 'superfood' | 'insight';
  title: string;
  description: string;
}

interface AppState {
  scores: ScoreData;
  trends: TrendPoint[];
  impacts: ImpactItem[];
  scanHistory: ScanResult[];
  insights: InsightCard[];
}

const defaultState: AppState = {
  scores: {
    health: 78,
    planet: 85,
    healthDelta: 3,
    planetDelta: 5,
  },
  trends: [
    { day: 'Mon', health: 75, planet: 80 },
    { day: 'Tue', health: 76, planet: 82 },
    { day: 'Wed', health: 74, planet: 81 },
    { day: 'Thu', health: 77, planet: 83 },
    { day: 'Fri', health: 78, planet: 84 },
    { day: 'Sat', health: 78, planet: 85 },
    { day: 'Sun', health: 78, planet: 85 },
  ],
  impacts: [
    {
      id: '1',
      type: 'planet',
      delta: 2,
      message: 'You reused a glass jar',
      timestamp: Date.now() - 3600000,
    },
    {
      id: '2',
      type: 'health',
      delta: -1,
      message: 'Salty snack added',
      timestamp: Date.now() - 7200000,
    },
  ],
  scanHistory: [],
  insights: [
    {
      id: '1',
      type: 'tip',
      title: "Today's Green Tip",
      description: 'Choose products with minimal packaging to reduce waste',
    },
    {
      id: '2',
      type: 'superfood',
      title: 'New Superfood',
      description: 'Chia seeds are rich in omega-3 and fiber',
    },
    {
      id: '3',
      type: 'insight',
      title: 'Weekly Insight',
      description: "You've made 5 eco-friendly choices this week!",
    },
  ],
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [state, setState] = useState<AppState>(defaultState);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem('@app_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        setState({ ...defaultState, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  };

  const saveState = async (newState: AppState) => {
    try {
      await AsyncStorage.setItem('@app_state', JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  };

  const addScanResult = useCallback((result: ScanResult) => {
    setState((prevState) => {
      const newState = {
        ...prevState,
        scanHistory: [result, ...prevState.scanHistory],
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const addImpact = useCallback((impact: ImpactItem) => {
    setState((prevState) => {
      const newState = {
        ...prevState,
        impacts: [impact, ...prevState.impacts].slice(0, 10),
      };
      saveState(newState);
      return newState;
    });
  }, []);

  const updateScores = useCallback((health: number, planet: number) => {
    setState((prevState) => {
      const healthDelta = health - prevState.scores.health;
      const planetDelta = planet - prevState.scores.planet;

      const newState = {
        ...prevState,
        scores: {
          health,
          planet,
          healthDelta,
          planetDelta,
        },
      };
      saveState(newState);
      return newState;
    });
  }, []);

  return useMemo(
    () => ({
      ...state,
      addScanResult,
      addImpact,
      updateScores,
    }),
    [state, addScanResult, addImpact, updateScores]
  );
});
