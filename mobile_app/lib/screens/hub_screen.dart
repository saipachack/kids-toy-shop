import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/cart_provider.dart';
import '../providers/language_provider.dart';
import 'catalog_screen.dart';
import 'cart_screen.dart';
import 'profile_screen.dart';

class HubScreen extends StatefulWidget {
  const HubScreen({super.key});

  @override
  State<HubScreen> createState() => _HubScreenState();
}

class _HubScreenState extends State<HubScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    const CatalogScreen(),
    const CartScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    final lang = Provider.of<LanguageProvider>(context);

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: Colors.grey[200]!,
              width: 1,
            ),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          backgroundColor: Colors.white,
          selectedItemColor: Colors.pink[400],
          unselectedItemColor: const Color(0xFF94A3B8),
          selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
          unselectedLabelStyle: const TextStyle(fontSize: 10),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          items: [
            BottomNavigationBarItem(
              icon: const Icon(LucideIcons.store, size: 20),
              activeIcon: Icon(LucideIcons.store, size: 20, color: Colors.pink[400]),
              label: lang.language == 'LA' ? 'ຮ້ານຄ້າ' : lang.language == 'TH' ? 'ร้านค้า' : 'Shop',
            ),
            BottomNavigationBarItem(
              icon: Stack(
                clipBehavior: Clip.none,
                children: [
                  const Icon(LucideIcons.shoppingCart, size: 20),
                  if (cart.itemCount > 0)
                    Positioned(
                      top: -6,
                      right: -8,
                      child: Container(
                        padding: const EdgeInsets.all(3.5),
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        constraints: const BoxConstraints(
                          minWidth: 16,
                          minHeight: 16,
                        ),
                        child: Text(
                          '${cart.itemCount}',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                ],
              ),
              label: lang.language == 'LA' ? 'ກະຕ່າ' : lang.language == 'TH' ? 'ตะกร้า' : 'Cart',
            ),
            BottomNavigationBarItem(
              icon: const Icon(LucideIcons.user, size: 20),
              label: lang.language == 'LA' ? 'ໂປຣຟາຍ' : lang.language == 'TH' ? 'โปรไฟล์' : 'Profile',
            ),
          ],
        ),
      ),
    );
  }
}
