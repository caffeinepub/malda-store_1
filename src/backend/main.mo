import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



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

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  public type UserProfile = {
    name : Text;
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
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper Functions
  func isValidCategory(category : Category) : Bool {
    predefinedCategories.find(func(c) { c == category }) != null;
  };

  func checkAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  // Seed Initial Products
  func seedInitialProducts() {
    if (products.isEmpty()) {
      products.add(
        1,
        {
          id = 1;
          name = "Apples";
          price = 120;
          category = "Fruits & Vegetables";
          image = null;
          active = true;
        },
      );
      products.add(
        2,
        {
          id = 2;
          name = "Milk 1L";
          price = 60;
          category = "Dairy & Eggs";
          image = null;
          active = true;
        },
      );
      products.add(
        3,
        {
          id = 3;
          name = "Whole Wheat Bread";
          price = 40;
          category = "Bakery";
          image = null;
          active = true;
        },
      );
      products.add(
        4,
        {
          id = 4;
          name = "Orange Juice 1L";
          price = 90;
          category = "Beverages";
          image = null;
          active = true;
        },
      );
      products.add(
        5,
        {
          id = 5;
          name = "Chicken Breast 500g";
          price = 250;
          category = "Meat & Seafood";
          image = null;
          active = true;
        },
      );
      products.add(
        6,
        {
          id = 6;
          name = "Potato Chips";
          price = 30;
          category = "Snacks";
          image = null;
          active = true;
        },
      );
      products.add(
        7,
        {
          id = 7;
          name = "Dish Soap";
          price = 50;
          category = "Household";
          image = null;
          active = true;
        },
      );
    };
  };

  // Seed products on first deploy (in constructor)
  seedInitialProducts();

  // User Profiles
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

  // Product Management - Admin Only
  public shared ({ caller }) func addProduct(
    id : ProductId,
    name : Text,
    price : Rupees,
    category : Category,
  ) : async () {
    checkAdmin(caller);

    if (not isValidCategory(category)) {
      Runtime.trap("Invalid category. Must be one of predefined categories.");
    };

    if (products.containsKey(id)) {
      switch (products.get(id)) {
        case (?existingProduct) {
          if (not existingProduct.active) {
            Runtime.trap("Cannot add product with existing inactive (soft deleted) ID");
          };
          let updatedProduct = {
            existingProduct with
            name;
            price;
            category;
            active = true;
          };
          products.add(id, updatedProduct);
        };
        case (null) {};
      };
    } else {
      let newProduct = {
        id;
        name;
        price;
        category;
        image = null;
        active = true;
      };
      products.add(id, newProduct);
    };
  };

  public shared ({ caller }) func updateProduct(
    id : ProductId,
    name : Text,
    price : Rupees,
    category : Category,
  ) : async () {
    checkAdmin(caller);

    if (not isValidCategory(category)) {
      Runtime.trap("Invalid category. Must be one of predefined categories.");
    };

    switch (products.get(id)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?existingProduct) {
        if (not existingProduct.active) {
          Runtime.trap("Cannot update an inactive (soft deleted) product");
        };
        let updatedProduct = {
          existingProduct with
          name;
          price;
          category;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : ProductId) : async () {
    checkAdmin(caller);

    switch (products.get(id)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?existingProduct) {
        let updatedProduct = {
          existingProduct with
          active = false;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  // Product Queries - Public (no authorization needed)
  public query func getCategories() : async [Text] {
    predefinedCategories;
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

  // Image Management - Admin Only
  public shared ({ caller }) func uploadProductImage(productId : ProductId, image : Storage.ExternalBlob) : async () {
    checkAdmin(caller);

    switch (products.get(productId)) {
      case (null) {
        Runtime.trap("Product not found");
      };
      case (?product) {
        let updatedProduct = {
          product with
          image = ?image;
        };
        products.add(productId, updatedProduct);
      };
    };
  };
};
