import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  type OldDeposit = {
    id : Text;
    txId : Text;
    amount : Int;
    asset : {
      symbol : Text;
      name : Text;
      decimals : Nat;
    };
    status : Text;
    timestamp : Int;
  };

  type NewDeposit = {
    id : Text;
    txId : ?Text;
    amount : Int;
    asset : {
      symbol : Text;
      name : Text;
      decimals : Nat;
    };
    status : Text;
    timestamp : Int;
  };

  type OldActor = {
    userDeposits : Map.Map<Principal, Map.Map<Text, OldDeposit>>;
  };

  type NewActor = {
    userDeposits : Map.Map<Principal, Map.Map<Text, NewDeposit>>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserDeposits = old.userDeposits.map<Principal, Map.Map<Text, OldDeposit>, Map.Map<Text, NewDeposit>>(
      func(_userId, depositMap) {
        depositMap.map<Text, OldDeposit, NewDeposit>(
          func(_depositId, oldDeposit) {
            {
              oldDeposit with
              txId = if (oldDeposit.txId == "") { null } else { ?oldDeposit.txId };
            };
          }
        );
      }
    );
    { userDeposits = newUserDeposits };
  };
};
