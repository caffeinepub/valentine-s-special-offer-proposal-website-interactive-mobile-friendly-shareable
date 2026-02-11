import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Random "mo:core/Random";
import Migration "migration";

(with migration = Migration.run)
actor {
  // --- Ownership Management ---
  var owner : ?Principal = null;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getOwner() : async ?Principal {
    owner;
  };

  public shared ({ caller }) func claimOwnership() : async () {
    switch (owner) {
      case (null) { owner := ?caller };
      case (?existing) {
        if (existing != caller) {
          Runtime.trap("This canister is already owned by another principal");
        };
      };
    };
  };

  // --- User Profile Management ---
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // --- Earning System ---
  public type EarningItem = {
    id : Text;
    externalId : ?Text;
    name : Text;
    description : Text;
    rewardAmount : Nat;
    conditionText : Text;
    status : {
      #active;
      #disabled;
    };
    created : Time.Time;
    updated : Time.Time;
  };

  public type EarningClaim = {
    id : Text;
    itemId : Text;
    userId : Principal;
    status : {
      #pending;
      #approved;
      #rejected;
    };
    claimData : {
      intent : Text;
      proof : Text;
    };
    rewardAmount : Nat;
    userMessage : ?Text;
    adminMessage : ?Text;
    created : Time.Time;
    updated : Time.Time;
  };

  public type Transaction = {
    id : Text;
    userId : Principal;
    assetSymbol : Text;
    amount : Nat;
    transactionType : {
      #deposit;
      #withdrawal;
      #reward;
    };
    relatedEntityId : Text;
    status : {
      #pending;
      #approved;
      #rejected;
    };
    remarks : ?Text;
    created : Time.Time;
    updated : Time.Time;
  };

  public type VIPStatus = {
    tier : {
      #basic;
      #bronze;
      #silver;
      #gold;
      #diamond;
    };
    requestedUpgrade : ?{
      tierTo : {
        #basic;
        #bronze;
        #silver;
        #gold;
        #diamond;
      };
      requestedAt : Time.Time;
      status : {
        #pending;
        #approved;
        #rejected;
      };
      adminMessage : ?Text;
    };
  };

  public type ClaimSummary = {
    totalCount : Nat;
    pendingCount : Nat;
    approvedCount : Nat;
    rejectedCount : Nat;
    totalRewardAmount : Nat;
    pendingRewardAmount : Nat;
    approvedRewardAmount : Nat;
  };

  let earningItems = Map.empty<Text, EarningItem>();
  let earningClaims = Map.empty<Text, EarningClaim>();
  let userTransactions = Map.empty<Principal, List.List<Transaction>>();
  let userVIPStatus = Map.empty<Principal, VIPStatus>();
  let userBalanceMap = Map.empty<Principal, Nat>();

  // ----- New VIP-Tier Based Catalog -----
  public type TaskType = {
    #ad;
    #task;
  };

  public type VIPTier = {
    #basic;
    #bronze;
    #silver;
    #gold;
    #diamond;
  };

  public type VIPCatalogItem = {
    id : Text;
    taskType : TaskType;
    rewardAmount : Nat;
    dailyLimit : Nat;
    description : Text;
  };

  public type DailyProgress = {
    adsWatched : Nat;
    tasksCompleted : Nat;
    lastResetTimestamp : Time.Time;
  };

  let userProgress = Map.empty<Principal, DailyProgress>();

  let vipDailyLimits = Map.fromIter<Text, Nat>([
    ("basic", 5),
    ("bronze", 10),
    ("silver", 15),
    ("gold", 20),
    ("diamond", 25),
  ].values());

  let rewardAmounts = Map.fromIter<Text, Nat>([
    ("basic", 10),
    ("bronze", 20),
    ("silver", 30),
    ("gold", 40),
    ("diamond", 50),
  ].values());

  func getVIPItemsForTier(vipTier : Text) : [VIPCatalogItem] {
    let dailyLimit = switch (vipDailyLimits.get(vipTier)) {
      case (null) { 5 };
      case (?limit) { limit };
    };
    let rewardAmount = switch (rewardAmounts.get(vipTier)) {
      case (null) { 10 };
      case (?amount) { amount };
    };

    [
      {
        id = "ad-" # vipTier;
        taskType = #ad;
        rewardAmount;
        dailyLimit;
        description = "Watch short ads for rewards. VIP tier: " # vipTier;
      },
      {
        id = "task-" # vipTier;
        taskType = #task;
        rewardAmount;
        dailyLimit;
        description = "Complete micro-tasks for rewards. VIP tier: " # vipTier;
      },
    ];
  };

  public query ({ caller }) func getAvailableEarnItems() : async [VIPCatalogItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view earning items");
    };

    let tempStatus = switch (userVIPStatus.get(caller)) {
      case (null) { #basic };
      case (?vip) { vip.tier };
    };

    let vipTierText = switch (tempStatus) {
      case (#basic) { "basic" };
      case (#bronze) { "bronze" };
      case (#silver) { "silver" };
      case (#gold) { "gold" };
      case (#diamond) { "diamond" };
    };

    let inMemoryItems = getVIPItemsForTier(vipTierText);
    let persistentItems = earningItems.values().toArray();
    let outputList = List.empty<VIPCatalogItem>();
    outputList.addAll(inMemoryItems.values());
    for (item in persistentItems.values()) {
      if (item.status == #active) {
        outputList.add({
          id = item.id;
          taskType = #task;
          rewardAmount = item.rewardAmount;
          dailyLimit = 9999;
          description = item.description;
        });
      };
    };

    outputList.toArray();
  };

  public query ({ caller }) func getAllEarningItems() : async [(Text, EarningItem)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view earning items");
    };
    earningItems.entries()
      .filter(
        func((_, item)) {
          switch (item.status) {
            case (#active) { true };
            case (#disabled) { false };
          };
        }
      )
      .toArray();
  };

  public query ({ caller }) func getEarningItem(id : Text) : async ?EarningItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view earning items");
    };
    earningItems.get(id);
  };

  public query ({ caller }) func getCallerEarningClaims() : async [EarningClaim] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their claims");
    };
    earningClaims.values()
      .filter(func(claim) { claim.userId == caller })
      .toArray();
  };

  public shared ({ caller }) func submitEarningClaim(
    itemId : Text,
    intent : Text,
    proof : Text,
    userMessage : ?Text,
  ) : async EarningClaim {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit claims");
    };

    let item = switch (earningItems.get(itemId)) {
      case (null) { Runtime.trap("Earning item not found") };
      case (?i) { i };
    };

    switch (item.status) {
      case (#disabled) { Runtime.trap("This earning item is disabled") };
      case (#active) {};
    };

    let claimId = Time.now().toText() # "-" # caller.toText();
    let claim : EarningClaim = {
      id = claimId;
      itemId;
      userId = caller;
      status = #pending;
      claimData = { intent; proof };
      rewardAmount = item.rewardAmount;
      userMessage;
      adminMessage = null;
      created = Time.now();
      updated = Time.now();
    };

    earningClaims.add(claimId, claim);
    claim;
  };

  public shared ({ caller }) func createEarningItem(
    name : Text,
    description : Text,
    rewardAmount : Nat,
    conditionText : Text,
    externalId : ?Text,
  ) : async EarningItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create earning items");
    };

    let itemId = Time.now().toText();
    let item : EarningItem = {
      id = itemId;
      externalId;
      name;
      description;
      rewardAmount;
      conditionText;
      status = #active;
      created = Time.now();
      updated = Time.now();
    };

    earningItems.add(itemId, item);
    item;
  };

  public shared ({ caller }) func updateEarningItem(
    itemId : Text,
    name : Text,
    description : Text,
    rewardAmount : Nat,
    conditionText : Text,
    status : { #active; #disabled },
  ) : async EarningItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update earning items");
    };

    let existingItem = switch (earningItems.get(itemId)) {
      case (null) { Runtime.trap("Earning item not found") };
      case (?i) { i };
    };

    let updatedItem : EarningItem = {
      existingItem with
      name;
      description;
      rewardAmount;
      conditionText;
      status;
      updated = Time.now();
    };

    earningItems.add(itemId, updatedItem);
    updatedItem;
  };

  public query ({ caller }) func getAllPendingEarningClaims() : async [EarningClaim] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all pending claims");
    };

    earningClaims.values()
      .filter(
        func(claim) {
          switch (claim.status) {
            case (#pending) { true };
            case (_) { false };
          };
        }
      )
      .toArray();
  };

  public shared ({ caller }) func approveEarningClaim(
    claimId : Text,
    adminMessage : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve claims");
    };

    let claim = switch (earningClaims.get(claimId)) {
      case (null) { Runtime.trap("Claim not found") };
      case (?c) { c };
    };

    switch (claim.status) {
      case (#pending) {};
      case (_) { Runtime.trap("Claim is not pending") };
    };

    let approvedClaim : EarningClaim = {
      claim with
      status = #approved;
      adminMessage;
      updated = Time.now();
    };

    earningClaims.add(claimId, approvedClaim);

    let currentBalance = switch (userBalanceMap.get(claim.userId)) {
      case (null) { 0 };
      case (?bal) { bal };
    };
    userBalanceMap.add(claim.userId, currentBalance + claim.rewardAmount);
  };

  public shared ({ caller }) func rejectEarningClaim(
    claimId : Text,
    adminMessage : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject claims");
    };

    let claim = switch (earningClaims.get(claimId)) {
      case (null) { Runtime.trap("Claim not found") };
      case (?c) { c };
    };

    switch (claim.status) {
      case (#pending) {};
      case (_) { Runtime.trap("Claim is not pending") };
    };

    let rejectedClaim : EarningClaim = {
      claim with
      status = #rejected;
      adminMessage;
      updated = Time.now();
    };

    earningClaims.add(claimId, rejectedClaim);
  };

  // --- VIP System ---
  public query ({ caller }) func getCallerVIPStatus() : async VIPStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view VIP status");
    };
    switch (userVIPStatus.get(caller)) {
      case (null) {
        {
          tier = #basic;
          requestedUpgrade = null;
        };
      };
      case (?status) { status };
    };
  };

  public shared ({ caller }) func requestVIPUpgrade(
    tierTo : { #basic; #bronze; #silver; #gold; #diamond }
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request VIP upgrades");
    };

    let currentStatus = switch (userVIPStatus.get(caller)) {
      case (null) {
        {
          tier = #basic;
          requestedUpgrade = null;
        };
      };
      case (?status) { status };
    };

    switch (currentStatus.requestedUpgrade) {
      case (?req) {
        switch (req.status) {
          case (#pending) { Runtime.trap("You already have a pending upgrade request") };
          case (_) {};
        };
      };
      case (null) {};
    };

    let newStatus : VIPStatus = {
      currentStatus with
      requestedUpgrade = ?{
        tierTo;
        requestedAt = Time.now();
        status = #pending;
        adminMessage = null;
      };
    };

    userVIPStatus.add(caller, newStatus);
  };

  public query ({ caller }) func getAllPendingVIPUpgrades() : async [(Principal, VIPStatus)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all pending VIP upgrades");
    };

    userVIPStatus.entries()
      .filter(
        func((_, status)) {
          switch (status.requestedUpgrade) {
            case (?req) {
              switch (req.status) {
                case (#pending) { true };
                case (_) { false };
              };
            };
            case (null) { false };
          };
        }
      )
      .toArray();
  };

  public shared ({ caller }) func approveVIPUpgrade(
    user : Principal,
    adminMessage : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve VIP upgrades");
    };

    let currentStatus = switch (userVIPStatus.get(user)) {
      case (null) { Runtime.trap("User VIP status not found") };
      case (?status) { status };
    };

    let request = switch (currentStatus.requestedUpgrade) {
      case (null) { Runtime.trap("No upgrade request found") };
      case (?req) { req };
    };

    switch (request.status) {
      case (#pending) {};
      case (_) { Runtime.trap("Request is not pending") };
    };

    let newStatus : VIPStatus = {
      tier = request.tierTo;
      requestedUpgrade = ?{
        request with
        status = #approved;
        adminMessage;
      };
    };

    userVIPStatus.add(user, newStatus);
  };

  public shared ({ caller }) func rejectVIPUpgrade(
    user : Principal,
    adminMessage : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject VIP upgrades");
    };

    let currentStatus = switch (userVIPStatus.get(user)) {
      case (null) { Runtime.trap("User VIP status not found") };
      case (?status) { status };
    };

    let request = switch (currentStatus.requestedUpgrade) {
      case (null) { Runtime.trap("No upgrade request found") };
      case (?req) { req };
    };

    switch (request.status) {
      case (#pending) {};
      case (_) { Runtime.trap("Request is not pending") };
    };

    let newStatus : VIPStatus = {
      currentStatus with
      requestedUpgrade = ?{
        request with
        status = #rejected;
        adminMessage;
      };
    };

    userVIPStatus.add(user, newStatus);
  };

  // --- Helper Functions ---
  func fromNatToText(nat : Nat) : Text {
    var text : Text = "";
    switch (nat) {
      case (0) { text #= "0" };
      case (number) {
        let digit_chars = "0123456789".toArray();
        var temp : Nat = number;
        while (temp > 0) {
          text #= digit_chars[(temp % 10)].toText();
          temp /= 10;
        };
      };
    };
    text;
  };

  func toIterMap(map : Map.Map<Text, EarningItem>) : Iter.Iter<(Text, EarningItem)> {
    map.entries();
  };

  func getCurrentTime() : Time.Time {
    Time.now();
  };

  func getClaimByIdInternal(claimId : Text) : ?EarningClaim {
    earningClaims.get(claimId);
  };

  func updateVIPStatus(userId : Principal, newVIPStatus : VIPStatus) {
    userVIPStatus.add(userId, newVIPStatus);
  };

  func updateEarningClaim(id : Text, newClaim : EarningClaim) {
    earningClaims.add(id, newClaim);
  };

  public query ({ caller }) func getcallerEarningClaimsCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their claim count");
    };
    earningClaims.values()
      .filter(func(claim) { claim.userId == caller })
      .size();
  };

  public query ({ caller }) func getTotalRewardedAmount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their rewards");
    };
    switch (userBalanceMap.get(caller)) {
      case (null) { 0 };
      case (?bal) { bal };
    };
  };

  // --- Proposal Response Management ---
  type ProposalResponse = {
    accepted : Bool;
    note : ?Text;
  };

  let responses = Map.empty<Principal, ProposalResponse>();

  public shared ({ caller }) func submitResponse(accepted : Bool, note : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit responses");
    };
    let response : ProposalResponse = { accepted; note };
    responses.add(caller, response);
  };

  public query ({ caller }) func getCallerResponse() : async ?ProposalResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their response");
    };
    responses.get(caller);
  };

  public query ({ caller }) func getResponse(user : Principal) : async ?ProposalResponse {
    if (not AccessControl.isAdmin(accessControlState, caller) and caller != user) {
      Runtime.trap("Unauthorized: Can only view your own response");
    };
    responses.get(user);
  };

  // --- Invite Links and RSVP System ---
  let inviteState = InviteLinksModule.initState();

  public shared ({ caller }) func generateInviteCode() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate invite codes");
    };

    let blob = await Random.blob();
    let code = InviteLinksModule.generateUUID(blob);
    InviteLinksModule.generateInviteCode(inviteState, code);
    code;
  };

  public shared ({ caller }) func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit RSVPs");
    };
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all RSVPs");
    };

    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };

    InviteLinksModule.getInviteCodes(inviteState);
  };

  // --- Mining Functionality (Legacy) ---
  public type MiningConfig = {
    profileName : Text;
    targetHashrate : Nat;
    powerUsage : Nat;
    electricityCost : Nat;
    bitcoinPayoutAddress : Text;
  };

  public type MiningState = {
    config : MiningConfig;
    isActive : Bool;
    lastStartTimestamp : ?Time.Time;
    cumulativeRuntime : Nat;
    cumulativeEarnings : Nat;
  };

  public type MiningEvent = {
    eventType : Text;
    timestamp : Time.Time;
    details : ?Text;
  };

  public type Payout = {
    amount : Nat;
    address : Text;
    status : Text;
    timestamp : Time.Time;
  };

  let miningConfigs = Map.empty<Principal, MiningConfig>();
  let miningStates = Map.empty<Principal, MiningState>();
  let miningEvents = Map.empty<Principal, List.List<MiningEvent>>();
  let payoutRequests = Map.empty<Principal, List.List<Payout>>();

  public shared ({ caller }) func updateMiningConfig(config : MiningConfig) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update mining config");
    };
    miningConfigs.add(caller, config);
  };

  public query ({ caller }) func getMiningConfig() : async ?MiningConfig {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mining config");
    };
    miningConfigs.get(caller);
  };

  public shared ({ caller }) func startMining() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start mining");
    };

    let currentTime = Time.now();
    let config = switch (miningConfigs.get(caller)) {
      case (null) { Runtime.trap("Mining configuration not found") };
      case (?cfg) { cfg };
    };

    let newState : MiningState = {
      config;
      isActive = true;
      lastStartTimestamp = ?currentTime;
      cumulativeRuntime = 0;
      cumulativeEarnings = 0;
    };
    miningStates.add(caller, newState);

    let event : MiningEvent = {
      eventType = "Started";
      timestamp = currentTime;
      details = null;
    };

    let existingEvents = switch (miningEvents.get(caller)) {
      case (null) { List.empty<MiningEvent>() };
      case (?events) { events };
    };
    existingEvents.add(event);
    miningEvents.add(caller, existingEvents);
  };

  public shared ({ caller }) func stopMining() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can stop mining");
    };

    let currentTime = Time.now();
    let miningState = switch (miningStates.get(caller)) {
      case (null) { Runtime.trap("Mining state not found") };
      case (?state) { state };
    };

    let lastStartTimestamp = switch (miningState.lastStartTimestamp) {
      case (null) { Runtime.trap("Mining was not started") };
      case (?timestamp) { timestamp };
    };

    let sessionDuration = ((currentTime - lastStartTimestamp) / 1_000_000_000).toNat();
    let sessionEarnings = (sessionDuration.toInt() * miningState.config.targetHashrate.toInt() / 1_000).toNat();

    let newState : MiningState = {
      miningState with
      isActive = false;
      lastStartTimestamp = null;
      cumulativeRuntime = miningState.cumulativeRuntime + sessionDuration;
      cumulativeEarnings = miningState.cumulativeEarnings + sessionEarnings;
    };
    miningStates.add(caller, newState);

    let event : MiningEvent = {
      eventType = "Stopped";
      timestamp = currentTime;
      details = ?("Session Duration: " # sessionDuration.toText());
    };

    let existingEvents = switch (miningEvents.get(caller)) {
      case (null) { List.empty<MiningEvent>() };
      case (?events) { events };
    };
    existingEvents.add(event);
    miningEvents.add(caller, existingEvents);
  };

  public query ({ caller }) func getMiningState() : async ?MiningState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mining state");
    };
    miningStates.get(caller);
  };

  public query ({ caller }) func getMiningEvents() : async [MiningEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view mining events");
    };
    switch (miningEvents.get(caller)) {
      case (null) { [] };
      case (?events) { events.toArray() };
    };
  };

  public shared ({ caller }) func requestPayout(amount : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request payouts");
    };

    let miningState = switch (miningStates.get(caller)) {
      case (null) { Runtime.trap("Mining state not found") };
      case (?state) { state };
    };

    if (not miningState.isActive and amount > miningState.cumulativeEarnings) {
      Runtime.trap("Insufficient balance");
    };

    let payout : Payout = {
      amount;
      address = miningState.config.bitcoinPayoutAddress;
      status = "pending";
      timestamp = Time.now();
    };

    let _existingPayouts = switch (payoutRequests.get(caller)) {
      case (null) { List.empty<Payout>() };
      case (?payouts) { payouts };
    };
  };

  public shared ({ caller }) func completePayout(user : Principal, _payoutIndex : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can complete payouts");
    };
  };

  public query ({ caller }) func getPayoutHistory() : async [Payout] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payout history");
    };
    [];
  };

  // --- Exchange Functionality ---
  public type SupportedAsset = {
    symbol : Text;
    name : Text;
    decimals : Nat;
  };

  public type Deposit = {
    id : Text;
    txId : ?Text;
    amount : Int;
    asset : SupportedAsset;
    status : Text;
    timestamp : Time.Time;
  };

  public type Withdrawal = {
    id : Text;
    amount : Int;
    asset : SupportedAsset;
    status : Text;
    destinationAddress : Text;
    timestamp : Time.Time;
  };

  public type Trade = {
    id : Text;
    type_ : { #buy; #sell };
    inputAsset : SupportedAsset;
    inputAmount : Int;
    outputAsset : SupportedAsset;
    outputAmount : Int;
    rate : Float;
    status : Text;
    timestamp : Time.Time;
  };

  public type Balance = {
    asset : SupportedAsset;
    available : Int;
  };

  public type DepositAddresses = {
    trc20Address : Text;
    erc20Address : Text;
  };

  let userBalances = Map.empty<Principal, Map.Map<Text, Balance>>();
  let userDeposits = Map.empty<Principal, Map.Map<Text, Deposit>>();
  let userWithdrawals = Map.empty<Principal, Map.Map<Text, Withdrawal>>();
  let userTrades = Map.empty<Principal, Map.Map<Text, Trade>>();

  func supportedAssetsInternal() : [SupportedAsset] {
    [
      {
        symbol = "BTC";
        name = "Bitcoin";
        decimals = 8;
      },
      {
        symbol = "ETH";
        name = "Ethereum";
        decimals = 18;
      },
      {
        symbol = "USDT";
        name = "Tether";
        decimals = 6;
      },
      {
        symbol = "ICP";
        name = "Internet Computer";
        decimals = 8;
      },
    ];
  };

  let exchangeRates = Map.fromIter(
    [
      ("BTC/USDT", 70000.0),
      ("ETH/USDT", 3500.0),
    ].values()
  );

  public type ExchangeState = {
    balances : [(Text, Balance)];
    deposits : [(Text, Deposit)];
    withdrawals : [(Text, Withdrawal)];
    trades : [(Text, Trade)];
    supportedAssets : [SupportedAsset];
    exchangeRates : [(Text, Float)];
  };

  public query ({ caller }) func getSupportedAssets() : async [SupportedAsset] {
    supportedAssetsInternal();
  };

  public query ({ caller }) func getExchangeStateShared() : async ExchangeState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view exchange state");
    };

    let balances = switch (userBalances.get(caller)) {
      case (null) { Map.empty<Text, Balance>().toArray() };
      case (?bals) { bals.toArray() };
    };

    let deposits = switch (userDeposits.get(caller)) {
      case (null) { Map.empty<Text, Deposit>().toArray() };
      case (?deps) { deps.toArray() };
    };

    let withdrawals = switch (userWithdrawals.get(caller)) {
      case (null) { Map.empty<Text, Withdrawal>().toArray() };
      case (?withs) { withs.toArray() };
    };

    let trades = switch (userTrades.get(caller)) {
      case (null) { Map.empty<Text, Trade>().toArray() };
      case (?trds) { trds.toArray() };
    };

    {
      balances;
      deposits;
      withdrawals;
      trades;
      supportedAssets = supportedAssetsInternal();
      exchangeRates = exchangeRates.toArray();
    };
  };

  var usdtDepositAddresses : DepositAddresses = {
    trc20Address = "";
    erc20Address = "";
  };

  public query ({ caller }) func getUsdtDepositAddresses() : async DepositAddresses {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view deposit addresses");
    };
    usdtDepositAddresses;
  };

  public shared ({ caller }) func setUsdtDepositAddresses(addresses : DepositAddresses) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set deposit addresses");
    };
    usdtDepositAddresses := addresses;
  };

  public shared ({ caller }) func requestDeposit(assetSymbol : Text, amount : Int, txId : ?Text) : async Deposit {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create deposit requests");
    };

    if (amount <= 0) {
      Runtime.trap("Deposit amount must be positive");
    };

    let asset = switch (supportedAssetsInternal().find(func(a) { a.symbol == assetSymbol })) {
      case (null) { Runtime.trap("Asset not supported") };
      case (?a) { a };
    };

    let depositId = Time.now().toText() # "-" # caller.toText();
    let deposit : Deposit = {
      id = depositId;
      txId;
      amount;
      asset;
      status = "pending";
      timestamp = Time.now();
    };

    let deposits = switch (userDeposits.get(caller)) {
      case (null) { Map.empty<Text, Deposit>() };
      case (?deps) { deps };
    };
    deposits.add(depositId, deposit);
    userDeposits.add(caller, deposits);

    deposit;
  };

  public shared ({ caller }) func requestWithdrawal(
    assetSymbol : Text,
    amount : Int,
    destinationAddress : Text,
  ) : async Withdrawal {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create withdrawal requests");
    };

    if (amount <= 0) {
      Runtime.trap("Withdrawal amount must be positive");
    };

    let asset = switch (supportedAssetsInternal().find(func(a) { a.symbol == assetSymbol })) {
      case (null) { Runtime.trap("Asset not supported") };
      case (?a) { a };
    };

    let withdrawals = switch (userWithdrawals.get(caller)) {
      case (null) { Map.empty<Text, Withdrawal>() };
      case (?withs) { withs };
    };

    let withdrawalId = Time.now().toText() # "-" # caller.toText();
    let withdrawal : Withdrawal = {
      id = withdrawalId;
      amount;
      asset;
      status = "pending";
      destinationAddress;
      timestamp = Time.now();
    };

    withdrawals.add(withdrawalId, withdrawal);
    userWithdrawals.add(caller, withdrawals);

    withdrawal;
  };

  public query ({ caller }) func getAllPendingDeposits() : async [(Principal, Deposit)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all pending deposits");
    };

    let result = List.empty<(Principal, Deposit)>();
    for ((user, depositsMap) in userDeposits.entries()) {
      for ((_, deposit) in depositsMap.entries()) {
        if (deposit.status == "pending") {
          result.add((user, deposit));
        };
      };
    };
    result.toArray();
  };

  public query ({ caller }) func getAllPendingWithdrawals() : async [(Principal, Withdrawal)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all pending withdrawals");
    };

    let result = List.empty<(Principal, Withdrawal)>();
    for ((user, withdrawalsMap) in userWithdrawals.entries()) {
      for ((_, withdrawal) in withdrawalsMap.entries()) {
        if (withdrawal.status == "pending") {
          result.add((user, withdrawal));
        };
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func markDepositCompleted(
    user : Principal,
    depositId : Text,
    txId : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark deposits as completed");
    };

    let userDepositsMap = switch (userDeposits.get(user)) {
      case (null) { Runtime.trap("User has no deposits") };
      case (?deps) { deps };
    };

    let deposit = switch (userDepositsMap.get(depositId)) {
      case (null) { Runtime.trap("Deposit not found") };
      case (?d) { d };
    };

    if (deposit.status == "completed") {
      Runtime.trap("Deposit already completed");
    };

    let completedDeposit : Deposit = {
      deposit with
      status = "completed";
      txId = ?txId;
    };

    userDepositsMap.add(depositId, completedDeposit);
    userDeposits.add(user, userDepositsMap);

    updateBalance(user, deposit.asset, deposit.amount);
  };

  public shared ({ caller }) func markWithdrawalCompleted(user : Principal, withdrawalId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can mark withdrawals as completed");
    };

    let userWithdrawalsMap = switch (userWithdrawals.get(user)) {
      case (null) { Runtime.trap("User has no withdrawals") };
      case (?withs) { withs };
    };

    let withdrawal = switch (userWithdrawalsMap.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal not found") };
      case (?w) { w };
    };

    if (withdrawal.status == "completed") {
      Runtime.trap("Withdrawal already completed");
    };

    let completedWithdrawal : Withdrawal = {
      withdrawal with
      status = "completed";
    };

    userWithdrawalsMap.add(withdrawalId, completedWithdrawal);
    userWithdrawals.add(user, userWithdrawalsMap);
  };

  public shared ({ caller }) func trade(
    tradeType : { #buy; #sell },
    inputAssetSymbol : Text,
    outputAssetSymbol : Text,
    amount : Int,
  ) : async Trade {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create trades");
    };

    if (amount <= 0) {
      Runtime.trap("Trade amount must be positive");
    };

    let inputAsset = switch (supportedAssetsInternal().find(func(a) { a.symbol == inputAssetSymbol })) {
      case (null) { Runtime.trap("Input asset not supported") };
      case (?a) { a };
    };

    let outputAsset = switch (supportedAssetsInternal().find(func(a) { a.symbol == outputAssetSymbol })) {
      case (null) { Runtime.trap("Output asset not supported") };
      case (?a) { a };
    };

    let conversionRate = getConversionRate(inputAsset.symbol, outputAsset.symbol);
    let outputAmount = (amount.toFloat() * conversionRate).toInt();

    switch (tradeType) {
      case (#buy) {
        let userBalance = getBalance(caller, outputAssetSymbol);
        if (userBalance < outputAmount) {
          Runtime.trap("Insufficient balance in output asset");
        };
      };
      case (#sell) {
        let userBalance = getBalance(caller, inputAssetSymbol);
        if (userBalance < amount) {
          Runtime.trap("Insufficient balance in input asset");
        };
      };
    };

    balanceUpdate(tradeType, caller, inputAsset, outputAsset, amount, outputAmount);

    let tradeId = Time.now().toText() # "-" # caller.toText();
    let trade : Trade = {
      id = tradeId;
      type_ = tradeType;
      inputAsset;
      inputAmount = amount;
      outputAsset;
      outputAmount;
      rate = conversionRate;
      status = "completed";
      timestamp = Time.now();
    };

    let trades = switch (userTrades.get(caller)) {
      case (null) { Map.empty<Text, Trade>() };
      case (?trds) { trds };
    };
    trades.add(tradeId, trade);
    userTrades.add(caller, trades);

    trade;
  };

  func updateBalance(principal : Principal, asset : SupportedAsset, amount : Int) {
    let balances = switch (userBalances.get(principal)) {
      case (null) { Map.empty<Text, Balance>() };
      case (?bals) { bals };
    };

    let currentBalance = balances.get(asset.symbol);
    let newAvailable = switch (currentBalance) {
      case (null) { amount };
      case (?balance) { balance.available + amount };
    };

    let newBalance = {
      asset;
      available = newAvailable;
    };

    balances.add(asset.symbol, newBalance);
    userBalances.add(principal, balances);
  };

  func balanceUpdate(
    tradeType : { #buy; #sell },
    principal : Principal,
    inputAsset : SupportedAsset,
    outputAsset : SupportedAsset,
    inputAmount : Int,
    outputAmount : Int,
  ) {
    switch (tradeType) {
      case (#buy) {
        updateBalance(principal, inputAsset, inputAmount);
        updateBalance(principal, outputAsset, -outputAmount);
      };
      case (#sell) {
        updateBalance(principal, inputAsset, -inputAmount);
        updateBalance(principal, outputAsset, outputAmount);
      };
    };
  };

  func getConversionRate(inputSymbol : Text, outputSymbol : Text) : Float {
    if (inputSymbol == "BTC" and outputSymbol == "USDT") {
      return switch (exchangeRates.get("BTC/USDT")) {
        case (null) { 65000 };
        case (?rate) { rate };
      };
    };

    if (inputSymbol == "ETH" and outputSymbol == "USDT") {
      return switch (exchangeRates.get("ETH/USDT")) {
        case (null) { 3500 };
        case (?rate) { rate };
      };
    };

    if (inputSymbol == outputSymbol) { return 1; };

    1;
  };

  func getBalance(principal : Principal, assetSymbol : Text) : Int {
    let balances = switch (userBalances.get(principal)) {
      case (null) { return 0 };
      case (?bals) { bals };
    };

    switch (balances.get(assetSymbol)) {
      case (null) { 0 };
      case (?balance) { balance.available };
    };
  };

  func requireOwner(caller : Principal) {
    switch (owner) {
      case (null) { Runtime.trap("Canister has no owner set") };
      case (?o) {
        if (caller != o) {
          Runtime.trap("Unauthorized: Only the canister owner can call this function");
        };
      };
    };
  };
};
