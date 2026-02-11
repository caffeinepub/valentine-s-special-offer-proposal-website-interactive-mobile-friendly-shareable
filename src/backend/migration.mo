import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // Old actor type
  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    responses : Map.Map<Principal, {
      accepted : Bool;
      note : ?Text;
    }>;

    miningConfigs : Map.Map<Principal, {
      profileName : Text;
      targetHashrate : Nat;
      powerUsage : Nat;
      electricityCost : Nat;
      bitcoinPayoutAddress : Text;
    }>;

    miningStates : Map.Map<Principal, {
      config : {
        profileName : Text;
        targetHashrate : Nat;
        powerUsage : Nat;
        electricityCost : Nat;
        bitcoinPayoutAddress : Text;
      };
      isActive : Bool;
      lastStartTimestamp : ?Time.Time;
      cumulativeRuntime : Nat;
      cumulativeEarnings : Nat;
    }>;

    miningEvents : Map.Map<Principal, List.List<{
      eventType : Text;
      timestamp : Time.Time;
      details : ?Text;
    }>>;

    payoutRequests : Map.Map<Principal, List.List<{
      amount : Nat;
      address : Text;
      status : Text;
      timestamp : Time.Time;
    }>>;

    userBalances : Map.Map<Principal, Map.Map<Text, {
      asset : {
        symbol : Text;
        name : Text;
        decimals : Nat;
      };
      available : Int;
    }>>;

    userDeposits : Map.Map<Principal, Map.Map<Text, {
      id : Text;
      txId : Text;
      amount : Int;
      asset : {
        symbol : Text;
        name : Text;
        decimals : Nat;
      };
      status : Text;
      timestamp : Time.Time;
    }>>;

    userWithdrawals : Map.Map<Principal, Map.Map<Text, {
      id : Text;
      amount : Int;
      asset : {
        symbol : Text;
        name : Text;
        decimals : Nat;
      };
      status : Text;
      destinationAddress : Text;
      timestamp : Time.Time;
    }>>;

    userTrades : Map.Map<Principal, Map.Map<Text, {
      id : Text;
      type_ : { #buy; #sell };
      inputAsset : {
        symbol : Text;
        name : Text;
        decimals : Nat;
      };
      inputAmount : Int;
      outputAsset : {
        symbol : Text;
        name : Text;
        decimals : Nat;
      };
      outputAmount : Int;
      rate : Float;
      status : Text;
      timestamp : Time.Time;
    }>>;

    usdtDepositAddresses : {
      trc20Address : Text;
      erc20Address : Text;
    };
  };

  public func run(old : OldActor) : {} {
    {};
  };
};
