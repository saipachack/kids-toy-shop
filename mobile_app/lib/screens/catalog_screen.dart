import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../models/product.dart';
import '../providers/language_provider.dart';
import '../services/api_client.dart';
import '../widgets/product_card.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  final ApiClient _apiClient = ApiClient();
  final TextEditingController _searchController = TextEditingController();

  List<Category> _categories = [];
  List<Product> _products = [];
  String? _selectedCategorySlug;
  bool _loadingCategories = false;
  bool _loadingProducts = false;
  String _searchQuery = '';
  String _sortBy = 'newest'; // 'newest' | 'price_asc' | 'price_desc'

  @override
  void initState() {
    super.initState();
    _fetchCategories();
    _fetchProducts();
  }

  Future<void> _fetchCategories() async {
    setState(() {
      _loadingCategories = true;
    });
    try {
      final List<dynamic> data = await _apiClient.get('/products/categories');
      setState(() {
        _categories = data.map((json) => Category.fromJson(json)).toList();
      });
    } catch (e) {
      print('Error fetching categories: $e');
    } finally {
      setState(() {
        _loadingCategories = false;
      });
    }
  }

  Future<void> _fetchProducts() async {
    setState(() {
      _loadingProducts = true;
    });
    try {
      String path = '/products?sort=$_sortBy';
      if (_selectedCategorySlug != null) {
        path += '&category=$_selectedCategorySlug';
      }
      if (_searchQuery.isNotEmpty) {
        path += '&search=${Uri.encodeComponent(_searchQuery)}';
      }

      final List<dynamic> data = await _apiClient.get(path);
      setState(() {
        _products = data.map((json) => Product.fromJson(json)).toList();
      });
    } catch (e) {
      print('Error fetching products: $e');
    } finally {
      setState(() {
        _loadingProducts = false;
      });
    }
  }

  void _onCategorySelected(String? slug) {
    setState(() {
      _selectedCategorySlug = slug;
    });
    _fetchProducts();
  }

  void _onSearch(String val) {
    setState(() {
      _searchQuery = val;
    });
    _fetchProducts();
  }

  @override
  Widget build(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Column(
          children: [
            // Top branding / header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        lang.language == 'LA' ? 'ສະບາຍດີ' : lang.language == 'TH' ? 'สวัสดีค่ะ' : 'Hello!',
                        style: const TextStyle(
                          fontSize: 14,
                          color: Color(0xFF64748B),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        lang.language == 'LA' ? 'ຍິນດີຕ້ອນຮັບ' : lang.language == 'TH' ? 'ยินดีต้อนรับ' : 'Welcome!',
                        style: const TextStyle(
                          fontSize: 22,
                          color: Color(0xFF0F172A),
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                        ),
                      ),
                    ],
                  ),
                  // App branding bubble
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.pink[300]!, Colors.purple[400]!],
                      ),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'PattiePlayShop',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                      ),
                    ),
                  )
                ],
              ),
            ),

            // Search Bar & Filter Button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.grey[200]!),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.01),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      child: TextField(
                        controller: _searchController,
                        onSubmitted: _onSearch,
                        decoration: InputDecoration(
                          hintText: lang.language == 'LA' ? 'ຄົ້ນຫາສິນຄ້າ...' : lang.language == 'TH' ? 'ค้นหาสินค้า...' : 'Search products...',
                          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 13),
                          prefixIcon: const Icon(LucideIcons.search, size: 18, color: Color(0xFF64748B)),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(vertical: 12),
                          suffixIcon: _searchQuery.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear, size: 18),
                                  onPressed: () {
                                    _searchController.clear();
                                    _onSearch('');
                                  },
                                )
                              : null,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  // Sort Trigger Icon
                  PopupMenuButton<String>(
                    icon: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: const Icon(LucideIcons.sliders, size: 18, color: Color(0xFF0F172A)),
                    ),
                    onSelected: (String val) {
                      setState(() {
                        _sortBy = val;
                      });
                      _fetchProducts();
                    },
                    itemBuilder: (BuildContext context) => [
                      PopupMenuItem(
                        value: 'newest',
                        child: Text(lang.language == 'LA' ? 'ສິນຄ້າມາໃໝ່' : lang.language == 'TH' ? 'สินค้ามาใหม่' : 'Newest Arrivals'),
                      ),
                      PopupMenuItem(
                        value: 'price_asc',
                        child: Text(lang.language == 'LA' ? 'ລາຄາ: ຕ່ຳຫາສູງ' : lang.language == 'TH' ? 'ราคา: ต่ำไปสูง' : 'Price: Low to High'),
                      ),
                      PopupMenuItem(
                        value: 'price_desc',
                        child: Text(lang.language == 'LA' ? 'ລາຄາ: ສູງຫາຕ່ຳ' : lang.language == 'TH' ? 'ราคา: สูงไปต่ำ' : 'Price: High to Low'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Horizontal Categories Scroll
            SizedBox(
              height: 48,
              child: _loadingCategories
                  ? const Center(child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.pink))))
                  : ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      itemCount: _categories.length + 1,
                      itemBuilder: (context, index) {
                        final isAll = index == 0;
                        final Category? cat = isAll ? null : _categories[index - 1];
                        final isSelected = isAll ? (_selectedCategorySlug == null) : (_selectedCategorySlug == cat!.slug);

                        final name = isAll
                            ? (lang.language == 'LA' ? 'ທັງໝົດ' : lang.language == 'TH' ? 'ทั้งหมด' : 'All')
                            : cat!.getName(lang.language);

                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: GestureDetector(
                            onTap: () => _onCategorySelected(isAll ? null : cat!.slug),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.pink[400] : Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: isSelected ? Colors.pink[400]! : Colors.grey[200]!,
                                ),
                                boxShadow: [
                                  if (isSelected)
                                    BoxShadow(
                                      color: Colors.pink.withOpacity(0.2),
                                      blurRadius: 8,
                                      offset: const Offset(0, 4),
                                    )
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  name,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected ? Colors.white : const Color(0xFF64748B),
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
            ),

            // Product Grid
            Expanded(
              child: RefreshIndicator(
                color: Colors.pink,
                onRefresh: () async {
                  await _fetchCategories();
                  await _fetchProducts();
                },
                child: _loadingProducts
                    ? const Center(
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation(Colors.pink),
                        ),
                      )
                    : _products.isEmpty
                        ? ListView(
                            children: [
                              SizedBox(height: MediaQuery.of(context).size.height * 0.25),
                              Center(
                                child: Column(
                                  children: [
                                    const Icon(LucideIcons.packageOpen, size: 60, color: Color(0xFF94A3B8)),
                                    const SizedBox(height: 16),
                                    Text(
                                      lang.language == 'LA' ? 'ບໍ່ມີສິນຄ້າ' : lang.language == 'TH' ? 'ไม่พบสินค้า' : 'No products found',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF475569),
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      lang.language == 'LA' ? 'ລອງຄົ້ນຫາຄຳສັບອື່ນ ຫຼື ປ່ຽນໝວດໝູ່' : lang.language == 'TH' ? 'ลองค้นหาคำอื่นหรือเปลี่ยนหมวดหมู่' : 'Try searching for something else',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: Color(0xFF94A3B8),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          )
                        : GridView.builder(
                            padding: const EdgeInsets.all(16),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.72,
                              crossAxisSpacing: 14,
                              mainAxisSpacing: 14,
                            ),
                            itemCount: _products.length,
                            itemBuilder: (context, index) {
                              return ProductCard(product: _products[index]);
                            },
                          ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
