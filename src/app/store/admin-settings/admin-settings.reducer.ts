import { createReducer, on } from '@ngrx/store';
import { setAdminMode, toggleAdminMode, reloadComponentsList } from './admin-settings.actions';

export interface AdminSettingsState {
  isAdminMode: boolean;
  reloadTrigger: number;
}

export const initialState: AdminSettingsState = {
  isAdminMode: false,
  reloadTrigger: 0,
};

export const adminSettingsReducer = createReducer(
  initialState,
  on(setAdminMode, (state, { isAdmin }) => ({
    ...state,
    isAdminMode: isAdmin,
  })),
  on(toggleAdminMode, (state) => ({
    ...state,
    isAdminMode: !state.isAdminMode,
  })),
  on(reloadComponentsList, (state) => ({
    ...state,
    reloadTrigger: state.reloadTrigger + 1,
  }))
);
