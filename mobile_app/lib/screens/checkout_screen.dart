import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../providers/cart_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';
import '../services/api_client.dart';
import '../widgets/product_card.dart'; // for double.toLocaleString
import 'order_detail_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final ApiClient _apiClient = ApiClient();
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  String _paymentMethod = 'QR_CODE'; // 'STRIPE' | 'PAYPAL' | 'QR_CODE'
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _prefillFields();
  }

  void _prefillFields() {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    if (auth.user != null) {
      _nameController.text = auth.user!.name;
      _phoneController.text = auth.user!.phone;
      _addressController.text = auth.user!.address;
    }
  }

  Future<void> _handlePlaceOrder() async {
    if (!_formKey.currentState!.validate()) return;

    final cart = Provider.of<CartProvider>(context, listen: false);

    setState(() {
      _submitting = true;
    });

    try {
      // Format address as: Name | Tel: phone | Address: address
      final String formattedAddress = 
          '${_nameController.text.trim()} | Tel: ${_phoneController.text.trim()} | Address: ${_addressController.text.trim()}';

      final List<Map<String, dynamic>> orderItems = cart.items.values.map((item) {
        return {
          'productId': item.product.id,
          'quantity': item.quantity,
        };
      }).toList();

      final res = await _apiClient.post('/orders', {
        'items': orderItems,
        'shippingAddress': formattedAddress,
        'paymentMethod': _paymentMethod,
      });

      final String orderId = res['id'];
      
      // Clear cart locally
      cart.clearCart();

      if (_paymentMethod == 'QR_CODE') {
        // Go straight to details to show QR code and slip uploader
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: orderId)),
          );
        }
      } else {
        // Show simulation sheet for Stripe / PayPal
        if (mounted) {
          _showSimulationSheet(orderId);
        }
      }
    } catch (e) {
      print('Checkout error: $e');
      String errMsg = e.toString().replaceAll('Exception:', '').trim();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(errMsg), backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) {
        setState(() {
          _submitting = false;
        });
      }
    }
  }

  void _showSimulationSheet(String orderId) {
    final lang = Provider.of<LanguageProvider>(context, listen: false);
    final bool isStripe = _paymentMethod == 'STRIPE';

    showModalBottomSheet(
      context: context,
      isDismissible: false,
      enableDrag: false,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setSheetState) {
            bool completing = false;

            Future<void> completePayment() async {
              setSheetState(() {
                completing = true;
              });
              try {
                // Call PayPal capture endpoint to simulate payment status transition to PAID
                await _apiClient.post('/payments/paypal/capture', {
                  'orderId': orderId,
                  'paypalOrderId': 'mock_checkout_${isStripe ? "stripe" : "paypal"}_success',
                });

                if (mounted) {
                  Navigator.pop(ctx); // close sheet
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: orderId)),
                  );
                }
              } catch (err) {
                print('Payment capture fail: $err');
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Payment capture simulation failed.'), backgroundColor: Colors.red),
                  );
                  Navigator.pop(ctx);
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: orderId)),
                  );
                }
              }
            }

            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
              ),
              padding: const EdgeInsets.all(28),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Icon(
                    isStripe ? LucideIcons.creditCard : LucideIcons.wallet,
                    size: 48,
                    color: Colors.pink[400],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    isStripe ? 'Mock Credit Card (Stripe)' : 'Mock PayPal Checkout',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    lang.language == 'LA'
                        ? 'ລະບົບຢູ່ໃນໂຫມດພັດທະນາ, ທ່ານສາມາດຈຳລອງການຊຳລະເງິນສຳເລັດໄດ້ໂດຍການກົດປຸ່ມດ້ານລຸ່ມ'
                        : lang.language == 'TH'
                        ? 'ระบบอยู่ในโหมดพัฒนา คุณสามารถจำลองการชำระเงินสำเร็จได้โดยกดปุ่มด้านล่าง'
                        : 'Application is in development mode. You can simulate a successful transaction by pressing the button below.',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 12, color: Color(0xFF64748B), height: 1.5),
                  ),
                  const SizedBox(height: 24),
                  if (completing)
                    const Center(
                      child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(Colors.pink)),
                    )
                  else ...[
                    ElevatedButton(
                      onPressed: completePayment,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal[500],
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                      ),
                      child: const Text('Simulate Success Payment', style: TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton(
                      onPressed: () {
                        Navigator.pop(ctx);
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => OrderDetailScreen(orderId: orderId)),
                        );
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.grey[600],
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                        side: BorderSide(color: Colors.grey[300]!),
                      ),
                      child: const Text('Pay Later (Pending Payment)'),
                    ),
                  ],
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
    final cart = Provider.of<CartProvider>(context);
    final lang = Provider.of<LanguageProvider>(context);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: Text(
          lang.t('shippingAddress'),
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Address Fields Card
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
                      lang.t('shippingAddress'),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 16),

                    // Name input
                    TextFormField(
                      controller: _nameController,
                      validator: (val) => val == null || val.trim().isEmpty ? lang.t('fillAllFields') : null,
                      decoration: InputDecoration(
                        labelText: lang.t('recipientName'),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: Colors.pink[400]!),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Phone input
                    TextFormField(
                      controller: _phoneController,
                      validator: (val) => val == null || val.trim().isEmpty ? lang.t('fillAllFields') : null,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: lang.t('phoneNumber'),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: Colors.pink[400]!),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Address details input
                    TextFormField(
                      controller: _addressController,
                      validator: (val) => val == null || val.trim().isEmpty ? lang.t('fillAllFields') : null,
                      maxLines: 2,
                      decoration: InputDecoration(
                        labelText: lang.t('address'),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(14),
                          borderSide: BorderSide(color: Colors.pink[400]!),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Payment Method Select Card
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
                      lang.t('paymentMethod'),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 12),

                    // Stripe Radio
                    _buildPaymentRadio(
                      value: 'STRIPE',
                      icon: LucideIcons.creditCard,
                      title: lang.language == 'LA'
                          ? 'ຊຳລະຜ່ານບັດ (Stripe)'
                          : lang.language == 'TH'
                          ? 'ชำระผ่านบัตรเครดิต (Stripe)'
                          : 'Credit / Debit Card (Stripe)',
                      subtitle: 'Visa, Mastercard, JCB',
                    ),
                    const Divider(height: 20),

                    // PayPal Radio
                    _buildPaymentRadio(
                      value: 'PAYPAL',
                      icon: LucideIcons.wallet,
                      title: 'PayPal',
                      subtitle: 'Pay via PayPal Account',
                    ),
                    const Divider(height: 20),

                    // QR Code Radio
                    _buildPaymentRadio(
                      value: 'QR_CODE',
                      icon: LucideIcons.qrCode,
                      title: lang.language == 'LA'
                          ? 'ໂອນເງິນຜ່ານ QR (BCEL One)'
                          : lang.language == 'TH'
                          ? 'โอนผ่านบัญชีธนาคาร (QR Code)'
                          : 'Bank Transfer / BCEL One QR',
                      subtitle: 'Upload payment slip image',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // Billing Details summary Card
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
                      lang.language == 'LA' ? 'ສະຫຼຸບການສັ່ງຊື້' : lang.language == 'TH' ? 'สรุปรายการสั่งซื้อ' : 'Order Summary',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 16),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: cart.items.length,
                      itemBuilder: (context, idx) {
                        final item = cart.items.values.toList()[idx];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  '${item.product.getName(lang.language)} x${item.quantity}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(fontSize: 12, color: Color(0xFF475569)),
                                ),
                              ),
                              Text(
                                '${(item.product.price * item.quantity).toInt().toLocaleString()} LAK',
                                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const Divider(height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          lang.t('total'),
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                        ),
                        Text(
                          '${cart.totalAmount.toInt().toLocaleString()} LAK',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            color: Colors.pink[600],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Place Order Button
              ElevatedButton(
                onPressed: _submitting ? null : _handlePlaceOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.pink[400],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  elevation: 0,
                ),
                child: _submitting
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation(Colors.white)),
                      )
                    : Text(
                        lang.t('placeOrder'),
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentRadio({
    required String value,
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    final isSelected = _paymentMethod == value;

    return GestureDetector(
      onTap: () {
        setState(() {
          _paymentMethod = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        color: Colors.transparent,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected ? Colors.pink[50] : const Color(0xFFF1F5F9),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 20, color: isSelected ? Colors.pink[500] : const Color(0xFF64748B)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                      color: isSelected ? const Color(0xFF0F172A) : const Color(0xFF475569),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(fontSize: 11, color: Color(0xFF94A3B8)),
                  ),
                ],
              ),
            ),
            Radio<String>(
              value: value,
              groupValue: _paymentMethod,
              activeColor: Colors.pink[400],
              onChanged: (String? val) {
                if (val != null) {
                  setState(() {
                    _paymentMethod = val;
                  });
                }
              },
            ),
          ],
        ),
      ),
    );
  }
}
