import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../models/order.dart';
import '../services/api_client.dart';
import '../widgets/product_card.dart'; // for double.toLocaleString()
import 'order_detail_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiClient _apiClient = ApiClient();
  List<Order> _orders = [];
  bool _loading = false;
  double _totalSpent = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchOrderHistory();
  }

  Future<void> _fetchOrderHistory() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (!auth.isAuthenticated) return;

    setState(() {
      _loading = true;
    });

    try {
      final List<dynamic> data = await _apiClient.get('/orders');
      final fetchedOrders = data.map((json) => Order.fromJson(json)).toList();
      
      // Calculate total spent on PAID or DELIVERED orders
      double spent = 0.0;
      for (final order in fetchedOrders) {
        if (order.status == 'PAID' || 
            order.status == 'PREPARING' || 
            order.status == 'SHIPPING' || 
            order.status == 'DELIVERED') {
          spent += order.totalAmount;
        }
      }

      setState(() {
        _orders = fetchedOrders;
        _totalSpent = spent;
      });
    } catch (e) {
      print('Error loading order history: $e');
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final lang = Provider.of<LanguageProvider>(context);

    if (!auth.isAuthenticated) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(LucideIcons.userX, size: 64, color: Color(0xFF94A3B8)),
              const SizedBox(height: 16),
              Text(
                lang.language == 'LA' ? 'ກະລຸນາເຂົ້າສູ່ລະບົບ' : lang.language == 'TH' ? 'กรุณาเข้าสู่ระบบ' : 'Please Sign In',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  // Direct to main login loop (handled by app root state checker)
                  auth.logout(); 
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.pink[400],
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                ),
                child: Text(lang.t('loginTitle')),
              ),
            ],
          ),
        ),
      );
    }

    final user = auth.user!;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        centerTitle: true,
        title: Text(
          lang.language == 'LA' ? 'ໂປຣຟາຍ' : lang.language == 'TH' ? 'โปรไฟล์' : 'Profile',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
      ),
      body: RefreshIndicator(
        color: Colors.pink,
        onRefresh: _fetchOrderHistory,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // User Card details
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 36,
                      backgroundColor: Colors.pink[50],
                      child: Text(
                        user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.pink[400]),
                      ),
                    ),
                    const SizedBox(height: 14),
                    Text(
                      user.name,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user.email,
                      style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 16),
                    const Divider(),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatItem(
                          _orders.length.toString(),
                          lang.language == 'LA' ? 'ຄຳສັ່ງຊື້ທັງໝົດ' : lang.language == 'TH' ? 'คำสั่งซื้อทั้งหมด' : 'Total Orders',
                        ),
                        _buildStatItem(
                          '${_totalSpent.toInt().toLocaleString()} LAK',
                          lang.t('totalSpent'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Settings Block (Language and logout)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      lang.language == 'LA' ? 'ການຕັ້ງຄ່າ' : lang.language == 'TH' ? 'การตั้งค่า' : 'Settings',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF94A3B8)),
                    ),
                    const SizedBox(height: 14),
                    // Language picker row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          lang.language == 'LA' ? 'ພາສາ' : lang.language == 'TH' ? 'ภาษา' : 'Language',
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                        ),
                        Row(
                          children: [
                            _buildLanguageBadge(context, 'EN', 'EN'),
                            const SizedBox(width: 6),
                            _buildLanguageBadge(context, 'TH', 'TH'),
                            const SizedBox(width: 6),
                            _buildLanguageBadge(context, 'LA', 'LA'),
                          ],
                        ),
                      ],
                    ),
                    const Divider(height: 28),
                    // Logout tile
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: Icon(LucideIcons.logOut, color: Colors.red[500]),
                      title: Text(
                        lang.t('logout'),
                        style: TextStyle(color: Colors.red[600], fontSize: 13, fontWeight: FontWeight.bold),
                      ),
                      onTap: () => auth.logout(),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Orders History Section Header
              Text(
                lang.t('ordersHistory'),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
              ),
              const SizedBox(height: 12),

              // Orders List
              if (_loading && _orders.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(24.0),
                    child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(Colors.pink)),
                  ),
                )
              else if (_orders.isEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  alignment: Alignment.center,
                  child: Column(
                    children: [
                      const Icon(LucideIcons.receipt, size: 48, color: Color(0xFFCBD5E1)),
                      const SizedBox(height: 12),
                      Text(lang.t('noOrders'), style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                    ],
                  ),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _orders.length,
                  itemBuilder: (context, idx) {
                    final order = _orders[idx];
                    final dateText = '${order.createdAt.day}/${order.createdAt.month}/${order.createdAt.year}';
                    final isPending = order.status == 'PENDING_PAYMENT';
                    final isVerify = order.status == 'AWAITING_VERIFICATION';
                    final isPaid = order.status == 'PAID' || order.status == 'PREPARING' || order.status == 'SHIPPING' || order.status == 'DELIVERED';
                    final isCancel = order.status == 'CANCELLED';

                    Color statusBg = Colors.grey[100]!;
                    Color statusColor = const Color(0xFF64748B);
                    if (isPending) {
                      statusBg = Colors.orange[50]!;
                      statusColor = Colors.orange[700]!;
                    } else if (isVerify) {
                      statusBg = Colors.blue[50]!;
                      statusColor = Colors.blue[700]!;
                    } else if (isPaid) {
                      statusBg = Colors.teal[50]!;
                      statusColor = Colors.teal[700]!;
                    } else if (isCancel) {
                      statusBg = Colors.red[50]!;
                      statusColor = Colors.red[700]!;
                    }

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: ListTile(
                        contentPadding: const EdgeInsets.all(16),
                        title: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              order.orderNumber,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: statusBg,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                order.getStatusLabel(lang.language),
                                style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ),
                        subtitle: Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${lang.t('orderDate')}: $dateText',
                                style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                              ),
                              Text(
                                '${order.totalAmount.toInt().toLocaleString()} LAK',
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
                              ),
                            ],
                          ),
                        ),
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => OrderDetailScreen(orderId: order.id),
                            ),
                          ).then((_) => _fetchOrderHistory()); // refresh after returning
                        },
                      ),
                    );
                  },
                ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(String val, String label) {
    return Column(
      children: [
        Text(
          val,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF0F172A)),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildLanguageBadge(BuildContext context, String code, String label) {
    final lang = Provider.of<LanguageProvider>(context);
    final isSelected = lang.language == code;

    return GestureDetector(
      onTap: () {
        lang.setLanguage(code);
        _fetchOrderHistory(); // refresh order history translation labels
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected ? Colors.pink[50] : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? Colors.pink[400]! : Colors.grey[300]!,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? Colors.pink[700] : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }
}
