import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:image_picker/image_picker.dart';
import '../models/order.dart';
import '../providers/language_provider.dart';
import '../services/api_client.dart';
import '../widgets/product_card.dart'; // for double.toLocaleString()

class OrderDetailScreen extends StatefulWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final ApiClient _apiClient = ApiClient();
  final ImagePicker _imagePicker = ImagePicker();

  Order? _order;
  dynamic _qrDetails;
  bool _loading = false;
  bool _uploading = false;
  bool _cancelling = false;

  @override
  void initState() {
    super.initState();
    _fetchOrder();
  }

  Future<void> _fetchOrder() async {
    setState(() {
      _loading = true;
    });
    try {
      final data = await _apiClient.get('/orders/${widget.orderId}');
      final orderObj = Order.fromJson(data);
      setState(() {
        _order = orderObj;
      });

      if (orderObj.paymentMethod == 'QR_CODE' && orderObj.status == 'PENDING_PAYMENT') {
        final qrData = await _apiClient.get('/payments/qr-details');
        setState(() {
          _qrDetails = qrData;
        });
      }
    } catch (e) {
      print('Error loading order: $e');
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _handleCancelOrder() async {
    final lang = Provider.of<LanguageProvider>(context, listen: false);
    final confirmMsg = lang.language == 'LA'
        ? 'ທ່ານແນ່ໃຈຫຼືບໍ່ວ່າຕ້ອງການຍົກເລີກຄຳສັ່ງຊື້ນີ້?'
        : lang.language == 'TH'
            ? 'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?'
            : 'Are you sure you want to cancel this order?';

    final bool? confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(lang.t('cancelOrder')),
        content: Text(confirmMsg),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(lang.t('cancel'), style: TextStyle(color: Colors.grey[600])),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: Text(lang.language == 'LA' ? 'ຕົກລົງ' : lang.language == 'TH' ? 'ตกลง' : 'OK'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() {
      _cancelling = true;
    });

    try {
      await _apiClient.post('/orders/${widget.orderId}/cancel', {});
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(lang.language == 'LA' ? 'ຍົກເລີກສຳເລັດ' : lang.language == 'TH' ? 'ยกเลิกสำเร็จ' : 'Cancelled successfully'),
          backgroundColor: Colors.teal,
        ),
      );
      _fetchOrder();
    } catch (e) {
      print('Cancel order error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString().replaceAll('Exception:', '').trim()), backgroundColor: Colors.red),
      );
    } finally {
      setState(() {
        _cancelling = false;
      });
    }
  }

  Future<void> _handleUploadSlip() async {
    final lang = Provider.of<LanguageProvider>(context, listen: false);

    // Pick image from gallery
    final XFile? image = await _imagePicker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    if (image == null) return;

    setState(() {
      _uploading = true;
    });

    try {
      final File file = File(image.path);
      await _apiClient.uploadSlip('/orders/${widget.orderId}/upload-slip', file, 'slip');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(lang.t('slipSuccess')), backgroundColor: Colors.teal),
      );
      _fetchOrder();
    } catch (e) {
      print('Slip upload error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(lang.language == 'LA' ? 'ອັບໂຫລດສະລິບບໍ່ສຳເລັດ' : lang.language == 'TH' ? 'อัปโหลดสลิปไม่สำเร็จ' : 'Failed to upload slip'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _uploading = false;
      });
    }
  }

  void _showImageDialog(String url, String title) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
                  IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                ],
              ),
            ),
            Container(
              constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.6),
              child: Image.network(
                ApiClient.getMediaUrl(url),
                fit: BoxFit.contain,
                errorBuilder: (_, __, ___) => const Center(
                  child: Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Icon(LucideIcons.image, size: 64, color: Colors.grey),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context);

    if (_loading && _order == null) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation(Colors.pink)),
        ),
      );
    }

    if (_order == null) {
      return Scaffold(
        appBar: AppBar(),
        body: Center(
          child: Text(lang.language == 'LA' ? 'ບໍ່ພົບຄຳສັ່ງຊື້' : lang.language == 'TH' ? 'ไม่พบคำสั่งซื้อ' : 'Order not found'),
        ),
      );
    }

    // Status Stepper Data
    final statusSteps = ['PENDING_PAYMENT', 'AWAITING_VERIFICATION', 'PAID', 'PREPARING', 'SHIPPING', 'DELIVERED'];
    final statusLabels = {
      'PENDING_PAYMENT': { 'EN': 'Ordered', 'TH': 'สั่งซื้อแล้ว', 'LA': 'ສັ່ງຊື້ແລ້ວ' },
      'AWAITING_VERIFICATION': { 'EN': 'Verifying', 'TH': 'กำลังตรวจสอบ', 'LA': 'ກຳລັງຢືນຢັນ' },
      'PAID': { 'EN': 'Paid', 'TH': 'ชำระเงินแล้ว', 'LA': 'ຊຳລະເງິນແລ້ວ' },
      'PREPARING': { 'EN': 'Packing', 'TH': 'กำลังจัดเตรียม', 'LA': 'ກຳລັງກຽມສິນຄ້າ' },
      'SHIPPING': { 'EN': 'Shipped', 'TH': 'จัดส่งแล้ว', 'LA': 'ຈັດສົ່ງແລ້ວ' },
      'DELIVERED': { 'EN': 'Delivered', 'TH': 'ส่งสินค้าเรียบร้อย', 'LA': 'ຈັດສົ່ງສຳເລັດ' },
    };

    final currentStepIndex = statusSteps.indexOf(_order!.status);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        centerTitle: true,
        title: Text(
          _order!.orderNumber,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        actions: [
          if (_order!.status == 'PENDING_PAYMENT' || _order!.status == 'AWAITING_VERIFICATION')
            IconButton(
              icon: const Icon(LucideIcons.trash2, color: Colors.red),
              onPressed: _cancelling ? null : _handleCancelOrder,
            )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Stepper Progress Card
            if (_order!.status != 'CANCELLED')
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
                      lang.t('trackOrder'),
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 20),
                    // Stepper Row
                    Row(
                      children: List.generate(statusSteps.length, (idx) {
                        final isCompleted = idx <= currentStepIndex;
                        final isCurrent = idx == currentStepIndex;
                        final stepKey = statusSteps[idx];
                        final labelMap = statusLabels[stepKey]!;
                        final label = labelMap[lang.language] ?? labelMap['EN']!;

                        return Expanded(
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  // Left Connector
                                  Expanded(
                                    child: Container(
                                      height: 3,
                                      color: idx == 0
                                          ? Colors.transparent
                                          : isCompleted
                                              ? Colors.pink[400]
                                              : Colors.grey[200],
                                    ),
                                  ),
                                  // Circle Dot
                                  Container(
                                    height: 20,
                                    width: 20,
                                    decoration: BoxDecoration(
                                      color: isCompleted ? Colors.pink[400] : Colors.white,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isCompleted ? Colors.pink[400]! : Colors.grey[300]!,
                                        width: 2.5,
                                      ),
                                      boxShadow: [
                                        if (isCurrent)
                                          BoxShadow(
                                            color: Colors.pink.withOpacity(0.3),
                                            blurRadius: 8,
                                            spreadRadius: 2,
                                          )
                                      ],
                                    ),
                                    child: isCompleted
                                        ? const Icon(Icons.check, size: 10, color: Colors.white)
                                        : null,
                                  ),
                                  // Right Connector
                                  Expanded(
                                    child: Container(
                                      height: 3,
                                      color: idx == statusSteps.length - 1
                                          ? Colors.transparent
                                          : (idx < currentStepIndex)
                                              ? Colors.pink[400]
                                              : Colors.grey[200],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                label,
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 8.5,
                                  fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                                  color: isCurrent
                                      ? Colors.pink[700]
                                      : isCompleted
                                          ? const Color(0xFF1E293B)
                                          : const Color(0xFF94A3B8),
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ),
                  ],
                ),
              )
            else
              // Cancelled Status Card
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.red[200]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.cancel, color: Colors.red[700], size: 24),
                    const SizedBox(width: 12),
                    Text(
                      lang.language == 'LA' ? 'ຄຳສັ່ງຊື້ນີ້ຖືກຍົກເລີກແລ້ວ' : lang.language == 'TH' ? 'คำสั่งซื้อนี้ถูกยกเลิกแล้ว' : 'This order has been cancelled',
                      style: TextStyle(color: Colors.red[700], fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 20),

            // QR Code Payment Section
            if (_order!.status == 'PENDING_PAYMENT' && _order!.paymentMethod == 'QR_CODE' && _qrDetails != null)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.pink[200]!),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.pink.withOpacity(0.02),
                      blurRadius: 16,
                    )
                  ],
                ),
                child: Column(
                  children: [
                    Text(
                      lang.t('payQrCode'),
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.pink[700]),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      lang.t('scanQrToPay'),
                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 16),

                    // QR Image
                    ClipRRect(
                      borderRadius: BorderRadius.circular(16),
                      child: Container(
                        height: 200,
                        width: 200,
                        color: Colors.grey[50],
                        child: Image.network(
                          ApiClient.getMediaUrl(_qrDetails['qrImageUrl']),
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => const Center(
                            child: Icon(LucideIcons.qrCode, size: 60, color: Colors.grey),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Amount row with Copy
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(lang.t('amountToTransfer'), style: const TextStyle(fontSize: 10, color: Color(0xFF64748B))),
                              const SizedBox(height: 2),
                              Text(
                                '${_order!.totalAmount.toInt().toLocaleString()} LAK',
                                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                              ),
                            ],
                          ),
                          TextButton.icon(
                            onPressed: () {
                              Clipboard.setData(ClipboardData(text: _order!.totalAmount.toInt().toString()));
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(content: Text(lang.t('copied')), duration: const Duration(seconds: 1)),
                              );
                            },
                            icon: const Icon(LucideIcons.copy, size: 14, color: Colors.pink),
                            label: Text(lang.t('copy'), style: const TextStyle(color: Colors.pink, fontSize: 11)),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Bank Account Info Block
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildBankInfoRow(lang.t('bankName'), _qrDetails['bankName']),
                          _buildBankInfoRow(lang.t('accountName'), _qrDetails['accountName']),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(child: _buildBankInfoRow(lang.t('accountNumber'), _qrDetails['accountNumber'])),
                              TextButton(
                                onPressed: () {
                                  Clipboard.setData(ClipboardData(text: _qrDetails['accountNumber']));
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(content: Text(lang.t('copied')), duration: const Duration(seconds: 1)),
                                  );
                                },
                                style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(40, 30)),
                                child: Text(lang.t('copy'), style: TextStyle(color: Colors.pink[400], fontSize: 11)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Image selector and uploader
                    ElevatedButton.icon(
                      onPressed: _uploading ? null : _handleUploadSlip,
                      icon: const Icon(LucideIcons.upload, size: 16),
                      label: Text(lang.t('uploadSlip'), style: const TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.pink[400],
                        foregroundColor: Colors.white,
                        minimumSize: const Size.fromHeight(48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 20),

            // Invoice / Order items Card
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
                    lang.language == 'LA' ? 'ລາຍການສິນຄ້າ' : lang.language == 'TH' ? 'รายการสินค้า' : 'Order Items',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 16),
                  ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _order!.orderItems.length,
                    separatorBuilder: (_, __) => const Divider(height: 20),
                    itemBuilder: (context, idx) {
                      final item = _order!.orderItems[idx];
                      final name = item.product?.getName(lang.language) ?? 'Unknown Product';
                      final priceText = '${item.price.toInt().toLocaleString()} LAK';

                      return Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  name,
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF1E293B)),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${lang.t('quantity')}: ${item.quantity}',
                                  style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            priceText,
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                          ),
                        ],
                      );
                    },
                  ),
                  const Divider(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        lang.t('total'),
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      Text(
                        '${_order!.totalAmount.toInt().toLocaleString()} LAK',
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
            const SizedBox(height: 20),

            // Shipping / Address details card
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
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                  ),
                  const SizedBox(height: 12),
                  _buildAddressField(lang.t('recipientName'), _order!.shipName),
                  _buildAddressField(lang.t('phoneNumber'), _order!.shipPhone),
                  _buildAddressField(lang.t('address'), _order!.shipAddressOnly),
                  if (_order!.trackingNumber != null) ...[
                    const Divider(height: 24),
                    _buildAddressField(
                      lang.language == 'LA' ? 'ເລກຕິດຕາມພັດສະດຸ' : lang.language == 'TH' ? 'เลขพัสดุจัดส่ง' : 'Tracking Number',
                      _order!.trackingNumber!,
                      isHighlight: true,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Uploaded Slip Buttons (View slips)
            if (_order!.slipUrl != null || _order!.shippingSlipUrl != null)
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
                      lang.language == 'LA' ? 'ເອກະສານແນບ' : lang.language == 'TH' ? 'เอกสารแนบ' : 'Attached Documents',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF475569)),
                    ),
                    const SizedBox(height: 12),
                    if (_order!.slipUrl != null)
                      ListTile(
                        leading: const Icon(LucideIcons.image, color: Colors.pink),
                        title: Text(lang.t('uploadSlip').replaceAll('อัปโหลด', 'ดู').replaceAll('Upload', 'View').replaceAll('ອັບໂຫລດ', 'ເບິ່ງ')),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                        onTap: () => _showImageDialog(_order!.slipUrl!, lang.t('uploadSlip')),
                      ),
                    if (_order!.shippingSlipUrl != null) ...[
                      if (_order!.slipUrl != null) const Divider(),
                      ListTile(
                        leading: const Icon(LucideIcons.truck, color: Colors.pink),
                        title: Text(lang.t('shippingSlip')),
                        trailing: const Icon(Icons.arrow_forward_ios, size: 14),
                        onTap: () => _showImageDialog(_order!.shippingSlipUrl!, lang.t('shippingSlip')),
                      ),
                    ]
                  ],
                ),
              ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildBankInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: RichText(
        text: TextSpan(
          style: const TextStyle(fontSize: 11, color: Color(0xFF475569)),
          children: [
            TextSpan(text: '$label: ', style: const TextStyle(fontWeight: FontWeight.bold)),
            TextSpan(text: value),
          ],
        ),
      ),
    );
  }

  Widget _buildAddressField(String label, String value, {bool isHighlight = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              fontSize: isHighlight ? 14 : 12,
              fontWeight: isHighlight ? FontWeight.bold : FontWeight.w500,
              color: isHighlight ? Colors.pink[700] : const Color(0xFF1E293B),
            ),
          ),
        ],
      ),
    );
  }
}
