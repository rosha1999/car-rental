
export type Language = "ar" | "en";

export const publicTranslations = {
  ar: {
    home:"الرئيسية", fleet:"السيارات", booking:"الحجز", contact:"اتصل بنا",
    bookCar:"احجز سيارة", heroKicker:"شركة الرائد لتأجير السيارات",
    heroTitle:"استأجر سيارتك بثقة وراحة", heroText:"أسطول مختار بعناية وخدمة احترافية في كركوك، مع تأكيد الحجز والتفاصيل مباشرة مع فريقنا.",
    viewCars:"شاهد السيارات", callUs:"اتصل بنا", premium:"خدمة محلية احترافية",
    quality:"سيارات نظيفة ومجهزة", easy:"حجز سريع بدون حساب", support:"دعم مباشر في كركوك",
    qualityText:"سيارات تتم إدارتها ومتابعتها بشكل مباشر.",
    easyText:"اختر السيارة وأرسل طلبك وسنتواصل معك لتأكيد التفاصيل.",
    supportText:"خدمة شخصية وسريعة طوال فترة الإيجار.",
    fleetKicker:"أسطولنا", fleetTitle:"اختر سيارتك القادمة",
    fleetText:"شاهد السيارات المتاحة ومواصفاتها. الأسعار متوفرة بشكل خاص من إدارة الشركة.",
    available:"متاحة", seats:"مقاعد", automatic:"أوتوماتيك", petrol:"بنزين", requestCar:"طلب هذه السيارة",
    noCars:"لا توجد سيارات متاحة حالياً. تواصل معنا للمزيد من الخيارات.",
    contactTitle:"تواصل مع شركة الرائد", contactText:"نحن جاهزون لمساعدتك في اختيار السيارة المناسبة وتأكيد الحجز.",
    phone:"الهاتف", email:"البريد الإلكتروني", address:"العنوان", whatsapp:"واتساب",
    location:"كركوك - شارع القدس مقابل بوكس كافيه", openWhatsapp:"فتح واتساب",
    bookingTitle:"طلب حجز سيارة", bookingText:"أرسل بياناتك وسنتواصل معك لتأكيد الحجز والتفاصيل.",
    fullName:"الاسم الكامل", phoneNumber:"رقم الهاتف", preferredCar:"السيارة المفضلة",
    anyCar:"أي سيارة متاحة", startDate:"تاريخ البداية", endDate:"تاريخ النهاية", notes:"ملاحظات",
    notesPlaceholder:"أي طلبات أو ملاحظات إضافية...", submit:"إرسال طلب الحجز", submitting:"جاري الإرسال...",
    received:"تم استلام طلبك!", receivedText:"شكراً لك. سنتواصل معك على الرقم", failed:"تعذر إرسال الطلب. حاول مرة أخرى.",
    footer:"تأجير سيارات احترافي في كركوك - العراق", language:"English",
    privacy:"الأسعار لا تظهر للزوار وتبقى ضمن لوحة الإدارة."
  },
  en: {
    home:"Home", fleet:"Our Cars", booking:"Booking", contact:"Contact",
    bookCar:"Book a Car", heroKicker:"ALRAID Car Rental",
    heroTitle:"Rent with confidence. Drive with ease.", heroText:"A carefully selected fleet and professional local service in Kirkuk, with booking details confirmed directly by our team.",
    viewCars:"View Cars", callUs:"Call Us", premium:"Professional local service",
    quality:"Clean, ready vehicles", easy:"Fast booking, no account", support:"Direct Kirkuk support",
    qualityText:"Vehicles managed and maintained directly by our team.",
    easyText:"Choose a car, send your request, and we will confirm the details with you.",
    supportText:"Personal, responsive support throughout your rental.",
    fleetKicker:"Our Fleet", fleetTitle:"Choose your next ride",
    fleetText:"Browse available vehicles and specifications. Rental prices are provided privately by the company.",
    available:"Available", seats:"Seats", automatic:"Automatic", petrol:"Petrol", requestCar:"Request this car",
    noCars:"No vehicles are currently available. Contact us for more options.",
    contactTitle:"Contact ALRAID Car Rental", contactText:"We are ready to help you choose the right car and confirm your booking.",
    phone:"Phone", email:"Email", address:"Address", whatsapp:"WhatsApp",
    location:"Quds Street, opposite Box Cafe, Kirkuk, Iraq", openWhatsapp:"Open WhatsApp",
    bookingTitle:"Car Booking Request", bookingText:"Send your details and we will contact you to confirm the booking.",
    fullName:"Full Name", phoneNumber:"Phone Number", preferredCar:"Preferred Car",
    anyCar:"Any available car", startDate:"Start Date", endDate:"End Date", notes:"Notes",
    notesPlaceholder:"Any special requirements or notes...", submit:"Submit Booking Request", submitting:"Submitting...",
    received:"Request received!", receivedText:"Thank you. We will contact you at", failed:"Could not submit the request. Please try again.",
    footer:"Professional car rental in Kirkuk, Iraq", language:"العربية",
    privacy:"Prices are hidden from visitors and remain private inside the admin panel."
  }
} as const;
