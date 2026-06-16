import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/product.dart';
import '../providers/cart_provider.dart';
import '../providers/language_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_client.dart';
import '../widgets/product_card.dart'; // for extension toLocaleString

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final ApiClient _apiClient = ApiClient();
  Product? _product;
  List<dynamic> _reviews = [];
  bool _loading = false;
  int _quantity = 1;
  int _activeImageIndex = 0;

  // Add review form state
  int _reviewRating = 5;
  final TextEditingController _reviewController = TextEditingController();
  bool _submittingReview = false;

  @override
  void initState() {
    super.initState();
    _fetchDetails();
  }

  Future<void> _fetchDetails() async {
    setState(() {
      _loading = true;
    });
    try {
      final data = await _apiClient.get('/products/${widget.productId}');
      setState(() {
        _product = Product.fromJson(data);
        _reviews = data['reviews'] ?? [];
      });
    } catch (e) {
      print('Error fetching product details: $e');
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  void _handleAddToCart(BuildContext context) {
    if (_product == null) return;
    final cart = Provider.of<CartProvider>(context, listen: false);
    final lang = Provider.of<LanguageProvider>(context, listen: false);

    cart.addToCart(_product!, _quantity);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(lang.t('addedToCart')),
        backgroundColor: Colors.teal,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  Future<void> _submitReview() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final lang = Provider.of<LanguageProvider>(context, listen: false);

    if (!auth.isAuthenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(lang.language == 'LA' ? 'ກະລຸນາເຂົ້າສູ່ລະບົບກ່ອນ' : lang.language == 'TH' ? 'กรุณาเข้าสู่ระบบก่อน' : 'Please sign in first'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_reviewController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('fillAllFields')), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() {
      _submittingReview = true;
    });

    try {
      await _apiClient.post('/products/${widget.productId}/reviews', {
        'rating': _reviewRating,
        'comment': _reviewController.text.trim(),
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('reviewSuccess')), backgroundColor: Colors.teal),
      );
      _reviewController.clear();
      setState(() {
        _reviewRating = 5;
      });
      // Refresh details to show new review
      _fetchDetails();
    } catch (e) {
      String errMsg = e.toString().replaceAll('Exception:', '').trim();
      try {
        final parsed = jsonDecode(errMsg);
        errMsg = lang.tObj(parsed['messageEn'] ?? '', parsed['messageTh'] ?? '', parsed['messageLa'] ?? '');
      } catch (_) {}
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errMsg), backgroundColor: Colors.red),
      );
    } finally {
      setState(() {
        _submittingReview = false;
      });
    }
  }

  void _showAddReviewSheet(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context, listen: false);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
                top: 24,
                left: 24,
                right: 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        lang.t('writeReview'),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    lang.t('starRating'),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: List.generate(5, (index) {
                      final starVal = index + 1;
                      return IconButton(
                        icon: Icon(
                          Icons.star,
                          size: 32,
                          color: starVal <= _reviewRating ? Colors.amber[600] : Colors.grey[300],
                        ),
                        onPressed: () {
                          setSheetState(() {
                            _reviewRating = starVal;
                          });
                          setState(() {
                            _reviewRating = starVal;
                          });
                        },
                      );
                    }),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    lang.t('reviewComment'),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _reviewController,
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: lang.language == 'LA' ? 'ຂຽນຄວາມຄິດເຫັນ...' : lang.language == 'TH' ? 'เขียนความคิดเห็น...' : 'Write comment...',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(16),
                        borderSide: BorderSide(color: Colors.pink[400]!),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: _submittingReview
                        ? null
                        : () async {
                            Navigator.pop(context);
                            await _submitReview();
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.pink[400],
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                    ),
                    child: _submittingReview
                        ? const SizedBox(
                            height: 18,
                            width: 18,
                            child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.white)),
                          )
                        : Text(lang.t('submit'), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context);
    final auth = Provider.of<AuthProvider>(context);

    if (_loading && _product == null) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation(Colors.pink),
          ),
        ),
      );
    }

    if (_product == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Text(lang.language == 'LA' ? 'ບໍ່ພົບສິນຄ້າ' : lang.language == 'TH' ? 'ไม่พบสินค้า' : 'Product not found'),
        ),
      );
    }

    final hasStock = _product!.stock > 0;
    final List<String> imageUrls = _product!.images.isNotEmpty
        ? _product!.images.map((img) => ApiClient.getMediaUrl(img)).toList()
        : ['https://images.unsplash.com/photo-1531641098792-4f3951222129?w=600'];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Text(
          _product!.category?.getName(lang.language) ?? 'Product Details',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Image Slider Carousel
            Stack(
              children: [
                Container(
                  height: MediaQuery.of(context).size.width,
                  color: Colors.grey[100],
                  child: PageView.builder(
                    itemCount: imageUrls.length,
                    onPageChanged: (index) {
                      setState(() {
                        _activeImageIndex = index;
                      });
                    },
                    itemBuilder: (context, index) {
                      return Image.network(
                        imageUrls[index],
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Center(
                          child: Icon(LucideIcons.image, size: 60, color: Colors.grey),
                        ),
                      );
                    },
                  ),
                ),
                // Indicator dots
                if (imageUrls.length > 1)
                  Positioned(
                    bottom: 16,
                    left: 0,
                    right: 0,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(imageUrls.length, (index) {
                        return Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: _activeImageIndex == index ? Colors.pink[400] : Colors.grey[300],
                          ),
                        );
                      }),
                    ),
                  ),
              ],
            ),

            // Product Details Block
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badges
                  Row(
                    children: [
                      if (_product!.isBestSeller) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.pink[50],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.pink[200]!),
                          ),
                          child: Text(
                            'Best Seller 🔥',
                            style: TextStyle(color: Colors.pink[700], fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      if (_product!.isNewArrival) ...[
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.blue[50],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.blue[200]!),
                          ),
                          child: Text(
                            'New ✨',
                            style: TextStyle(color: Colors.blue[700], fontSize: 10, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 8),
                      ],
                      // Stock status badge
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: hasStock ? Colors.teal[50] : Colors.red[50],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: hasStock ? Colors.teal[200]! : Colors.red[200]!),
                        ),
                        child: Text(
                          hasStock ? '${lang.t('inStock')} (${_product!.stock})' : lang.t('outOfStock'),
                          style: TextStyle(
                            color: hasStock ? Colors.teal[700] : Colors.red[700],
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Title & Price
                  Text(
                    _product!.getName(lang.language),
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: Color(0xFF0F172A),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${_product!.price.toInt().toLocaleString()} LAK',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      color: Colors.pink[600],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Quantity selection block
                  if (hasStock) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          lang.t('quantity'),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey[200]!),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Row(
                            children: [
                              IconButton(
                                icon: const Icon(Icons.remove, size: 18),
                                onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                child: Text(
                                  '$_quantity',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.add, size: 18),
                                onPressed: _quantity < _product!.stock ? () => setState(() => _quantity++) : null,
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Description Block
                  Text(
                    lang.t('description'),
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _product!.getDescription(lang.language),
                    style: const TextStyle(
                      fontSize: 13,
                      height: 1.6,
                      color: Color(0xFF475569),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Reviews Block Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${lang.t('starRating')} (${_reviews.length})',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      if (auth.isAuthenticated)
                        TextButton.icon(
                          onPressed: () => _showAddReviewSheet(context),
                          icon: const Icon(LucideIcons.edit3, size: 14, color: Colors.pink),
                          label: Text(
                            lang.t('writeReview'),
                            style: TextStyle(color: Colors.pink[400], fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Reviews list
                  if (_reviews.isEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      alignment: Alignment.center,
                      child: Text(
                        lang.language == 'LA' ? 'ຍັງບໍ່ມີຣີວິວ' : lang.language == 'TH' ? 'ยังไม่มีรีวิว' : 'No reviews yet',
                        style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                      ),
                    )
                  else
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _reviews.length,
                      separatorBuilder: (_, __) => const Divider(height: 24),
                      itemBuilder: (context, index) {
                        final r = _reviews[index];
                        final rUser = r['user']?['name'] ?? 'Anonymous';
                        final rRating = r['rating'] ?? 5;
                        final rComment = r['comment'] ?? '';

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  rUser,
                                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                ),
                                Row(
                                  children: List.generate(
                                    5,
                                    (i) => Icon(
                                      Icons.star,
                                      size: 12,
                                      color: i < rRating ? Colors.amber[600] : Colors.grey[200],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              rComment,
                              style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                            ),
                          ],
                        );
                      },
                    ),
                  const SizedBox(height: 100), // padding at bottom for add to cart button
                ],
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey[200]!)),
        ),
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton(
                onPressed: hasStock ? () => _handleAddToCart(context) : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.pink[400],
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: Colors.grey[300],
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                ),
                child: Text(
                  hasStock ? lang.t('addToCart') : lang.t('outOfStock'),
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
