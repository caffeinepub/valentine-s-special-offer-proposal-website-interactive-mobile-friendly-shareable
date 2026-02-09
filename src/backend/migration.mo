import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Time "mo:core/Time";

module {
  // Mining related types
  type MiningConfig = {
    profileName : Text;
    targetHashrate : Nat;
    powerUsage : Nat;
    electricityCost : Nat;
    bitcoinPayoutAddress : Text;
  };

  type MiningState = {
    config : MiningConfig;
    isActive : Bool;
    lastStartTimestamp : ?Time.Time;
    cumulativeRuntime : Nat;
    cumulativeEarnings : Nat;
  };

  type MiningEvent = {
    eventType : Text;
    timestamp : Time.Time;
    details : ?Text;
  };

  type Payout = {
    amount : Nat;
    address : Text;
    status : Text;
    timestamp : Time.Time;
  };

  // Old actor type (without mining fields)
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    responses : Map.Map<Principal, { accepted : Bool; note : ?Text }>;
  };

  // New actor type (with mining fields)
  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    responses : Map.Map<Principal, { accepted : Bool; note : ?Text }>;
    miningConfigs : Map.Map<Principal, MiningConfig>;
    miningStates : Map.Map<Principal, MiningState>;
    miningEvents : Map.Map<Principal, List.List<MiningEvent>>;
    payoutRequests : Map.Map<Principal, List.List<Payout>>;
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    {
      old with
      miningConfigs = Map.empty<Principal, MiningConfig>();
      miningStates = Map.empty<Principal, MiningState>();
      miningEvents = Map.empty<Principal, List.List<MiningEvent>>();
      payoutRequests = Map.empty<Principal, List.List<Payout>>();
    };
  };
};
