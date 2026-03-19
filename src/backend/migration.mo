import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type Category = Text;
  type ProductId = Nat;
  type Rupees = Nat;

  type OldActor = {
    products : Map.Map<ProductId, OldProduct>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  type OldProduct = {
    id : ProductId;
    name : Text;
    price : Rupees;
    category : Category;
    image : ?Storage.ExternalBlob;
    active : Bool;
  };

  type UserProfile = {
    name : Text;
  };

  type NewProduct = {
    id : ProductId;
    name : Text;
    price : Rupees;
    category : Category;
    image : ?Storage.ExternalBlob;
    active : Bool;
  };

  type NewActor = {
    products : Map.Map<ProductId, NewProduct>;
    userProfiles : Map.Map<Principal, UserProfile>;
    nextProductId : ProductId;
  };

  public func run(old : OldActor) : NewActor {
    var maxId = 0;
    for (product in old.products.values()) {
      if (product.id > maxId) {
        maxId := product.id;
      };
    };

    {
      products = old.products;
      userProfiles = old.userProfiles;
      nextProductId = maxId + 1;
    };
  };
};
