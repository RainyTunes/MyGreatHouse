import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loadCityData, calculateStats } from '../utils/dataLoader';

// Async thunk to load city data
export const fetchCityData = createAsyncThunk(
  'data/fetchCityData',
  async (cityName) => {
    const data = await loadCityData(cityName);
    return { cityName, data };
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    cityName: '广州',
    data: [],
    loading: false,
    error: null,
    selectedType: 'secondHand' // 'newHouse' or 'secondHand'
  },
  reducers: {
    setSelectedType: (state, action) => {
      state.selectedType = action.payload;
    },
    setCityName: (state, action) => {
      state.cityName = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCityData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCityData.fulfilled, (state, action) => {
        state.loading = false;
        state.cityName = action.payload.cityName;
        state.data = action.payload.data;
      })
      .addCase(fetchCityData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setSelectedType, setCityName } = dataSlice.actions;

// Selectors
export const selectCityData = (state) => state.data.data;
export const selectSelectedType = (state) => state.data.selectedType;
export const selectCityName = (state) => state.data.cityName;
export const selectLoading = (state) => state.data.loading;

export const selectChartData = (state) => {
  const { data, selectedType } = state.data;
  return data
    .filter(d => d[selectedType] && d[selectedType].yoy !== null)
    .map(d => ({
      period: d.period,
      yoy: d[selectedType].yoy,
      mom: d[selectedType].mom,
      third: d[selectedType].third
    }));
};

export const selectStats = (state) => {
  const { data, selectedType } = state.data;
  return calculateStats(data, selectedType);
};

export default dataSlice.reducer;
