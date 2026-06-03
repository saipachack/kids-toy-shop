import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with LAK prices and Lao language support...');

  // 1. Clean existing data
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('Database cleaned.');

  // 2. Create Users
  const adminPassword = await bcrypt.hash('adminpassword123', 10);
  const customerPassword = await bcrypt.hash('customerpassword123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@kidsshop.com',
      password: adminPassword,
      name: 'Pattie Play Shop Admin Manager',
      role: 'ADMIN',
      phone: '+85620 97777279',
      address: 'Pattie Play Shop Headquarters, Vientiane, Laos',
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@gmail.com',
      password: customerPassword,
      name: 'Jane Doe',
      role: 'CUSTOMER',
      phone: '+85620 55556666',
      address: 'Thongpong, Sikhodtabong District, Vientiane, Laos',
    },
  });

  console.log('Test users created:');
  console.log(`- Admin: admin@kidsshop.com (password: adminpassword123)`);
  console.log(`- Customer: customer@gmail.com (password: customerpassword123)`);

  // 3. Create Categories
  const catEducational = await prisma.category.create({
    data: {
      nameEn: 'Educational & Learning',
      nameTh: 'ของเล่นเพื่อการเรียนรู้และเสริมทักษะ',
      nameLa: 'ຂອງຫຼິ້ນເພື່ອການຮຽນຮູ້ ແລະ ເສີມທັກສະ',
      slug: 'educational',
    },
  });

  const catDolls = await prisma.category.create({
    data: {
      nameEn: 'Dolls & Action Figures',
      nameTh: 'ตุ๊กตาและฟิกเกอร์ฮีโร่',
      nameLa: 'ຕຸກກະຕາ ແລະ ຟິກເກີຮີໂຣ້',
      slug: 'dolls-figures',
    },
  });

  const catPuzzles = await prisma.category.create({
    data: {
      nameEn: 'Puzzles & Games',
      nameTh: 'ตัวต่อและบอร์ดเกม',
      nameLa: 'ຕົວຕໍ່ ແລະ ບອດເກມ',
      slug: 'puzzles-games',
    },
  });

  const catPlush = await prisma.category.create({
    data: {
      nameEn: 'Plush & Soft Toys',
      nameTh: 'ตุ๊กตาผ้าและตุ๊กตานุ่มนิ่ม',
      nameLa: 'ຕຸກກະຕາຜ້າ ແລະ ຕຸກກະຕາອ່ອນນຸ້ມ',
      slug: 'plush-toys',
    },
  });

  const catOutdoor = await prisma.category.create({
    data: {
      nameEn: 'Outdoor Play & Ride-ons',
      nameTh: 'ของเล่นสนามและยานพาหนะเด็ก',
      nameLa: 'ຂອງຫຼິ້ນສະໜາມ ແລະ ຍານພາຫະນະເດັກ',
      slug: 'outdoor-ride',
    },
  });

  console.log('Categories created successfully.');

  // 4. Create Products (Prices in LAK, scaled up from THB ~600x and rounded)
  const productsData = [
    {
      nameEn: 'Colorful Wooden Building Blocks (50pcs)',
      nameTh: 'บล็อกไม้สร้างเมืองหลากสี (50 ชิ้น)',
      nameLa: 'ບລັອກໄມ້ສ້າງເມືອງຫຼາກສີ (50 ຊິ້ນ)',
      descriptionEn: 'High quality wooden blocks in multiple shapes and pastel colors. Stimulates creativity and fine motor skills in infants.',
      descriptionTh: 'บล็อกไม้คุณภาพสูงรูปทรงต่างๆ สีสันสดใสพาสเทล ช่วยกระตุ้นความคิดสร้างสรรค์และพัฒนาการกล้ามเนื้อมันเล็กของน้องๆ',
      descriptionLa: 'ບລັອກໄມ້ຄຸນນະພາບສູງຮູບຊົງຕ່າງໆ ສີສັນສົດໃສພັສເທວ ຊ່ວຍກະຕຸ້ນຄວາມຄິດສ້າງສັນ ແລະ ພັດທະນາການກ້າມເນື້ອນ້ອຍຂອງນ້ອງໆ',
      price: 300000, // ₭300,000 LAK
      stock: 25,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1618842676088-c4d48a6a7c9d?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: true,
      isNewArrival: false,
      categoryId: catEducational.id,
    },
    {
      nameEn: 'My First Coding Robot Toy',
      nameTh: 'หุ่นยนต์ฝึกโค้ดดิ้งตัวแรกของฉัน',
      nameLa: 'ຫຸ່ນຍົນຝຶກໂຄດດິ້ງຕົວທຳອິດຂອງຂ້ອຍ',
      descriptionEn: 'Screen-free coding robot for kids aged 3-6. Learn early STEM concepts through simple directional button control card maps.',
      descriptionTh: 'หุ่นยนต์สอนโค้ดดิ้งแบบไม่ใช้หน้าจอ สำหรับเด็กอายุ 3-6 ปี เรียนรู้แนวคิด STEM เบื้องต้นผ่านปุ่มกดควบคุมทิศทางและการ์ดแผนที่',
      descriptionLa: 'ຫຸ່ນຍົນສອນໂຄດດິ້ງແບບບໍ່ໃຊ້ໜ້າຈໍ ສຳລັບເດັກອາຍຸ 3-6 ປີ ຮຽນຮູ້ແນວຄິດ STEM ເບື້ອງຕົ້ນຜ່ານປຸ່ມກົດຄວບຄຸມທິດທາງ ແລະ ແຜนທີ່',
      price: 1150000, // ₭1,150,000 LAK
      stock: 12,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1531641098792-4f3951222129?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: true,
      isNewArrival: true,
      categoryId: catEducational.id,
    },
    {
      nameEn: 'Superhero Action Figure Trio',
      nameTh: 'ฟิกเกอร์ฮีโร่ผู้พิทักษ์ (เซ็ต 3 ตัว)',
      nameLa: 'ຟິກເກີຮີໂຣ້ຜູ້ພິທັກ (ເຊັດ 3 ຕົວ)',
      descriptionEn: 'Posable 12-inch superhero figures with glowing light effects and sound lines. Crafted from safe, non-toxic plastic.',
      descriptionTh: 'ชุดหุ่นโมเดลฮีโร่ขยับข้อต่อได้ขนาด 12 นิ้ว พร้อมไฟเรืองแสงและเสียงพูดเด่นๆ ผลิตจากพลาสติกหนาแข็งแรง ปลอดสารพิษ',
      descriptionLa: 'ຊຸດຫຸ່ນໂມເດວຮີໂຣ້ຂະຫຍັບຂໍ້ຕໍ່ໄດ້ ຂະໜາດ 12 ນິ້ວ ພ້ອມໄຟເຮືອງແຮງ ແລະ ສຽງເວົ້າເດັ່ນໆ ຜະລິດຈາກພລາສຕິກໜາແຂງແຮງ ປອດໄພ',
      price: 450000, // ₭450,000 LAK
      stock: 4,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1608889175123-8ee362201f81?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: false,
      isNewArrival: true,
      categoryId: catDolls.id,
    },
    {
      nameEn: 'Magical Princess Dollhouse',
      nameTh: 'บ้านตุ๊กตาเจ้าหญิงมหัศจรรย์',
      nameLa: 'ບ້ານຕຸກກະຕາເຈົ້າໝິງມະຫັດສະຈັນ',
      descriptionEn: '3-story luxury wooden dollhouse with 15 pieces of furniture and a manual working elevator. Fits up to 12-inch dolls.',
      descriptionTh: 'บ้านตุ๊กตาไม้สุดหรูสูง 3 ชั้น มาพร้อมเฟอร์นิเจอร์ตกแต่งบ้าน 15 ชิ้น และลิฟต์แบบเลื่อนมือ หมุนเล่นสนุกกับตุ๊กตาขนาดปกติได้',
      descriptionLa: 'ບ້ານຕຸກກະຕາໄມ້ສຸດຫຼູສູง 3 ຊັ້ນ ມາພ້ອມເຟີນີເຈີຕົກແຕ່ງບ້ານ 15 ຊິ້ນ ແລະ ລິບແບບເລື່ອນມື ຫຼິ້ນມ່ວນກັບຕຸກກະຕາຂະໜາດປົກກະຕິໄດ້',
      price: 1500000, // ₭1,500,000 LAK
      stock: 8,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1598128558393-70ff21433be0?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: true,
      isNewArrival: false,
      categoryId: catDolls.id,
    },
    {
      nameEn: 'Classic Wooden Train Set',
      nameTh: 'ชุดรางรถไฟไม้คลาสสิกแปดช่อง',
      nameLa: 'ຊຸດລາງລົດໄຟໄມ້คลาสສິກ',
      descriptionEn: 'Traditional wooden rail tracks and magnetic train cars. Easy connections, loop-de-loop bridges, and forest trees accessories.',
      descriptionTh: 'ชุดทางรถไฟทำด้วยไม้ขัดเรียบรูปเลข 8 รถไฟต่อแม่เหล็ก พร้อมสะพานยกระดับ ต้นไม้ และป้ายสัญลักษณ์จำลองน่ารัก',
      descriptionLa: 'ຊຸດທາງລົດໄຟເຮັດດ້ວຍໄມ້ຂັດລຽບຮູບເລກ 8 ລົດໄຟຕໍ່ແມ່ເຫຼັກ ພ້ອມຂົວສະພານຍົກລະດັບ ຕົ້ນໄມ້ ແລະ ປ້າຍສັນຍາລັກຈຳລອງ',
      price: 550000, // ₭550,000 LAK
      stock: 15,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1515488042361-404e9250afef?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1519340241574-2bec6cdb24a5?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: false,
      isNewArrival: false,
      categoryId: catPuzzles.id,
    },
    {
      nameEn: '3D Animal Safari Wooden Puzzle',
      nameTh: 'พัซเซิลไม้ 3 มิติ สัตว์ซาฟารี',
      nameLa: 'ພັສເຊິນໄມ้ 3 ມິຕິ ສັດຊາຟາຣີ',
      descriptionEn: 'Interlocking wooden puzzle blocks that form safari animals. Great for color matching, hand-eye coordination, and logical play.',
      descriptionTh: 'ตัวต่อไม้สามมิติภาพสัตว์ป่าซาฟารี ช่วยฝึกความจำเป็นเลิศ พัฒนาสายตาประสานกับมือ และฝึกทักษะการแก้ปัญหา',
      descriptionLa: 'ຕົວຕໍ່ໄມ້ສາມມິຕິພາບສັດປ່າຊາຟາຣີ ຊ່ວຍເຝິກຄວາມຈຳເປັນເລີດ ພັດທະນາສາຍຕາປະສານກັບມື ແລະ ເຝິກທັກສະການແກ້ໄຂບັນຫາ',
      price: 195000, // ₭195,000 LAK
      stock: 40,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: false,
      isNewArrival: true,
      categoryId: catPuzzles.id,
    },
    {
      nameEn: 'Super Soft Fluffy Teddy Bear (Golden)',
      nameTh: 'น้องหมีขนปุยแสนนุ่มนิ่ม (สีทอง)',
      nameLa: 'ນ້ອງໝີຂົນປຸຍແສນນຸ້ມນິ້ມ (ສີທອງ)',
      descriptionEn: '18-inch hugging size fluffy teddy bear filled with premium PP cotton. Hypoallergenic fabric suitable for toddlers.',
      descriptionTh: 'ตุ๊กตาหมีขนปุยสีทองขนาด 18 นิ้ว เหมาะแก่การกอด อัดแน่นด้วยใยสังเคราะห์พรีเมียม ถอดซักแห้งได้ ไม่ก่อให้เกิดอาการแพ้',
      descriptionLa: 'ຕຸກກະຕາໝີຂົນປຸຍສີທອງຂະໜາດ 18 ນິ້ວ ເໝາະແກ່ການກອດ ອັດແໜ້ນດ້ວຍໃຍສັງເຄາະພຣີມຽມ ບໍ່ກໍ່ໃຫ້ເກີດອາການແພ້',
      price: 360000, // ₭360,000 LAK
      stock: 30,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1559251606-c623743a6d76?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: true,
      isNewArrival: false,
      categoryId: catPlush.id,
    },
    {
      nameEn: 'Cute Chubby Dino Plush Toy',
      nameTh: 'ตุ๊กตาไดโนเสาร์ตุ้ยนุ้ยแสนน่ารัก',
      nameLa: 'ຕุกກະຕາໄດໂນເສົາຕຸ້ຍນຸ້ຍແສນໜ້າຮັກ',
      descriptionEn: 'Adorable cartoon dinosaur doll. Extremely soft elastane material, skin-friendly, makes a perfect nap companion.',
      descriptionTh: 'ไดโนน้อยสีเขียวหน้าอ้วนกลม นุ่มมากด้วยผ้าสแปนเด็กซ์ยืดหยุ่น นอนกอดนุ่มหนุนสบายหัวเป็นบัดดี้ตอนนอนกลางวัน',
      descriptionLa: 'ໄດໂນນ້ອຍສີຂຽວໜ້າອ້ວນກົມ ນຸ້ມຫຼາຍດ້ວຍຜ້າຍືດຍຸ່ນ ນອນກອດນຸ້ມໜູນສະບາຍ ເໝາະເປັນໝູ່ຕອນນອນກາງເວັນ',
      price: 240000, // ₭240,000 LAK
      stock: 22,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: false,
      isNewArrival: true,
      categoryId: catPlush.id,
    },
    {
      nameEn: 'Adjustable Kids 3-Wheel Scooter',
      nameTh: 'สกู๊ตเตอร์เด็กแบบ 3 ล้อ ปรับความสูงได้',
      nameLa: 'ສະກູດເຕີເດັກແບບ 3 ລໍ້ ປັບຄວາມສູງໄດ້',
      descriptionEn: 'Safety steer-to-lean kick scooter with LED light-up wheels, anti-slip deck, and 3 level height adjustment for children.',
      descriptionTh: 'สกู๊ตเตอร์ 3 ล้อเลี้ยวโดยการเอียงตัว ล้อมีไฟกะพริบขณะวิ่ง แผ่นเหยียบกันลื่น ปรับระดับความสูงแฮนด์จับได้ 3 ระดับตามการเติบโต',
      descriptionLa: 'ສະກູດເຕີ 3 ລໍ້ລ້ຽວໂດຍການອຽງຕົວ ລໍ້ມີໄຟກະພິບຂະນະແລ່ນ ແຜ່ນຢຽບກັນມື່ນ ປັບລະດับຄວາມສູງແຮນຈັບໄດ້ 3 ລະດັບ',
      price: 780000, // ₭780,000 LAK
      stock: 10,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: true,
      isNewArrival: false,
      categoryId: catOutdoor.id,
    },
    {
      nameEn: 'Castle Adventure Play Tent',
      nameTh: 'เต็นท์เด็กเล่น ปราสาทผจญภัย',
      nameLa: 'ເຕັ້ນເດັກຫຼິ້ນ ປາສາດຜະຈົນໄພ',
      descriptionEn: 'Pop-up indoor/outdoor castle tent. Easy setup, breathable mesh windows, spacious interior for up to 3 children.',
      descriptionTh: 'บ้านบอลเต็นท์ปราสาทพับได้ เล่นได้ทั้งในบ้านและนอกสนาม ติดตั้งง่าย มีช่องตาข่ายระบายอากาศดี กว้างขวางเข้าได้พร้อมกัน 3 คน',
      descriptionLa: 'ເຕັ້ນປາສາດພັບໄດ້ ຫຼิ້ນໄດ້ທັງໃນບ້ານ ແລະ ນອກສະໜາມ ຕິດຕັ້ງງ່າຍ ມີຊ່องຕາໜ່າງລະບາຍອາກາດດີ ກວ້າງຂວາງ',
      price: 390000, // ₭390,000 LAK
      stock: 3,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1564754508282-36d9472e3b1c?auto=format&fit=crop&q=80&w=600'
      ]),
      isBestSeller: false,
      isNewArrival: false,
      categoryId: catOutdoor.id,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.create({
      data: prod,
    });
  }

  console.log('Seeded database with 10 test toys in LAK.');
  console.log('Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
