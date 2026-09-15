import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CAR_PHOTOS: Record<string, string[]> = {
  "Toyota Corolla": [
    "/cars/corolla/1b6bbd38-9db9-42a0-9c94-0e1d65d34386.JPG",
    "/cars/corolla/1e222beb-c038-4ba5-bcea-7b668664a79e.JPG",
    "/cars/corolla/19a3f7ae-fce0-4620-8546-7ff7d6e51b88.JPG",
    "/cars/corolla/0d119d9b-4ef7-4f7f-a783-2a7703f2184c.JPG",
    "/cars/corolla/05952a8f-3582-4213-871a-fd5df3335c48.JPG",
    "/cars/corolla/50f2745d-8765-4608-81bc-7843d259e03e.JPG",
    "/cars/corolla/9a1adf74-5d03-48e8-b253-043d8163e267.JPG",
    "/cars/corolla/cdf13808-092b-4951-ad51-ea464568c34b.JPG",
    "/cars/corolla/e7dce719-c0b1-4116-81ee-7916bafc6c76.JPG",
  ],
  "Dodge Challenger": [
    "/cars/challenger/04f32b83-8e0c-4adf-a117-827485f4d27f.JPG",
    "/cars/challenger/2a4050e2-dbaf-44b4-b0e3-cfbc11a2a14c.JPG",
    "/cars/challenger/3b88b572-89b1-4fe6-a57c-4ca0f9e06410.JPG",
    "/cars/challenger/4e26d2ee-5a4d-4854-aedd-7a08655e69c6.JPG",
    "/cars/challenger/5730e979-ac51-44cc-9112-fed18a4389ca.JPG",
    "/cars/challenger/6791adc3-a32d-4acb-98a9-d78bd9c69762.JPG",
    "/cars/challenger/a2d56ae2-da67-4241-979e-5fe1cd557aa1.JPG",
    "/cars/challenger/cd6d2abe-b655-4e41-be55-c82791d34d9b.JPG",
    "/cars/challenger/d1571e9a-ceb8-40e3-b4c1-26b954bd8cec.JPG",
    "/cars/challenger/dad5f0ef-d141-460f-bb47-31d3c02366e6.JPG",
    "/cars/challenger/f0f72459-a48d-48e1-9748-b3fd52041143.JPG",
    "/cars/challenger/f9b86750-798a-4e60-aefb-651acaa42160.JPG",
  ],
  "Toyota Camry": [
    "/cars/camry/5f68a5b9-8c90-4ff8-b6e3-6702a3837f36.JPG",
    "/cars/camry/90089367-4a5b-4b4d-bd53-b40cc49e2df5.JPG",
    "/cars/camry/a4fe2941-3ba6-49d0-a1a4-9f753ef5c21f.JPG",
    "/cars/camry/bb4455d0-c904-4271-8c6a-859d8346e735.JPG",
    "/cars/camry/c6ea8902-8a41-4b3e-8955-d6374cd33f1a.JPG",
  ],
};

async function main() {
  // Development seed: keep exactly one administrator.
  await prisma.user.deleteMany({ where: { role: { not: "ADMIN" } } });

  const hash = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@carrental.com" },
    update: { role: "ADMIN", isActive: true },
    create: { email: "admin@carrental.com", name: "Admin", password: hash, role: "ADMIN" },
  });

  const settingsList = [
    { key: "businessName", value: "شركة الرائد لتأجير السيارات" },
    { key: "businessNameEn", value: "ALRAID Car Rental" },
    { key: "businessPhone", value: "07701886516" },
    { key: "businessEmail", value: "alraadkirkuk@gmail.com" },
    { key: "businessAddress", value: "كركوك شارع قدس مقابل بوكس كافيه" },
    { key: "businessAddressEn", value: "Quds Street, opposite Box Cafe, Kirkuk, Iraq" },
    { key: "businessLogo", value: "/brand/alraid-logo.JPG" },
    { key: "currency", value: "IQD" },
    { key: "lateFeePerDay", value: "5000" },
    { key: "gracePeriodHours", value: "2" },
    { key: "whatsappNumber", value: "9647701886516" },
    { key: "rentalTerms", value: "The renter is responsible for traffic fines, fuel costs, and damage during the rental period. A security deposit is required and refunded according to the rental agreement." },
  ];
  for (const s of settingsList) {
    await prisma.setting.upsert({ where: { key: s.key }, update: { value: s.value }, create: s });
  }

  const carsData = [
    { name:"Toyota Corolla", make:"Toyota", model:"Corolla", year:2023, color:"White", plate:"22-N-20460", fuelType:"PETROL", transmission:"AUTOMATIC", seats:5, mileage:0, dailyPrice:50000, weeklyPrice:300000, monthlyPrice:1100000, deposit:500000, status:"AVAILABLE", description:"Toyota Corolla — clean, comfortable and ready for everyday travel." },
    { name:"Dodge Challenger", make:"Dodge", model:"Challenger", year:2023, color:"Dark Gray", plate:"22-H-63642", fuelType:"PETROL", transmission:"AUTOMATIC", seats:5, mileage:0, dailyPrice:120000, weeklyPrice:700000, monthlyPrice:2500000, deposit:1000000, status:"AVAILABLE", description:"Dodge Challenger — sporty performance with a distinctive presence." },
    { name:"Toyota Camry", make:"Toyota", model:"Camry", year:2023, color:"Red", plate:"22-L-17368", fuelType:"PETROL", transmission:"AUTOMATIC", seats:5, mileage:0, dailyPrice:70000, weeklyPrice:420000, monthlyPrice:1500000, deposit:700000, status:"AVAILABLE", description:"Toyota Camry — premium comfort for business and family trips." },
  ];

  // Hide the old demo fleet without destroying rental history.
  await prisma.car.updateMany({
    where: { plate: { notIn: carsData.map(c => c.plate) } },
    data: { isDeleted: true, status: "INACTIVE" },
  });

  const cars: { id: string; name: string; dailyPrice: number; deposit: number }[] = [];
  for (const c of carsData) {
    const car = await prisma.car.upsert({
      where: { plate: c.plate },
      update: { ...c, isDeleted: false },
      create: c,
    });
    cars.push({ id: car.id, name: car.name, dailyPrice: car.dailyPrice, deposit: car.deposit });

    await prisma.carImage.deleteMany({ where: { carId: car.id } });
    const photos = CAR_PHOTOS[car.name] ?? [];
    if (photos.length) {
      await prisma.carImage.createMany({
        data: photos.map((url, index) => ({ carId: car.id, url, isPrimary: index === 0 })),
      });
    }
  }

  console.log("\n✅ Seed completed.");
  console.log("   Admin: admin@carrental.com / Admin@123");
  console.log(`   Cars: ${cars.length} real fleet vehicles with photos`);
  console.log("   Business: شركة الرائد لتأجير السيارات / ALRAID Car Rental");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
