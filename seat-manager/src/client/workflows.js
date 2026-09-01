import { COMMAND_TYPES } from '../shared/contracts.js';

export function createStaffCommands({uid=()=> crypto.randomUUID()}={}) {
  const key=()=>uid();
  return {
    createWalkin(values) {
      return {type:COMMAND_TYPES.CREATE_WALKIN,idempotencyKey:key(),...values};
    },
    notifyWalkin(walkin) {
      return {type:COMMAND_TYPES.NOTIFY_WALKIN,idempotencyKey:key(),id:walkin.id,expectedVersion:walkin.version};
    },
    cancelWalkin(walkin) {
      return {type:COMMAND_TYPES.CANCEL_WALKIN,idempotencyKey:key(),id:walkin.id,expectedVersion:walkin.version};
    },
    createReservation(values) {
      return {type:COMMAND_TYPES.CREATE_RESERVATION,idempotencyKey:key(),...values};
    },
    editReservation(reservation,values) {
      return {
        type:COMMAND_TYPES.EDIT_RESERVATION,idempotencyKey:key(),
        id:reservation.id,expectedVersion:reservation.version,...values
      };
    },
    reservationStatus(reservation,status) {
      return {
        type:COMMAND_TYPES.SET_RESERVATION_STATUS,idempotencyKey:key(),
        id:reservation.id,expectedVersion:reservation.version,status
      };
    },
    confirmTablePlan(party,partyKind) {
      return {
        type:COMMAND_TYPES.CONFIRM_TABLE_PLAN,idempotencyKey:key(),partyId:party.id,
        partyKind,expectedVersion:party.version
      };
    },
    seatParty(party,partyKind,tableIds,protectFutureReservations=false) {
      const command={
        type:COMMAND_TYPES.SEAT_PARTY,idempotencyKey:key(),partyId:party.id,
        partyKind,expectedVersion:party.version,tableIds:[...tableIds]
      };
      if(protectFutureReservations)command.protectFutureReservations=true;
      return command;
    },
    clearTable(occupancy) {
      return {
        type:COMMAND_TYPES.CLEAR_TABLE,idempotencyKey:key(),
        tableId:occupancy.tableId,expectedVersion:occupancy.version
      };
    }
  };
}

export function createWorkflowController({
  repository,getConnectionState,onSnapshot,onSuccess,onError
}) {
  let pendingCommand=null;
  const run=async command=>{
    if(getConnectionState()!=='online'){
      onError({message:'目前离线，重新连接后再试',retry:false,code:'OFFLINE',status:0});
      return false;
    }
    pendingCommand=command;
    try{
      const output=await repository.command(command);
      onSnapshot(output.snapshot);
      pendingCommand=null;
      onSuccess(output.result);
      return true;
    }catch(error){
      if(error.snapshot)onSnapshot(error.snapshot);
      const conflict=error.status===409;
      if(conflict)pendingCommand=null;
      onError({
        message:error.message||'服务器暂时无法完成这个操作',
        retry:!conflict,
        code:error.code||'REQUEST_FAILED',
        status:error.status||0
      });
      return false;
    }
  };
  return {
    submit:run,
    retry:()=>pendingCommand?run(pendingCommand):Promise.resolve(false),
    clearPending:()=>{pendingCommand=null}
  };
}
