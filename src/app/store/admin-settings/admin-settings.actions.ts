import { createAction } from '@ngrx/store';

export const setAdminMode = createAction(
  '[Admin Settings] Set Admin Mode',
  (isAdmin: boolean) => ({ isAdmin })
);

export const toggleAdminMode = createAction(
  '[Admin Settings] Toggle Admin Mode'
);

export const reloadComponentsList = createAction(
  '[Train Components] Reload Components List'
);

