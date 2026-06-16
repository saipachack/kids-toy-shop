import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/product.dart';

class CartItem {
  final Product product;
  int quantity;

  CartItem({
    required this.product,
    required this.quantity,
  });

  Map<String, dynamic> toJson() {
    return {
      'product': product.toJson(),
      'quantity': quantity,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      product: Product.fromJson(json['product']),
      quantity: json['quantity'] ?? 1,
    );
  }
}

class CartProvider with ChangeNotifier {
  Map<String, CartItem> _items = {};

  Map<String, CartItem> get items => {..._items};

  int get itemCount => _items.values.fold(0, (sum, item) => sum + item.quantity);

  double get totalAmount {
    return _items.values.fold(0.0, (sum, item) => sum + (item.product.price * item.quantity));
  }

  CartProvider() {
    _loadCart();
  }

  Future<void> _loadCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cartData = prefs.getString('cart_items');
      if (cartData != null) {
        final decoded = jsonDecode(cartData) as Map<String, dynamic>;
        _items = decoded.map(
          (key, value) => MapEntry(key, CartItem.fromJson(value)),
        );
        notifyListeners();
      }
    } catch (e) {
      print('Failed to load cart: $e');
    }
  }

  Future<void> _saveCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = jsonEncode(_items.map((key, value) => MapEntry(key, value.toJson())));
      await prefs.setString('cart_items', encoded);
    } catch (e) {
      print('Failed to save cart: $e');
    }
  }

  void addToCart(Product product, int quantity) {
    if (_items.containsKey(product.id)) {
      _items.update(
        product.id,
        (existing) => CartItem(
          product: existing.product,
          quantity: existing.quantity + quantity,
        ),
      );
    } else {
      _items.putIfAbsent(
        product.id,
        () => CartItem(product: product, quantity: quantity),
      );
    }
    notifyListeners();
    _saveCart();
  }

  void updateQuantity(String productId, int quantity) {
    if (_items.containsKey(productId)) {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        _items[productId]!.quantity = quantity;
        notifyListeners();
        _saveCart();
      }
    }
  }

  void removeFromCart(String productId) {
    _items.remove(productId);
    notifyListeners();
    _saveCart();
  }

  void clearCart() {
    _items = {};
    notifyListeners();
    _saveCart();
  }
}
