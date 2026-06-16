import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';
import '../providers/language_provider.dart';
import '../services/api_client.dart';
import '../screens/product_detail_screen.dart';

class ProductCard extends StatefulWidget {
  final Product product;

  const ProductCard({super.key, required this.product});

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  bool _added = false;

  void _handleAddToCart(BuildContext context) {
    final cart = Provider.of<CartProvider>(context, listen: false);
    cart.addToCart(widget.product, 1);
    setState(() {
      _added = true;
    });
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        setState(() {
          _added = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context);
    final hasStock = widget.product.stock > 0;
    
    // Resolve image URL
    final imageUrl = widget.product.images.isNotEmpty 
        ? ApiClient.getMediaUrl(widget.product.images[0]) 
        : 'https://images.unsplash.com/photo-1531641098792-4f3951222129?w=300';

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => ProductDetailScreen(productId: widget.product.id),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.grey[200]!),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 10,
              offset: const Offset(0, 4),
            )
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image Section
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                    child: Container(
                      width: double.infinity,
                      height: double.infinity,
                      color: Colors.grey[100],
                      child: Image.network(
                        imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Center(
                          child: Icon(LucideIcons.image, color: Colors.grey),
                        ),
                      ),
                    ),
                  ),

                  // Promo Tags
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (widget.product.isBestSeller)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            margin: const EdgeInsets.only(bottom: 4),
                            decoration: BoxDecoration(
                              color: Colors.pink[400],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'Best Seller 🔥',
                              style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                        if (widget.product.isNewArrival)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.blue[400],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Text(
                              'New ✨',
                              style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                            ),
                          ),
                      ],
                    ),
                  ),

                  // Out of stock overlay
                  if (!hasStock)
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.4),
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                      ),
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.red[600],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            lang.t('outOfStock'),
                            style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Content Section
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category Label
                  if (widget.product.category != null)
                    Text(
                      widget.product.category!.getName(lang.language).toUpperCase(),
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Colors.purple[400],
                        letterSpacing: 0.5,
                      ),
                    ),
                  const SizedBox(height: 4),

                  // Product Name
                  Text(
                    widget.product.getName(lang.language),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Stars Rating
                  Row(
                    children: List.generate(
                      5,
                      (_) => Icon(
                        Icons.star,
                        size: 12,
                        color: Colors.amber[600],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Price and Cart Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          '${widget.product.price.toInt().toLocaleString()} LAK',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                      ),
                      
                      // Floating cart button
                      GestureDetector(
                        onTap: (!hasStock || _added) ? null : () => _handleAddToCart(context),
                        child: Container(
                          height: 28,
                          width: 28,
                          decoration: BoxDecoration(
                            color: _added 
                                ? Colors.teal[450] ?? Colors.teal 
                                : !hasStock 
                                ? Colors.grey[200] 
                                : Colors.pink[50],
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            _added ? Icons.check : LucideIcons.shoppingCart,
                            size: 14,
                            color: _added 
                                ? Colors.white 
                                : !hasStock 
                                ? Colors.grey[400] 
                                : Colors.pink[400],
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Extension to format price with commas
extension DoubleFormatter on double {
  String toLocaleString() {
    RegExp reg = RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))');
    return toInt().toString().replaceAllMapped(reg, (Match match) => '${match[1]},');
  }
}

extension IntFormatter on int {
  String toLocaleString() {
    RegExp reg = RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))');
    return toString().replaceAllMapped(reg, (Match match) => '${match[1]},');
  }
}

extension StringFormatter on String {
  String toLocaleString() {
    double? val = double.tryParse(this);
    if (val != null) return val.toLocaleString();
    return this;
  }
}

extension BottomMargin on EdgeInsets {
  static EdgeInsets bottomValues(double value) {
    return EdgeInsets.only(bottom: value);
  }
}
