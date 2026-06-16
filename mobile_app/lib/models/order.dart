import 'product.dart';

class OrderItem {
  final String id;
  final String productId;
  final int quantity;
  final double price;
  final Product? product;

  OrderItem({
    required this.id,
    required this.productId,
    required this.quantity,
    required this.price,
    this.product,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] ?? '',
      productId: json['productId'] ?? '',
      quantity: json['quantity'] ?? 0,
      price: (json['price'] ?? 0).toDouble(),
      product: json['product'] != null ? Product.fromJson(json['product']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'quantity': quantity,
      'price': price,
      'product': product?.toJson(),
    };
  }
}

class Order {
  final String id;
  final String orderNumber;
  final double totalAmount;
  final String status; // 'PENDING_PAYMENT' | 'AWAITING_VERIFICATION' | 'PAID' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED'
  final String paymentMethod; // 'STRIPE' | 'PAYPAL' | 'QR_CODE'
  final String paymentStatus; // 'PENDING' | 'PAID' | 'FAILED'
  final String shippingAddress;
  final String? trackingNumber;
  final String? slipUrl;
  final String? shippingSlipUrl;
  final DateTime createdAt;
  final List<OrderItem> orderItems;

  Order({
    required this.id,
    required this.orderNumber,
    required this.totalAmount,
    required this.status,
    required this.paymentMethod,
    required this.paymentStatus,
    required this.shippingAddress,
    this.trackingNumber,
    this.slipUrl,
    this.shippingSlipUrl,
    required this.createdAt,
    required this.orderItems,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    var itemsFromJson = json['orderItems'] as List?;
    List<OrderItem> items = itemsFromJson != null
        ? itemsFromJson.map((item) => OrderItem.fromJson(item)).toList()
        : [];

    return Order(
      id: json['id'] ?? '',
      orderNumber: json['orderNumber'] ?? '',
      totalAmount: (json['totalAmount'] ?? 0).toDouble(),
      status: json['status'] ?? 'PENDING_PAYMENT',
      paymentMethod: json['paymentMethod'] ?? 'QR_CODE',
      paymentStatus: json['paymentStatus'] ?? 'PENDING',
      shippingAddress: json['shippingAddress'] ?? '',
      trackingNumber: json['trackingNumber'],
      slipUrl: json['slipUrl'],
      shippingSlipUrl: json['shippingSlipUrl'],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      orderItems: items,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'orderNumber': orderNumber,
      'totalAmount': totalAmount,
      'status': status,
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
      'shippingAddress': shippingAddress,
      'trackingNumber': trackingNumber,
      'slipUrl': slipUrl,
      'shippingSlipUrl': shippingSlipUrl,
      'createdAt': createdAt.toIso8601String(),
      'orderItems': orderItems.map((e) => e.toJson()).toList(),
    };
  }

  // Get shipping details parsed
  String get shipName {
    final parts = shippingAddress.split(' | ');
    return parts.isNotEmpty ? parts[0] : '';
  }

  String get shipPhone {
    final parts = shippingAddress.split(' | ');
    if (parts.length > 1) {
      return parts[1].replaceAll('Tel: ', '');
    }
    return '';
  }

  String get shipAddressOnly {
    final parts = shippingAddress.split(' | ');
    if (parts.length > 2) {
      return parts[2].replaceAll('Address: ', '');
    }
    return shippingAddress;
  }

  // Translations for Order Status
  String getStatusLabel(String language) {
    switch (status) {
      case 'PENDING_PAYMENT':
        return language == 'LA' ? 'ລໍຖ້າຊຳລະເງິນ' : language == 'TH' ? 'รอชำระเงิน' : 'Pending Payment';
      case 'AWAITING_VERIFICATION':
        return language == 'LA' ? 'ກຳລັງກວດສອບສະລິບ' : language == 'TH' ? 'รอตรวจสอบสลิป' : 'Verifying Slip';
      case 'PAID':
        return language == 'LA' ? 'ຊຳລະເງິນແລ້ວ' : language == 'TH' ? 'ชำระเงินแล้ว' : 'Paid';
      case 'PREPARING':
        return language == 'LA' ? 'ກຳລັງກຽມຈັດສົ່ງ' : language == 'TH' ? 'กำลังเตรียมจัดส่ง' : 'Preparing';
      case 'SHIPPING':
        return language == 'LA' ? 'ກຳລັງຈັດສົ່ງ' : language == 'TH' ? 'กำลังจัดส่ง' : 'Shipped';
      case 'DELIVERED':
        return language == 'LA' ? 'ຈັດສົ່ງສຳເລັດ' : language == 'TH' ? 'จัดส่งสำเร็จ' : 'Delivered';
      case 'CANCELLED':
        return language == 'LA' ? 'ຍົກເລີກແລ້ວ' : language == 'TH' ? 'ยกเลิกแล้ว' : 'Cancelled';
      default:
        return status;
    }
  }
}
