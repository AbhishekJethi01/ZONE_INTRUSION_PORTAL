import { CanDeactivateFn } from '@angular/router';

export const deactiveGuard: CanDeactivateFn<unknown> = (component, currentRoute, currentState, nextState) => {
  return true;
};
