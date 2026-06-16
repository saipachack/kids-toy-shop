import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/cart_provider.dart';
import '../providers/language_provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_client.dart';
import '../widgets/product_card.dart'; // for double.toLocaleString()
import 'checkout_screen.dart';
import 'login_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  void _handleCheckout(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final lang = Provider.of<LanguageProvider>(context, listen: false);

    if (!auth.isAuthenticated) {
      // Prompt user to log in
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text(lang.language == 'LA' ? 'ກະລຸນາເຂົ້າສູ່ລະບົບ' : lang.language == 'TH' ? 'กรุณาเข้าสู่ระบบ' : 'Authentication Required'),
          content: Text(lang.language == 'LA' ? 'ທ່ານຕ້ອງເຂົ້າສູ່ລະບົບກ່ອນເພື່ອດຳເນີນການສັ່ງຊື້' : lang.language == 'TH' ? 'คุณต้องเข้าสู่ระบบก่อนเพื่อดำเนินการสั่งซื้อ' : 'Please sign in with Google to proceed with checkout.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(lang.t('cancel'), style: TextStyle(color: Colors.grey[600])),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.pink[400],
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              child: Text(lang.t('loginTitle')),
            ),
          ],
        ),
      );
      return;
    }

    // Go to checkout
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const CheckoutScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    final lang = Provider.of<LanguageProvider>(context);
    final itemsList = cart.items.values.toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        centerTitle: true,
        title: Text(
          lang.language == 'LA' ? 'ກະຕ່າສິນຄ້າ' : lang.language == 'TH' ? 'ตะกร้าสินค้า' : 'Your Cart',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
      ),
      body: cart.items.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(LucideIcons.shoppingBag, size: 64, color: Color(0xFF94A3B8)),
                  const SizedBox(height: 16),
                  Text(
                    lang.language == 'LA' ? 'ກະຕ່າຂອງທ່ານວ່າງເປົ່າ' : lang.language == 'TH' ? 'ตะกร้าของคุณว่างเปล่า' : 'Your cart is empty',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    lang.language == 'LA' ? 'ເລືອກສິນຄ້າທີ່ທ່ານມັກໃສ່ກະຕ່າເລີຍ!' : lang.language == 'TH' ? 'เลือกสินค้าที่คุณชอบใส่ตะกร้าเลย!' : 'Browse products and add them to your cart!',
                    style: const TextStyle(fontSize: 12, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
            )
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: itemsList.length,
                    itemBuilder: (context, index) {
                      final item = itemsList[index];
                      final p = item.product;
                      final imageUrl = p.images.isNotEmpty
                          ? ApiClient.getMediaUrl(p.images[0])
                          : 'https://images.unsplash.com/photo-1531641098792-4f3951222129?w=150';

                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.grey[200]!),
                        ),
                        child: Row(
                          children: [
                            // Product Image
                            ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: Container(
                                width: 72,
                                height: 72,
                                color: Colors.grey[100],
                                child: Image.network(
                                  imageUrl,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, __, ___) => const Icon(LucideIcons.image, color: Colors.grey),
                                ),
                              ),
                            ),
                            const SizedBox(width: 14),

                            // Name & Price
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    p.getName(lang.language),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF1E293B),
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    '${p.price.toInt().toLocaleString()} LAK',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.pink[500],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Quantity Controls and Delete
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                IconButton(
                                  icon: const Icon(LucideIcons.trash2, size: 16, color: Color(0xFFEF4444)),
                                  onPressed: () => cart.removeFromCart(p.id),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                ),
                                const SizedBox(height: 12),
                                Container(
                                  decoration: BoxDecoration(
                                    border: Border.all(color: Colors.grey[200]!),
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Row(
                                    children: [
                                      GestureDetector(
                                        onTap: () => cart.updateQuantity(p.id, item.quantity - 1),
                                        child: const Padding(
                                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          child: Icon(Icons.remove, size: 14),
                                        ),
                                      ),
                                      Text(
                                        '${item.quantity}',
                                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                      ),
                                      GestureDetector(
                                        onTap: () => cart.updateQuantity(p.id, item.quantity + 1),
                                        child: const Padding(
                                          padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                          child: Icon(Icons.add, size: 14),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // Checkout Card
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border(top: BorderSide(color: Colors.grey[200]!)),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            lang.t('total'),
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                          ),
                          Text(
                            '${cart.totalAmount.toInt().toLocaleString()} LAK',
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => _handleCheckout(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.pink[400],
                          foregroundColor: Colors.white,
                          minimumSize: const Size.fromHeight(50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        child: Text(
                          lang.t('checkout'),
                          style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
