import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export type Time = bigint;
export interface Payout {
    status: string;
    address: string;
    timestamp: Time;
    amount: bigint;
}
export interface MiningState {
    cumulativeRuntime: bigint;
    cumulativeEarnings: bigint;
    isActive: boolean;
    config: MiningConfig;
    lastStartTimestamp?: Time;
}
export interface MiningEvent {
    timestamp: Time;
    details?: string;
    eventType: string;
}
export interface MiningConfig {
    bitcoinPayoutAddress: string;
    targetHashrate: bigint;
    powerUsage: bigint;
    electricityCost: bigint;
    profileName: string;
}
export interface UserProfile {
    name: string;
}
export interface ProposalResponse {
    note?: string;
    accepted: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    generateInviteCode(): Promise<string>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getCallerResponse(): Promise<ProposalResponse | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getMiningConfig(): Promise<MiningConfig | null>;
    getMiningEvents(): Promise<Array<MiningEvent>>;
    getMiningState(): Promise<MiningState | null>;
    getPayoutHistory(): Promise<Array<Payout>>;
    getResponse(user: Principal): Promise<ProposalResponse | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    requestPayout(amount: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startMining(): Promise<void>;
    stopMining(): Promise<void>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    submitResponse(accepted: boolean, note: string | null): Promise<void>;
    updateMiningConfig(config: MiningConfig): Promise<void>;
}
