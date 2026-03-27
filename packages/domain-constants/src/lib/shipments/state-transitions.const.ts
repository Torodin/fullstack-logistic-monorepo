import { State } from '@fullstack-logistic-wrk/prisma/generated';

export const STATE_TRANSITIONS: Record<State, State[]> = {
  [State.CREATED]: [State.IN_WAREHOUSE, State.CANCELED],
  [State.IN_WAREHOUSE]: [State.IN_TRANSIT, State.CANCELED],
  [State.IN_TRANSIT]: [State.IN_DELIVERY, State.RETURNED, State.CANCELED],
  [State.IN_DELIVERY]: [State.DELIVERED, State.RETURNED],
  [State.DELIVERED]: [],
  [State.RETURNED]: [State.CANCELED],
  [State.CANCELED]: [],
};
