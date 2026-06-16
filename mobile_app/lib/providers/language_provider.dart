import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageProvider with ChangeNotifier {
  String _language = 'EN'; // 'EN' | 'TH' | 'LA'

  String get language => _language;

  LanguageProvider() {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    _language = prefs.getString('language') ?? 'EN';
    notifyListeners();
  }

  Future<void> setLanguage(String lang) async {
    _language = lang;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', lang);
    notifyListeners();
  }

  // Translate dynamic object strings
  String tObj(String en, String th, String la) {
    switch (_language) {
      case 'TH':
        return th.isNotEmpty ? th : en;
      case 'LA':
        return la.isNotEmpty ? la : en;
      default:
        return en;
    }
  }

  // Translation lookups for core UI strings
  String translate(String key) {
    if (_translations[_language] != null && _translations[_language]![key] != null) {
      return _translations[_language]![key]!;
    }
    return _translations['EN']?[key] ?? key;
  }

  // Simplified syntax helper
  String t(String key) => translate(key);

  static final Map<String, Map<String, String>> _translations = {
    'EN': {
      'welcome': 'Welcome to Pattie Play Shop',
      'loginTitle': 'Sign In',
      'loginSub': 'Enter your credentials to start shopping',
      'emailLabel': 'Email Address',
      'passwordLabel': 'Password',
      'signInButton': 'Sign In',
      'navRegister': 'Don\'t have an account? Register',
      'navLogin': 'Already have an account? Login',
      'registerTitle': 'Create an Account',
      'alreadyHaveAccount': 'Already have an account?',
      'dontHaveAccount': 'Don\'t have an account?',
      'googleMockLogin': 'Google Login (Mock Mode)',
      'googleMockRegister': 'Google Register (Mock Mode)',
      'inStock': 'In Stock',
      'outOfStock': 'Out of Stock',
      'quantity': 'Quantity',
      'addToCart': 'Add to Cart',
      'addedToCart': 'Added to Cart!',
      'description': 'Description',
      'total': 'Total',
      'checkout': 'Proceed to Checkout',
      'shippingAddress': 'Shipping Address',
      'recipientName': 'Recipient Name',
      'phoneNumber': 'Phone Number',
      'address': 'Address',
      'paymentMethod': 'Payment Method',
      'placeOrder': 'Place Order',
      'ordersHistory': 'Orders History',
      'noOrders': 'No orders found',
      'trackOrder': 'Track Order',
      'printInvoice': 'Invoice / Print',
      'shippingSlip': 'Courier Shipping Slip',
      'uploadSlip': 'Upload Payment Slip',
      'slipSuccess': 'Slip uploaded successfully! Waiting for admin validation.',
      'payQrCode': 'PAY VIA QR CODE',
      'scanQrToPay': 'Scan QR Code to Pay',
      'amountToTransfer': 'Amount to Transfer',
      'copy': 'Copy',
      'copied': 'Copied!',
      'bankName': 'Bank Name',
      'accountName': 'Account Name',
      'accountNumber': 'Account Number',
      'cancelOrder': 'Cancel Order',
      'logout': 'Sign Out',
      'totalSpent': 'Total Spent',
      'writeReview': 'Write Review',
      'starRating': 'Rating',
      'reviewComment': 'Review Comment',
      'submit': 'Submit',
      'cancel': 'Cancel',
      'fillAllFields': 'Please fill all required fields',
      'reviewSuccess': 'Review submitted successfully!',
      'orderDate': 'Order Date',
      'paymentStatus': 'Payment Status',
      'shipmentStatus': 'Shipment Status',
      'selectImage': 'Select Payment Slip Image',
    },
    'TH': {
      'welcome': 'ยินดีต้อนรับสู่ Pattie Play Shop',
      'loginTitle': 'เข้าสู่ระบบ',
      'loginSub': 'กรอกข้อมูลการเข้าสู่ระบบเพื่อเริ่มต้นช็อปปิ้ง',
      'emailLabel': 'ที่อยู่อีเมล',
      'passwordLabel': 'รหัสผ่าน',
      'signInButton': 'เข้าสู่ระบบ',
      'navRegister': 'ยังไม่มีบัญชี? สมัครสมาชิก',
      'navLogin': 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ',
      'registerTitle': 'สมัครสมาชิกใหม่',
      'alreadyHaveAccount': 'มีบัญชีผู้ใช้อยู่แล้ว?',
      'dontHaveAccount': 'ยังไม่มีบัญชีผู้ใช้?',
      'googleMockLogin': 'เข้าสู่ระบบ Google (โหมดจำลอง)',
      'googleMockRegister': 'ลงทะเบียน Google (โหมดจำลอง)',
      'inStock': 'มีสินค้า',
      'outOfStock': 'สินค้าหมด',
      'quantity': 'จำนวน',
      'addToCart': 'ใส่ตะกร้า',
      'addedToCart': 'เพิ่มในตะกร้าแล้ว!',
      'description': 'รายละเอียดสินค้า',
      'total': 'ยอดรวม',
      'checkout': 'ดำเนินการชำระเงิน',
      'shippingAddress': 'ที่อยู่จัดส่ง',
      'recipientName': 'ชื่อผู้รับ',
      'phoneNumber': 'เบอร์โทรศัพท์',
      'address': 'ที่อยู่',
      'paymentMethod': 'วิธีการชำระเงิน',
      'placeOrder': 'สั่งซื้อสินค้า',
      'ordersHistory': 'ประวัติการสั่งซื้อ',
      'noOrders': 'ไม่พบประวัติการสั่งซื้อ',
      'trackOrder': 'ติดตามสถานะจัดส่ง',
      'printInvoice': 'พิมพ์ใบเสร็จ',
      'shippingSlip': 'ใบปะหน้าพัสดุ',
      'uploadSlip': 'อัปโหลดสลิปโอนเงิน',
      'slipSuccess': 'อัปโหลดสลิปสำเร็จ! รอการตรวจสอบจากแอดมิน',
      'payQrCode': 'ชำระเงินผ่าน QR CODE',
      'scanQrToPay': 'สแกน QR Code เพื่อชำระเงิน',
      'amountToTransfer': 'ยอดเงินที่ต้องโอน',
      'copy': 'คัดลอก',
      'copied': 'คัดลอกแล้ว!',
      'bankName': 'ธนาคาร',
      'accountName': 'ชื่อบัญชี',
      'accountNumber': 'เลขที่บัญชี',
      'cancelOrder': 'ยกเลิกคำสั่งซื้อ',
      'logout': 'ออกจากระบบ',
      'totalSpent': 'ยอดรวมที่ใช้จ่าย',
      'writeReview': 'เขียนรีวิวสินค้า',
      'starRating': 'ให้คะแนนสินค้า',
      'reviewComment': 'ความคิดเห็น',
      'submit': 'ส่งรีวิว',
      'cancel': 'ยกเลิก',
      'fillAllFields': 'กรุณากรอกข้อมูลให้ครบถ้วน',
      'reviewSuccess': 'ส่งรีวิวสินค้าสำเร็จ!',
      'orderDate': 'วันที่สั่งซื้อ',
      'paymentStatus': 'สถานะชำระเงิน',
      'shipmentStatus': 'สถานะการจัดส่ง',
      'selectImage': 'เลือกรูปภาพสลิปโอนเงิน',
    },
    'LA': {
      'welcome': 'ຍິນດີຕ້ອນຮັບສູ່ Pattie Play Shop',
      'loginTitle': 'ເຂົ້າສູ່ລະບົບ',
      'loginSub': 'ປ້ອນຂໍ້ມູນການເຂົ້າສູ່ລະບົບເພື່ອເລີ່ມຕົ້ນການຊື້ເຄື່ອງ',
      'emailLabel': 'ທີ່ຢູອີເມລ',
      'passwordLabel': 'ລະຫັດຜ່ານ',
      'signInButton': 'ເຂົ້າສູ່ລະບົບ',
      'navRegister': 'ຍັງບໍ່ມີບັນຊີ? ສະໝັກສະມາຊິກ',
      'navLogin': 'ມີບັນຊີຢູ່ແລ້ວ? ເຂົ້າສູ່ລະບົບ',
      'registerTitle': 'ສະໝັກສະມາຊິກໃໝ່',
      'alreadyHaveAccount': 'ມີບັນຊີຜູ້ໃຊ້ຢູ່ແລ້ວ?',
      'dontHaveAccount': 'ຍັງບໍ່ມີບັນຊີຜູ້ໃຊ້?',
      'googleMockLogin': 'ເຂົ້າສູ່ລະບົບ Google (ໂຫມດຈໍາລອງ)',
      'googleMockRegister': 'ລົງທະບຽນ Google (ໂຫມດຈໍາລອງ)',
      'inStock': 'ມີສິນຄ້າ',
      'outOfStock': 'ສິນຄ້າໝົດ',
      'quantity': 'ຈຳນວນ',
      'addToCart': 'ໃສ່ກະຕ່າ',
      'addedToCart': 'ເພີ່ມໃນກະຕ່າແລ້ວ!',
      'description': 'ລາຍລະອຽດສິນຄ້າ',
      'total': 'ຍອດລວມ',
      'checkout': 'ດຳເນີນການຊຳລະເງິນ',
      'shippingAddress': 'ທີ່ຢູ່ຈັດສົ່ງ',
      'recipientName': 'ຊື່ຜູ້ຮັບ',
      'phoneNumber': 'ເບີໂທລະສັບ',
      'address': 'ທີ່ຢູ່',
      'paymentMethod': 'ວິທີການຊຳລະເງິນ',
      'placeOrder': 'ສັ່ງຊື້ສິນຄ້າ',
      'ordersHistory': 'ປະຫວັດການສັ່ງຊື້',
      'noOrders': 'ບໍ່ພົບປະຫວັດການສັ່ງຊື້',
      'trackOrder': 'ຕິດຕາມສະຖານະຈັດສົ່ງ',
      'printInvoice': 'ພິມໃບບິນ',
      'shippingSlip': 'ໃບປະໜ້າພັດສະດຸ',
      'uploadSlip': 'ອັບໂຫລດສະລິບໂອນເງິນ',
      'slipSuccess': 'ອັບໂຫລດສະລິບສຳເລັດ! ລໍຖ້າການກວດສອບຈາກແອດມິນ',
      'payQrCode': 'ຊຳລະເງິນຜ່ານ QR CODE',
      'scanQrToPay': 'ສະແກນ QR Code ເພື່ອຊຳລະເງິນ',
      'amountToTransfer': 'ຍອດເງິນທີ່ຕ້ອງໂອນ',
      'copy': 'ຄັດລອກ',
      'copied': 'ຄັດລອກແລ້ວ!',
      'bankName': 'ທະນາຄານ',
      'accountName': 'ຊື່ບັນຊີ',
      'accountNumber': 'ເລກບັນຊີ',
      'cancelOrder': 'ຍົກເລີກຄຳສັ່ງຊື້',
      'logout': 'ອອກຈາກລະບົບ',
      'totalSpent': 'ຍອດລວມທີ່ໃຊ້ຈ່າຍ',
      'writeReview': 'ຂຽນຣີວິວສິນຄ້າ',
      'starRating': 'ໃຫ້ຄະແນນສິນຄ້າ',
      'reviewComment': 'ຄວາມຄິດເຫັນ',
      'submit': 'ສົ່ງຣີວິວ',
      'cancel': 'ຍົກເລີກ',
      'fillAllFields': 'ກະລຸນາປ້ອນຂໍ້ມູນໃຫ້ຄົບຖ້ວນ',
      'reviewSuccess': 'ສົ່ງຣີວິວສິນຄ້າສຳເລັດ!',
      'orderDate': 'ວັນທີສັ່ງຊື້',
      'paymentStatus': 'ສະຖານະຊຳລະເງິນ',
      'shipmentStatus': 'ສະຖານະການຈັດສົ່ງ',
      'selectImage': 'ເລືອກຮູບພາບສະລິບໂອນເງິນ',
    }
  };
}
