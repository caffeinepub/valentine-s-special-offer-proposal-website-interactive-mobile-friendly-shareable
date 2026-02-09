import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import InviteLinksModule "invite-links/invite-links-module";
import Random "mo:core/Random";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
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

  // Proposal Response Management
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

  // Invite Links and RSVP System
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

  public func submitRSVP(name : Text, attending : Bool, inviteCode : Text) : async () {
    InviteLinksModule.submitRSVP(inviteState, name, attending, inviteCode);
  };

  public query ({ caller }) func getAllRSVPs() : async [InviteLinksModule.RSVP] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view RSVPs");
    };
    InviteLinksModule.getAllRSVPs(inviteState);
  };

  public query ({ caller }) func getInviteCodes() : async [InviteLinksModule.InviteCode] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view invite codes");
    };
    InviteLinksModule.getInviteCodes(inviteState);
  };

  // Mining Configuration & State
  // Types for config, state, events, payouts
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

  // Persistent storage for mining data
  let miningConfigs = Map.empty<Principal, MiningConfig>();
  let miningStates = Map.empty<Principal, MiningState>();
  let miningEvents = Map.empty<Principal, List.List<MiningEvent>>();
  let payoutRequests = Map.empty<Principal, List.List<Payout>>();

  // Core mining functions
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
      case (null) {
        Runtime.trap("Mining configuration not found");
      };
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
      Runtime.trap("Only users can stop mining");
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

    let sessionDuration = ((currentTime - lastStartTimestamp) / 1_000_000_000).toNat(); // Convert to seconds
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

    let existingPayouts = switch (payoutRequests.get(caller)) {
      case (null) { List.empty<Payout>() };
      case (?payouts) { payouts };
    };
    existingPayouts.add(payout);
    payoutRequests.add(caller, existingPayouts);
  };

  public query ({ caller }) func getPayoutHistory() : async [Payout] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view payout history");
    };
    switch (payoutRequests.get(caller)) {
      case (null) { [] };
      case (?payouts) { payouts.toArray() };
    };
  };
};
