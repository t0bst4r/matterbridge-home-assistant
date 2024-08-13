export interface MatterStatusBase {
  isCommissioned: boolean;
}

export interface MatterFabric {
  id: string;
  name: string;
  activeSessions: number;
}

export interface NotCommissionedStatus extends MatterStatusBase {
  isCommissioned: false;
  commissioningCode: string;
}

export interface CommissionedStatus extends MatterStatusBase {
  isCommissioned: true;
  fabrics: MatterFabric[];
}

export type MatterStatus = NotCommissionedStatus | CommissionedStatus;
