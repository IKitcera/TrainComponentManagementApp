import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AdminSettingsState } from './admin-settings.reducer';

export const selectAdminSettingsState = createFeatureSelector<AdminSettingsState>('adminSettings');

export const selectIsAdminMode = createSelector(
  selectAdminSettingsState,
  (state: AdminSettingsState) => state.isAdminMode
);

export const selectReloadTrigger = createSelector(
  selectAdminSettingsState,
  (state: AdminSettingsState) => state.reloadTrigger
);

