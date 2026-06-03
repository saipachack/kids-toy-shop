import { PrismaClient } from '@prisma/client';

export class NotificationService {
  /**
   * Send notification to customer/admin and log simulated email/LINE alerts
   */
  static async sendStatusChange(
    prisma: PrismaClient,
    userId: string,
    orderNumber: string,
    status: string,
    trackingNumber?: string | null
  ) {
    let titleEn = '';
    let titleTh = '';
    let titleLa = '';
    let messageEn = '';
    let messageTh = '';
    let messageLa = '';

    switch (status) {
      case 'PENDING_PAYMENT':
        titleEn = 'Order Created - Awaiting Payment';
        titleTh = 'สร้างคำสั่งซื้อสำเร็จ - รอการชำระเงิน';
        titleLa = 'ສ້າງຄຳສັ່ງຊື້ສຳເລັດ - ລໍຖ້າການຊຳລະເງິນ';
        messageEn = `Your order #${orderNumber} is pending payment. Please proceed with payment.`;
        messageTh = `คำสั่งซื้อ #${orderNumber} กำลังรอชำระเงิน กรุณาดำเนินการชำระเงินผ่านระบบ`;
        messageLa = `ຄຳສັ່ງຊື້ #${orderNumber} ຂອງທ່ານກຳລັງລໍຖ້າການຊຳລະເງິນ. ກະລຸນາດຳເນີນການຊຳລະເງິນ.`;
        break;
      case 'AWAITING_VERIFICATION':
        titleEn = 'Payment Submitted - Verifying';
        titleTh = 'แจ้งชำระเงินแล้ว - กำลังตรวจสอบยอดเงิน';
        titleLa = 'ແຈ້ງຊຳລະເງິນແລ້ວ - ກຳລັງຢືນຢັນຍອດເງິນ';
        messageEn = `We have received your receipt for order #${orderNumber} and are verifying your payment.`;
        messageTh = `เราได้รับหลักฐานการชำระเงินสำหรับคำสั่งซื้อ #${orderNumber} แล้ว กำลังดำเนินการตรวจสอบความถูกต้อง`;
        messageLa = `ພວກເຮົາໄດ້ຮັບຫຼັກຖານການຊຳລະເງິນສຳລັບຄຳສັ່ງຊື້ #${orderNumber} ແລ້ວ. ກຳລັງດຳເນີນການກວດສອບຄວາມຖືກຕ້ອງ.`;
        break;
      case 'PAID':
        titleEn = 'Payment Received';
        titleTh = 'ชำระเงินสำเร็จ';
        titleLa = 'ຊຳລະເງິນສຳເລັດ';
        messageEn = `Thank you! We have received your payment for order #${orderNumber}.`;
        messageTh = `ขอบคุณค่ะ! เราได้รับยอดชำระเงินสำหรับคำสั่งซื้อ #${orderNumber} เรียบร้อยแล้ว`;
        messageLa = `ຂອບໃຈ! ພວກເຮົາໄດ້ຮັບການຊຳລະເງິນສຳລັບຄຳສັ່ງຊື້ #${orderNumber} ຮຽບຮ້ອຍແລ້ວ.`;
        break;
      case 'PREPARING':
        titleEn = 'Order is being prepared';
        titleTh = 'กำลังเตรียมสินค้า';
        titleLa = 'ກຳລັງກຽມສິນຄ້າ';
        messageEn = `We are preparing your items for order #${orderNumber}.`;
        messageTh = `เรากำลังเตรียมสินค้าสำหรับคำสั่งซื้อ #${orderNumber} ของคุณ`;
        messageLa = `ພວກເຮົາກຳລັງກຽມສິນຄ້າສຳລັບຄຳສັ່ງຊື້ #${orderNumber} ຂອງທ່ານ.`;
        break;
      case 'SHIPPING':
        titleEn = 'Order Shipped!';
        titleTh = 'จัดส่งสินค้าแล้ว!';
        titleLa = 'ຈັດສົ່ງສິນຄ້າແລ້ວ!';
        messageEn = `Your order #${orderNumber} has been shipped.${trackingNumber ? ` Tracking Number: ${trackingNumber}` : ''}`;
        messageTh = `คำสั่งซื้อ #${orderNumber} ของคุณจัดส่งแล้ว!${trackingNumber ? ` เลขติดตามพัสดุ: ${trackingNumber}` : ''}`;
        messageLa = `ຄຳສັ່ງຊື້ #${orderNumber} ຂອງທ່ານໄດ້ຮັບການຈັດສົ່ງແລ້ວ!${trackingNumber ? ` ເລກຕິດຕາມພັດສະດຸ: ${trackingNumber}` : ''}`;
        break;
      case 'DELIVERED':
        titleEn = 'Order Delivered';
        titleTh = 'จัดส่งสำเร็จ';
        titleLa = 'ຈັດສົ່ງສຳເລັດ';
        messageEn = `Your order #${orderNumber} has been successfully delivered. Thank you for shopping with us!`;
        messageTh = `คำสั่งซื้อ #${orderNumber} ของคุณจัดส่งสำเร็จแล้ว ขอบคุณที่ไว้วางใจร้านค้าของเรา!`;
        messageLa = `ຄຳສັ່ງຊື້ #${orderNumber} ຂອງທ່ານໄດ້ຮັບການຈັດສົ່ງສຳເລັດແລ້ວ. ຂອບໃຈທີ່ເລືອກຊື້ກັບພວກເຮົາ!`;
        break;
      case 'CANCELLED':
        titleEn = 'Order Cancelled';
        titleTh = 'ยกเลิกคำสั่งซื้อ';
        titleLa = 'ຍົກເລີກຄຳສັ່ງຊື້';
        messageEn = `Your order #${orderNumber} has been cancelled.`;
        messageTh = `คำสั่งซื้อ #${orderNumber} ของคุณถูกยกเลิกแล้ว`;
        messageLa = `ຄຳສັ່ງຊື້ #${orderNumber} ຂອງທ່ານຖືກຍົກເລີກແລ้ວ.`;
        break;
    }

    // Save in-app notification to DB
    try {
      const lastNotification = await prisma.notification.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (lastNotification && lastNotification.messageEn === messageEn) {
        console.log(`[NOTIFICATION SKIP] Duplicate notification skipped for user ${userId}: ${messageEn}`);
        return;
      }

      await prisma.notification.create({
        data: {
          userId,
          titleEn,
          titleTh,
          titleLa,
          messageEn,
          messageTh,
          messageLa,
        },
      });
    } catch (err) {
      console.error('Failed to save notification in DB:', err);
    }

    // Simulate Email and LINE Notifications
    console.log(`\n================= NOTIFICATION SIMULATOR =================`);
    console.log(`[EMAIL SENT TO USER] Order #${orderNumber} status changed to ${status}`);
    console.log(`Subject (EN): ${titleEn}`);
    console.log(`Subject (TH): ${titleTh}`);
    console.log(`Subject (LA): ${titleLa}`);
    console.log(`Body (EN): ${messageEn}`);
    console.log(`Body (TH): ${messageTh}`);
    console.log(`Body (LA): ${messageLa}`);
    console.log(`---------------------------------------------------------`);
    console.log(`[LINE OA ALERT] sent to User's Line Account:`);
    console.log(`🔔 ${titleLa}\n💬 ${messageLa}`);
    console.log(`==========================================================\n`);
  }

  static async notifyAdminNewOrder(prisma: PrismaClient, orderNumber: string, totalAmount: number) {
    // Notify all admin users
    try {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            titleEn: 'New Order Received',
            titleTh: 'มีรายการสั่งซื้อใหม่',
            titleLa: 'ມີລາຍການສັ່ງຊື້ໃໝ່',
            messageEn: `Order #${orderNumber} has been placed. Total: LAK ${totalAmount.toLocaleString()}`,
            messageTh: `มีการสั่งซื้อใหม่ #${orderNumber} ยอดรวม: ${totalAmount.toLocaleString()} กีบ`,
            messageLa: `ມີການສັ່ງຊື້ໃໝ່ #${orderNumber} ຍອດລວມ: ${totalAmount.toLocaleString()} ກີບ`,
          },
        });
      }
    } catch (err) {
      console.error('Failed to notify admins:', err);
    }

    console.log(`\n================= ADMIN NOTIFICATION SIMULATOR =================`);
    console.log(`[EMAIL & LINE SENT TO ADMIN] New order placed!`);
    console.log(`Order Number: ${orderNumber}`);
    console.log(`Total Amount: ${totalAmount} LAK`);
    console.log(`================================================================\n`);
  }
}
