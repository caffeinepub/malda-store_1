import Map "mo:core/Map";
import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  // Types
  type ProductId = Nat;
  type Rupees = Nat;
  type Category = Text;

  public type Product = {
    id : ProductId;
    name : Text;
    price : Rupees;
    category : Category;
    image : ?Storage.ExternalBlob;
    active : Bool;
  };

  public type UserProfile = {
    name : Text;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  // Categories
  let predefinedCategories : [Text] = [
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Bakery",
    "Beverages",
    "Meat & Seafood",
    "Snacks",
    "Household",
    "Other",
  ];

  // State Maps
  let products = Map.empty<ProductId, Product>();
  var nextProductId = 1;

  // Keep these stable vars from previous version to avoid compatibility errors
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper Functions
  func isValidCategory(category : Category) : Bool {
    predefinedCategories.find(func(c) { c == category }) != null;
  };

  // Seed Initial Products
  func seedInitialProducts() {
    if (products.isEmpty()) {
      let initialProducts : [(Text, Rupees, Category)] = [
        ("Fruits & Vegetables", 120, "Fruits & Vegetables"),
        ("Dairy & Eggs", 60, "Dairy & Eggs"),
        ("Bakery", 40, "Bakery"),
        ("Beverages", 90, "Beverages"),
        ("Meat & Seafood", 250, "Meat & Seafood"),
        ("Snacks", 30, "Snacks"),
        ("Household", 50, "Household"),
      ];

      var productId = 1;
      for ((name, price, category) in initialProducts.values()) {
        products.add(
          productId,
          {
            id = productId;
            name;
            price;
            category;
            image = null;
            active = true;
          },
        );
        productId += 1;
      };
      nextProductId := productId;
    };
  };

  seedInitialProducts();

  // User Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
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

  // Product Management (no admin check - auth handled on frontend)
  public shared ({ caller }) func addProduct(name : Text, price : Rupees, category : Category) : async ProductId {
    if (not isValidCategory(category)) {
      Runtime.trap("Invalid category.");
    };

    let id = nextProductId;
    let newProduct : Product = {
      id;
      name;
      price;
      category;
      image = null;
      active = true;
    };

    products.add(id, newProduct);
    nextProductId += 1;
    id;
  };

  public shared ({ caller }) func updateProduct(id : ProductId, name : Text, price : Rupees, category : Category) : async () {
    if (not isValidCategory(category)) {
      Runtime.trap("Invalid category.");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        products.add(id, { existingProduct with name; price; category });
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : ProductId) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?existingProduct) {
        products.add(id, { existingProduct with active = false });
      };
    };
  };

  // Product Queries
  public query func getCategories() : async [Text] {
    predefinedCategories.sort();
  };

  public query func getProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.active }).sort();
  };

  public query func getProductsByCategory(category : Category) : async [Product] {
    products.values().toArray().filter(func(p) { p.active and p.category == category }).sort();
  };

  public query func getProductById(id : ProductId) : async ?Product {
    products.get(id);
  };

  // Image Management
  public shared ({ caller }) func uploadProductImage(productId : ProductId, image : Storage.ExternalBlob) : async () {
    switch (products.get(productId)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        products.add(productId, { product with image = ?image });
      };
    };
  };
};
