export const COMMAND_TYPES = Object.freeze({
  CREATE_WALKIN: 'walkin.create',
  NOTIFY_WALKIN: 'walkin.notify',
  CANCEL_WALKIN: 'walkin.cancel',
  CREATE_RESERVATION: 'reservation.create',
  EDIT_RESERVATION: 'reservation.edit',
  SET_RESERVATION_STATUS: 'reservation.status',
  CONFIRM_TABLE_PLAN: 'party.confirmTablePlan',
  SEAT_PARTY: 'party.seat',
  CLEAR_TABLE: 'table.clear'
});

export class DomainCommandError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.name = 'DomainCommandError';
    this.code = code;
    this.status = status;
  }
}

export class RepositoryError extends Error {
  constructor(status, code, message, details = {}) {
    super(message);
    this.name = 'RepositoryError';
    this.status = status;
    this.code = code;
    Object.assign(this, details);
  }
}

export const emptySnapshot = () => ({
  walkins: [], reservations: [], occupancies: [], revision: 0
});
