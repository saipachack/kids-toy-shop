'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'EN' | 'TH' | 'LA';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
  tObj: (enVal: string | null | undefined, thVal: string | null | undefined, laVal?: string | null | undefined) => string;
}

const translations = {
  EN: {
    // Navigation
    navHome: 'Home',
    navProducts: 'Toys Catalog',
    navCart: 'Cart',
    navProfile: 'Profile',
    navAdmin: 'Admin Panel',
    navLogin: 'Sign In',
    navRegister: 'Register',
    navLogout: 'Sign Out',

    // Authentication
    loginTitle: 'Welcome Back!',
    loginSub: 'Sign in to access your toy account and orders',
    registerTitle: 'Create an Account',
    registerSub: 'Join us to buy the best toys for your kids',
    forgotPasswordTitle: 'Forgot Password',
    forgotPasswordSub: 'Enter your email to receive a reset link',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    nameLabel: 'Full Name',
    phoneLabel: 'Phone Number',
    addressLabel: 'Shipping Address',
    forgotPasswordLink: 'Forgot password?',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    signUpButton: 'Sign Up',
    signInButton: 'Sign In',
    sendResetLink: 'Send Reset Link',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    otpLabel: 'OTP Verification Code',
    otpPlaceholder: 'Enter 6-digit code',
    otpVerified: 'Verified ✓',
    resendOtp: 'Resend in',
    pleaseVerifyPhone: 'Please verify phone number first',
    phonePlaceholder: 'Mobile number (8 digits)',

    // Catalog & Detail
    searchPlaceholder: 'Search for toys...',
    allCategories: 'All Categories',
    categoriesHeader: 'Toy Categories',
    sortBy: 'Sort by',
    sortNewest: 'Newest Arrivals',
    sortPriceAsc: 'Price: Low to High',
    sortPriceDesc: 'Price: High to Low',
    bestSellers: 'Best Sellers 🔥',
    newArrivals: 'New Arrivals ✨',
    outOfStock: 'Out of Stock 😢',
    inStock: 'In Stock',
    addToCart: 'Add to Cart 🛒',
    addedToCart: 'Added!',
    price: 'Price',
    quantity: 'Quantity',
    description: 'Description',
    reviews: 'Reviews',
    ratings: 'Ratings',

    // Cart & Checkout
    cartTitle: 'Shopping Cart',
    cartEmpty: "Your cart is empty. Let's explore some toys!",
    cartSummary: 'Order Summary',
    subtotal: 'Subtotal',
    shipping: 'Shipping Fee',
    free: 'Free',
    total: 'Total',
    checkoutButton: 'Proceed to Checkout',
    checkoutTitle: 'Checkout Securely',
    shippingDetails: 'Delivery Details',
    paymentMethod: 'Payment Method',
    placeOrder: 'Place Order',
    confirmPayment: 'Confirm Payment',

    // Payments
    payWithStripe: 'Pay securely with Visa / Mastercard (Stripe)',
    payWithPaypal: 'Pay with PayPal Wallet',
    payWithQR: 'QR Code / Bank Transfer',
    qrInstructions: 'Scan the QR code or transfer to the account below, then upload your payment slip receipt.',
    accountName: 'Account Name',
    accountNumber: 'Account Number',
    bank: 'Bank',
    uploadSlip: 'Upload Payment Slip',
    slipSuccess: 'Slip uploaded successfully! Awaiting verification.',

    // Orders & Tracking
    orderHistory: 'My Order History',
    orderNumber: 'Order Number',
    orderDate: 'Date',
    orderStatus: 'Order Status',
    paymentStatus: 'Payment Status',
    trackingNumber: 'Tracking Number',
    viewDetails: 'View Details',
    orderSummary: 'Order Summary',
    trackOrder: 'Track Order',
    printInvoice: 'Print Receipt / Invoice',
    noOrders: 'No orders found',

    // Statuses
    PENDING_PAYMENT: 'Waiting Payment',
    AWAITING_VERIFICATION: 'Verifying Payment',
    PAID: 'Paid',
    PREPARING: 'Preparing Items',
    SHIPPING: 'Shipping out',
    DELIVERED: 'Delivered successfully',
    CANCELLED: 'Cancelled',
    shippingSlip: 'Courier Shipping Slip',
    uploadShippingSlip: 'Upload Shipping Slip',

    // Notifications
    notificationsTitle: 'Notifications',
    noNotifications: 'No new notifications',

    // Admin Dashboard
    adminTitle: 'Pattie Play Shop Admin Control',
    adminSalesToday: "Today's Sales",
    adminSalesMonth: 'This Month Sales',
    adminTotalOrders: 'Total Orders',
    adminCustomers: 'Total Customers',
    lowStockAlerts: 'Low Stock Alerts ⚠️',
    bestSellersList: 'Best Selling Toys',
    adminProductsHeader: 'Manage Products',
    adminOrdersHeader: 'Manage Orders',
    addProductBtn: 'Add New Toy',
    editProductBtn: 'Edit Toy',
    deleteProductConfirm: 'Are you sure you want to delete this product?',
    saveBtn: 'Save',
    cancelBtn: 'Cancel',
    productNameEn: 'Product Name (EN)',
    productNameTh: 'Product Name (TH)',
    productNameLa: 'Product Name (LA)',
    descEn: 'Description (EN)',
    descTh: 'Description (TH)',
    descLa: 'Description (LA)',
    priceLabel: 'Price (LAK)',
    stockLabel: 'Stock Quantity',
    imagesLabel: 'Image URLs (one URL per line)',
    selectCategory: 'Select Category',
    updateStatusBtn: 'Update Status',
  },
  TH: {
    // Navigation
    navHome: 'หน้าแรก',
    navProducts: 'แค็ตตาล็อกของเล่น',
    navCart: 'ตะกร้าสินค้า',
    navProfile: 'ข้อมูลส่วนตัว',
    navAdmin: 'ระบบหลังบ้าน',
    navLogin: 'เข้าสู่ระบบ',
    navRegister: 'สมัครสมาชิก',
    navLogout: 'ออกจากระบบ',

    // Authentication
    loginTitle: 'ยินดีต้อนรับกลับมา!',
    loginSub: 'เข้าสู่ระบบเพื่อเข้าถึงข้อมูลของเล่นและคำสั่งซื้อของคุณ',
    registerTitle: 'สมัครสมาชิกใหม่',
    registerSub: 'เข้าร่วมกับเราเพื่อซื้อของเล่นที่ดีที่สุดสำหรับลูกๆ ของคุณ',
    forgotPasswordTitle: 'ลืมรหัสผ่าน',
    forgotPasswordSub: 'กรอกอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน',
    emailLabel: 'ที่อยู่อีเมล',
    passwordLabel: 'รหัสผ่าน',
    nameLabel: 'ชื่อ-นามสกุล',
    phoneLabel: 'เบอร์โทรศัพท์',
    addressLabel: 'ที่อยู่ในการจัดส่ง',
    forgotPasswordLink: 'ลืมรหัสผ่านใช่ไหม?',
    dontHaveAccount: 'ยังไม่มีบัญชีผู้ใช้?',
    alreadyHaveAccount: 'มีบัญชีผู้ใช้แล้ว?',
    signUpButton: 'สมัครสมาชิก',
    signInButton: 'เข้าสู่ระบบ',
    sendResetLink: 'ส่งลิงก์รีเซ็ตรหัสผ่าน',
    sendOtp: 'ส่ง OTP',
    verifyOtp: 'ยืนยัน OTP',
    otpLabel: 'รหัสยืนยัน OTP',
    otpPlaceholder: 'กรอกรหัส 6 หลัก',
    otpVerified: 'ยืนยันสำเร็จ ✓',
    resendOtp: 'ส่งอีกครั้งใน',
    pleaseVerifyPhone: 'กรุณายืนยันเบอร์มือถือก่อนสมัครสมาชิก',
    phonePlaceholder: 'เบอร์มือถือ 8 หลัก',

    // Catalog & Detail
    searchPlaceholder: 'ค้นหาของเล่นเด็ก...',
    allCategories: 'หมวดหมู่ทั้งหมด',
    categoriesHeader: 'หมวดหมู่ของเล่น',
    sortBy: 'จัดเรียงตาม',
    sortNewest: 'สินค้ามาใหม่ล่าสุด',
    sortPriceAsc: 'ราคา: ต่ำสุด - สูงสุด',
    sortPriceDesc: 'ราคา: สูงสุด - ต่ำสุด',
    bestSellers: 'สินค้าขายดี 🔥',
    newArrivals: 'ของเล่นมาใหม่ ✨',
    outOfStock: 'สินค้าหมด 😢',
    inStock: 'มีสินค้าในสต็อก',
    addToCart: 'เพิ่มลงตะกร้า 🛒',
    addedToCart: 'เพิ่มแล้ว!',
    price: 'ราคา',
    quantity: 'จำนวน',
    description: 'รายละเอียดสินค้า',
    reviews: 'รีวิว',
    ratings: 'คะแนนรีวิว',

    // Cart & Checkout
    cartTitle: 'ตะกร้าสินค้าของคุณ',
    cartEmpty: 'ไม่มีสินค้าในตะกร้า เริ่มเลือกช้อปของเล่นกันเลย!',
    cartSummary: 'สรุปการสั่งซื้อ',
    subtotal: 'ยอดรวมสินค้า',
    shipping: 'ค่าจัดส่ง',
    free: 'ฟรี',
    total: 'ยอดชำระสุทธิ',
    checkoutButton: 'ดำเนินการชำระเงิน',
    checkoutTitle: 'ชำระเงินอย่างปลอดภัย',
    shippingDetails: 'ที่อยู่จัดส่งสินค้า',
    paymentMethod: 'วิธีการชำระเงิน',
    placeOrder: 'ยืนยันสั่งซื้อสินค้า',
    confirmPayment: 'ยืนยันการชำระเงิน',

    // Payments
    payWithStripe: 'ชำระผ่านบัตรเครดิต/เดบิต (Stripe)',
    payWithPaypal: 'ชำระผ่านระบบ PayPal',
    payWithQR: 'สแกน QR Code / โอนเงินผ่านธนาคาร',
    qrInstructions: 'สแกน QR code หรือโอนเงินไปยังบัญชีด้านล่าง จากนั้นอัปโหลดภาพสลิปใบเสร็จเพื่อยืนยันยอดเงิน',
    accountName: 'ชื่อบัญชี',
    accountNumber: 'เลขที่บัญชี',
    bank: 'ธนาคาร',
    uploadSlip: 'อัปโหลดสลิปหลักฐานการโอนเงิน',
    slipSuccess: 'อัปโหลดสลิปสำเร็จ! กำลังรอระบบตรวจสอบความถูกต้อง',

    // Orders & Tracking
    orderHistory: 'ประวัติการสั่งซื้อของฉัน',
    orderNumber: 'หมายเลขคำสั่งซื้อ',
    orderDate: 'วันที่สั่งซื้อ',
    orderStatus: 'สถานะสั่งซื้อ',
    paymentStatus: 'สถานะชำระเงิน',
    trackingNumber: 'เลขติดตามพัสดุ',
    viewDetails: 'ดูรายละเอียด',
    orderSummary: 'สรุปคำสั่งซื้อ',
    trackOrder: 'ติดตามสถานะพัสดุ',
    printInvoice: 'พิมพ์ใบเสร็จ / ใบแจ้งหนี้',
    noOrders: 'ไม่พบรายการคำสั่งซื้อ',

    // Statuses
    PENDING_PAYMENT: 'รอชำระเงิน',
    AWAITING_VERIFICATION: 'กำลังตรวจสอบยอดเงิน',
    PAID: 'ชำระเงินแล้ว',
    PREPARING: 'กำลังจัดเตรียมสินค้า',
    SHIPPING: 'กำลังจัดส่งพัสดุ',
    DELIVERED: 'จัดส่งพัสดุสำเร็จ',
    CANCELLED: 'ยกเลิกคำสั่งซื้อ',
    shippingSlip: 'หลักฐานสลิปขนส่ง',
    uploadShippingSlip: 'อัปโหลดสลิปขนส่ง',

    // Notifications
    notificationsTitle: 'การแจ้งเตือน',
    noNotifications: 'ไม่มีการแจ้งเตือนใหม่',

    // Admin Dashboard
    adminTitle: 'ระบบผู้ดูแลระบบ Pattie Play Shop',
    adminSalesToday: 'ยอดขายวันนี้',
    adminSalesMonth: 'ยอดขายเดือนนี้',
    adminTotalOrders: 'จำนวนคำสั่งซื้อรวม',
    adminCustomers: 'จำนวนลูกค้าทั้งหมด',
    lowStockAlerts: 'สินค้าใกล้หมดสต็อก ⚠️',
    bestSellersList: 'ของเล่นขายดีที่สุด',
    adminProductsHeader: 'จัดการคลังสินค้า',
    adminOrdersHeader: 'จัดการคำสั่งซื้อลูกค้า',
    addProductBtn: 'เพิ่มสินค้าของเล่นใหม่',
    editProductBtn: 'แก้ไขรายละเอียดสินค้า',
    deleteProductConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?',
    saveBtn: 'บันทึก',
    cancelBtn: 'ยกเลิก',
    productNameEn: 'ชื่อสินค้า (ภาษาอังกฤษ)',
    productNameTh: 'ชื่อสินค้า (ภาษาไทย)',
    productNameLa: 'ชื่อสินค้า (ภาษาลาว)',
    descEn: 'รายละเอียดสินค้า (อังกฤษ)',
    descTh: 'รายละเอียดสินค้า (ไทย)',
    descLa: 'รายละเอียดสินค้า (ลาว)',
    priceLabel: 'ราคา (กีบ)',
    stockLabel: 'จำนวนในสต็อก',
    imagesLabel: 'ที่อยู่รูปภาพ (หนึ่งลิงก์ต่อบรรทัด)',
    selectCategory: 'เลือกหมวดหมู่สินค้า',
    updateStatusBtn: 'อัปเดตสถานะ',
  },
  LA: {
    // Navigation
    navHome: 'ໜ້າຫຼັກ',
    navProducts: 'ແຄັດຕາລັອກຂອງຫຼິ້ນ',
    navCart: 'ກະຕ່າສິນຄ້າ',
    navProfile: 'ຂໍ້ມູນສ່ວນຕົວ',
    navAdmin: 'ລະບົບຫຼັງບ້ານ',
    navLogin: 'ເຂົ້າສູ່ລະບົບ',
    navRegister: 'ສະໝັກສະມາຊິກ',
    navLogout: 'ອອກຈາກລະບົບ',

    // Authentication
    loginTitle: 'ຍິນດີຕ້ອນຮັບກັບຄືນ!',
    loginSub: 'ເຂົ້າສູ່ລະບົບເພື່ອເຂົ້າເຖິງຂໍ້ມູນຂອງຫຼິ້ນ ແລະ ຄຳສັ່ງຊື້ຂອງທ່ານ',
    registerTitle: 'ສະໝັກສະມາຊິກໃໝ່',
    registerSub: 'ເຂົ້າຮ່ວມກັບພວກເຮົາເພື່ອຊື້ຂອງຫຼິ້ນທີ່ດີທີ່ສຸດສຳລັບລູກໆຂອງທ່ານ',
    forgotPasswordTitle: 'ລືມລະຫັດຜ່ານ',
    forgotPasswordSub: 'ກະລຸນາປ້ອນອີເມວຂອງທ່ານເພື່ອຮັບລິ້ງຣີເຊັດລະຫັດຜ່ານ',
    emailLabel: 'ທີ່ຢູ່ອີເມວ',
    passwordLabel: 'ລະຫັດຜ່ານ',
    nameLabel: 'ຊື່ ແລະ ນາມສະກຸນ',
    phoneLabel: 'ເບີໂທລະສັບ',
    addressLabel: 'ທີ່ຢູ່ຈັດສົ່ງສິນຄ້າ',
    forgotPasswordLink: 'ລືມລະຫັດຜ່ານແມ່ນບໍ?',
    dontHaveAccount: 'ຍັງບໍ່ມີບັນຊີຜູ້ໃຊ້?',
    alreadyHaveAccount: 'ມີບັນຊີຜູ້ໃຊ້ແລ້ວ?',
    signUpButton: 'ສະໝັກສະມາຊິກ',
    signInButton: 'ເຂົ້າສູ່ລະບົບ',
    sendResetLink: 'ສົ່ງລິ້ງຣີເຊັດລະຫັດຜ່ານ',
    sendOtp: 'ສົ່ງ OTP',
    verifyOtp: 'ຢືນຢັນ OTP',
    otpLabel: 'ລະຫັດຢືນຢັນ OTP',
    otpPlaceholder: 'ປ້ອນລະຫັດ 6 ຫຼັກ',
    otpVerified: 'ຢືນຢັນສຳເລັດ ✓',
    resendOtp: 'ສົ່ງອີກຄັ້ງໃນ',
    pleaseVerifyPhone: 'ກະລຸນາຢືນຢັນເບີໂທລະສັບກ່ອນສະໝັກສະມາຊິກ',
    phonePlaceholder: 'ເບີໂທລະສັບ 8 ຫຼັກ',

    // Catalog & Detail
    searchPlaceholder: 'ຄົ້ນຫາຂອງຫຼິ້ນເດັກ...',
    allCategories: 'ທຸກໝວດໝູ່',
    categoriesHeader: 'ໝວດໝູ່ຂອງຫຼິ້ນ',
    sortBy: 'ຈັດລຽງຕາມ',
    sortNewest: 'ສິນຄ້າມາໃໝ່ຫຼ້າສຸດ',
    sortPriceAsc: 'ລາຄາ: ຕ່ຳສຸດ - ສູงสุด',
    sortPriceDesc: 'ລາຄາ: ສູງສຸດ - ຕ່ຳສຸດ',
    bestSellers: 'ສິນຄ້າຂາຍດີ 🔥',
    newArrivals: 'ຂອງຫຼິ້ນມາໃໝ່ ✨',
    outOfStock: 'ສິນຄ້າໝົດ 😢',
    inStock: 'ມີສິນຄ້າໃນສະຕັອກ',
    addToCart: 'ເພີ່ມໃສ່ກະຕ່າ 🛒',
    addedToCart: 'ເພີ່ມແລ້ວ!',
    price: 'ລາຄາ',
    quantity: 'ຈຳນວນ',
    description: 'ລາຍລະອຽດສິນຄ້າ',
    reviews: 'ຣີວິວ',
    ratings: 'ຄະແນນຣີວິວ',

    // Cart & Checkout
    cartTitle: 'ກະຕ່າສິນຄ້າຂອງທ່ານ',
    cartEmpty: 'ບໍ່ມີສິນຄ້າໃນກະຕ່າ ເລີ່ມເລືອກຊື້ຂອງຫຼิ້ນກັນເລີຍ!',
    cartSummary: 'ສະຫຼຸບການສັ່ງຊື້',
    subtotal: 'ຍອດລວມສິນຄ້າ',
    shipping: 'ຄ່າຈັດສົ່ງ',
    free: 'ຟຣີ',
    total: 'ຍອດຊຳລະສຸດທິ',
    checkoutButton: 'ດຳເນີນການຊຳລະເງິນ',
    checkoutTitle: 'ຊຳລະເງິນຢ່າງປອດໄພ',
    shippingDetails: 'ທີ່ຢູ່ຈັດສົ່ງສິນຄ້າ',
    paymentMethod: 'ວິທີການຊຳລະເງິນ',
    placeOrder: 'ຢືນຢັນການສັ່ງຊື້',
    confirmPayment: 'ຢືນຢັນການຊຳລະເງິນ',

    // Payments
    payWithStripe: 'ຊຳລະຜ່ານບັດເຄຣດິດ/ເດບິດ (Stripe)',
    payWithPaypal: 'ຊຳລະຜ່ານລະບົບ PayPal',
    payWithQR: 'ສະແກน QR Code / ໂອນເງິນຜ່ານທະນາຄານ',
    qrInstructions: 'ສະແກນ QR code ຫຼື ໂอนເງິນໄປຍັງບັນຊີດ້ານລຸ່ມ ຈາກນັ້ນອັບໂຫຼດຮູບສະລິບໃບບິນເພື່ອຢືນຢັນ',
    accountName: 'ຊື່ບັນຊີ',
    accountNumber: 'ເລກບັນຊີ',
    bank: 'ທະນາຄານ',
    uploadSlip: 'ອັບໂຫຼດສະລິບຫຼັກຖານການໂອນ',
    slipSuccess: 'ອັບໂຫຼດສະລິບສຳເລັດ! ກະລຸນາລໍຖ້າການກວດສອບ',

    // Orders & Tracking
    orderHistory: 'ປະຫວັດການສັ່ງຊື້ຂອງຂ້ອຍ',
    orderNumber: 'ໝາຍເລກຄຳສັ່ງຊື້',
    orderDate: 'ວັນທີສັ່ງຊື້',
    orderStatus: 'ສະຖານະການສັ່ງຊື້',
    paymentStatus: 'ສະຖານະການຊຳລະເງິນ',
    trackingNumber: 'ເລກຕິດຕາມພັດສະດຸ',
    viewDetails: 'ເບິ່ງລາຍລະອຽດ',
    orderSummary: 'ສະຫຼຸບຄຳສັ່ງຊື້',
    trackOrder: 'ຕິດຕາມສະຖານະພັດສະດຸ',
    printInvoice: 'ພິມໃບເສร็จ / ໃບບິນ',
    noOrders: 'ບໍ່ພົບລາຍການສັ່ງຊື້',

    // Statuses
    PENDING_PAYMENT: 'ລໍຖ້າການຊຳລະເງິນ',
    AWAITING_VERIFICATION: 'ກຳລັງຢືນຢັນຍອດເງິນ',
    PAID: 'ຊຳລະເງິນແລ້ວ',
    PREPARING: 'ກຳລັງກຽມສິນຄ້າ',
    SHIPPING: 'ກຳລັງຈັດສົ່ງພັດສະດຸ',
    DELIVERED: 'ຈັດສົ່ງພັດສະດຸສຳເລັດ',
    CANCELLED: 'ຍົກເລີກຄຳສັ່ງຊື້',
    shippingSlip: 'ຫຼັກຖານສະລິບຂົນສົ່ງ',
    uploadShippingSlip: 'ອັບໂຫຼດສະລິບຂົນສົ່ງ',

    // Notifications
    notificationsTitle: 'ການແຈ້ງເຕືອນ',
    noNotifications: 'ບໍ່ມີການແຈ້ງເຕືອນໃໝ່',

    // Admin Dashboard
    adminTitle: 'ລະບົບຜູ້ດູແລລະບົບ Pattie Play Shop',
    adminSalesToday: 'ຍອດຂາຍມື້ນີ້',
    adminSalesMonth: 'ຍอตຂາຍເດືອນນີ້',
    adminTotalOrders: 'ຈຳນວນຄຳສັ່ງຊື້ລວມ',
    adminCustomers: 'ຈຳນວນລູກຄ້າທັງໝົດ',
    lowStockAlerts: 'ສິນຄ້າໃກ້ໝົດສະຕັອກ ⚠️',
    bestSellersList: 'ຂອງຫຼິ້ນຂາຍດີທີ່ສຸດ',
    adminProductsHeader: 'ຈັດການຄັງສິນຄ້າ',
    adminOrdersHeader: 'ຈັດການຄຳສັ່ງຊື້ລູกຄ້າ',
    addProductBtn: 'ເພີ່ມສินຄ້າຂອງຫຼິ້ນໃໝ່',
    editProductBtn: 'ແກ້ໄຂລາຍລະອຽດສິນຄ້າ',
    deleteProductConfirm: 'ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບສິນຄ້ານີ້?',
    saveBtn: 'ບັນທຶກ',
    cancelBtn: 'ຍົກເລີก',
    productNameEn: 'ຊື່ສິນຄ້າ (ພາສາອັງກິດ)',
    productNameTh: 'ຊື່ສິນຄ້າ (ພາສາໄທ)',
    productNameLa: 'ຊື່ສินຄ້າ (ພາສາລາວ)',
    descEn: 'ລາຍລະອຽດສິນຄ້າ (ອັງກິດ)',
    descTh: 'ລາຍລະອຽดສິນຄ້າ (ໄທ)',
    descLa: 'ລາຍລະອຽດສິນຄ້າ (ລາວ)',
    priceLabel: 'ລາຄາ (ກີບ)',
    stockLabel: 'ຈຳນວນໃນສະຕັອກ',
    imagesLabel: 'ທີ່ຢູ່ຮູບພາບ (ໜຶ່ງລິ້ງຕໍ່ແຖວ)',
    selectCategory: 'ເລືອກໝວດໝູ່ສິນຄ້າ',
    updateStatusBtn: 'ອັບເດດສະຖານະ',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('TH');

  useEffect(() => {
    const savedLang = localStorage.getItem('kids_shop_lang');
    if (savedLang === 'EN' || savedLang === 'TH' || savedLang === 'LA') {
      setLanguage(savedLang as Language);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('lang', language.toLowerCase());
    }
  }, [language]);

  const toggleLanguage = () => {
    const newLang = language === 'TH' ? 'EN' : language === 'EN' ? 'LA' : 'TH';
    setLanguage(newLang);
    localStorage.setItem('kids_shop_lang', newLang);
  };

  const t = (key: string): string => {
    const k = key as keyof typeof translations['EN'];
    return translations[language][k] || translations['EN'][k] || String(key);
  };

  const tObj = (
    enVal: string | null | undefined,
    thVal: string | null | undefined,
    laVal?: string | null | undefined
  ): string => {
    if (language === 'LA') {
      return laVal || enVal || thVal || '';
    }
    if (language === 'TH') {
      return thVal || enVal || laVal || '';
    }
    return enVal || thVal || laVal || '';
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, tObj }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
