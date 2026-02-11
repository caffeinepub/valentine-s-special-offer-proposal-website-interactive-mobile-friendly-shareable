import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Deposit {
    id: string;
    status: string;
    asset: SupportedAsset;
    txId?: string;
    timestamp: Time;
    amount: bigint;
}
export interface ExchangeState {
    trades: Array<[string, Trade]>;
    exchangeRates: Array<[string, number]>;
    withdrawals: Array<[string, Withdrawal]>;
    supportedAssets: Array<SupportedAsset>;
    deposits: Array<[string, Deposit]>;
    balances: Array<[string, Balance]>;
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
export interface Balance {
    asset: SupportedAsset;
    available: bigint;
}
export interface Trade {
    id: string;
    status: string;
    rate: number;
    type: Variant_buy_sell;
    outputAsset: SupportedAsset;
    inputAsset: SupportedAsset;
    timestamp: Time;
    inputAmount: bigint;
    outputAmount: bigint;
}
export interface InviteCode {
    created: Time;
    code: string;
    used: boolean;
}
export interface RSVP {
    name: string;
    inviteCode: string;
    timestamp: Time;
    attending: boolean;
}
export interface EarningItem {
    id: string;
    status: Variant_active_disabled;
    created: Time;
    rewardAmount: bigint;
    externalId?: string;
    name: string;
    description: string;
    conditionText: string;
    updated: Time;
}
export interface Withdrawal {
    id: string;
    status: string;
    asset: SupportedAsset;
    destinationAddress: string;
    timestamp: Time;
    amount: bigint;
}
export interface EarningClaim {
    id: string;
    status: Variant_pending_approved_rejected;
    itemId: string;
    created: Time;
    rewardAmount: bigint;
    userId: Principal;
    userMessage?: string;
    claimData: {
        intent: string;
        proof: string;
    };
    updated: Time;
    adminMessage?: string;
}
export interface SupportedAsset {
    decimals: bigint;
    name: string;
    symbol: string;
}
export interface MiningEvent {
    timestamp: Time;
    details?: string;
    eventType: string;
}
export interface VIPCatalogItem {
    id: string;
    rewardAmount: bigint;
    description: string;
    dailyLimit: bigint;
    taskType: TaskType;
}
export interface MiningConfig {
    bitcoinPayoutAddress: string;
    targetHashrate: bigint;
    powerUsage: bigint;
    electricityCost: bigint;
    profileName: string;
}
export interface DepositAddresses {
    erc20Address: string;
    trc20Address: string;
}
export interface VIPStatus {
    requestedUpgrade?: {
        status: Variant_pending_approved_rejected;
        tierTo: Variant_bronze_gold_diamond_basic_silver;
        adminMessage?: string;
        requestedAt: Time;
    };
    tier: Variant_bronze_gold_diamond_basic_silver;
}
export interface UserProfile {
    name: string;
}
export interface ProposalResponse {
    note?: string;
    accepted: boolean;
}
export enum TaskType {
    ad = "ad",
    task = "task"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_active_disabled {
    active = "active",
    disabled = "disabled"
}
export enum Variant_bronze_gold_diamond_basic_silver {
    bronze = "bronze",
    gold = "gold",
    diamond = "diamond",
    basic = "basic",
    silver = "silver"
}
export enum Variant_buy_sell {
    buy = "buy",
    sell = "sell"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export interface backendInterface {
    approveEarningClaim(claimId: string, adminMessage: string | null): Promise<void>;
    approveVIPUpgrade(user: Principal, adminMessage: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimOwnership(): Promise<void>;
    completePayout(user: Principal, _payoutIndex: bigint): Promise<void>;
    createEarningItem(name: string, description: string, rewardAmount: bigint, conditionText: string, externalId: string | null): Promise<EarningItem>;
    generateInviteCode(): Promise<string>;
    getAllEarningItems(): Promise<Array<[string, EarningItem]>>;
    getAllPendingDeposits(): Promise<Array<[Principal, Deposit]>>;
    getAllPendingEarningClaims(): Promise<Array<EarningClaim>>;
    getAllPendingVIPUpgrades(): Promise<Array<[Principal, VIPStatus]>>;
    getAllPendingWithdrawals(): Promise<Array<[Principal, Withdrawal]>>;
    getAllRSVPs(): Promise<Array<RSVP>>;
    getAvailableEarnItems(): Promise<Array<VIPCatalogItem>>;
    getCallerEarningClaims(): Promise<Array<EarningClaim>>;
    getCallerResponse(): Promise<ProposalResponse | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCallerVIPStatus(): Promise<VIPStatus>;
    getEarningItem(id: string): Promise<EarningItem | null>;
    getExchangeStateShared(): Promise<ExchangeState>;
    getInviteCodes(): Promise<Array<InviteCode>>;
    getMiningConfig(): Promise<MiningConfig | null>;
    getMiningEvents(): Promise<Array<MiningEvent>>;
    getMiningState(): Promise<MiningState | null>;
    getOwner(): Promise<Principal | null>;
    getPayoutHistory(): Promise<Array<Payout>>;
    getResponse(user: Principal): Promise<ProposalResponse | null>;
    getSupportedAssets(): Promise<Array<SupportedAsset>>;
    getTotalRewardedAmount(): Promise<bigint>;
    getUsdtDepositAddresses(): Promise<DepositAddresses>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getcallerEarningClaimsCount(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    markDepositCompleted(user: Principal, depositId: string, txId: string): Promise<void>;
    markWithdrawalCompleted(user: Principal, withdrawalId: string): Promise<void>;
    rejectEarningClaim(claimId: string, adminMessage: string | null): Promise<void>;
    rejectVIPUpgrade(user: Principal, adminMessage: string | null): Promise<void>;
    requestDeposit(assetSymbol: string, amount: bigint, txId: string | null): Promise<Deposit>;
    requestPayout(amount: bigint): Promise<void>;
    requestVIPUpgrade(tierTo: Variant_bronze_gold_diamond_basic_silver): Promise<void>;
    requestWithdrawal(assetSymbol: string, amount: bigint, destinationAddress: string): Promise<Withdrawal>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setUsdtDepositAddresses(addresses: DepositAddresses): Promise<void>;
    startMining(): Promise<void>;
    stopMining(): Promise<void>;
    submitEarningClaim(itemId: string, intent: string, proof: string, userMessage: string | null): Promise<EarningClaim>;
    submitRSVP(name: string, attending: boolean, inviteCode: string): Promise<void>;
    submitResponse(accepted: boolean, note: string | null): Promise<void>;
    trade(tradeType: Variant_buy_sell, inputAssetSymbol: string, outputAssetSymbol: string, amount: bigint): Promise<Trade>;
    updateEarningItem(itemId: string, name: string, description: string, rewardAmount: bigint, conditionText: string, status: Variant_active_disabled): Promise<EarningItem>;
    updateMiningConfig(config: MiningConfig): Promise<void>;
}
