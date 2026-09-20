import fs from 'fs';
import path from 'path';

async function generateRealProducts() {
  // A solid array of real products with authentic images and descriptions
  const hardcoded = [
      {
        nameBn: 'খাঁটি সুন্দরবনের মধু (১ কেজি)',
        nameEn: 'Pure Sundarban Honey (1kg)',
        descriptionBn: 'সুন্দরবনের গহীন অরণ্য থেকে সংগৃহীত ১০০% খাঁটি মধু। কোন প্রকার ভেজাল নেই।',
        descriptionEn: '100% pure honey collected from the deep forests of Sundarban.',
        price: 850,
        images: ['https://ghorerbazarbd.com/wp-content/uploads/2021/04/Sundarban-Honey.jpg'],
        categoryEn: 'Honey',
        categoryBn: 'মধু'
      },
      {
        nameBn: 'গাওয়া ঘি (৫০০ গ্রাম)',
        nameEn: 'Gawa Ghee (500g)',
        descriptionBn: 'দেশী গরুর দুধ থেকে তৈরি স্পেশাল ঘি। সম্পূর্ণ ঘরে তৈরি।',
        descriptionEn: 'Special ghee made from deshi cow milk. Completely homemade.',
        price: 750,
        images: ['https://ghorerbazarbd.com/wp-content/uploads/2021/04/Ghee.jpg'],
        categoryEn: 'Dairy',
        categoryBn: 'ডেইরি'
      },
      {
        nameBn: 'মরিয়ম খেজুর (১ কেজি)',
        nameEn: 'Maryam Dates (1kg)',
        descriptionBn: 'প্রিমিয়াম কোয়ালিটি মরিয়ম খেজুর সরাসরি সৌদি আরব থেকে আমদানিকৃত।',
        descriptionEn: 'Premium quality Maryam dates imported directly from Saudi Arabia.',
        price: 1200,
        images: ['https://khaasfood.com/wp-content/uploads/2022/03/Mariam-Dates-1.jpg'],
        categoryEn: 'Dates',
        categoryBn: 'খেজুর'
      },
      {
        nameBn: 'কালোজিরা ফুলের মধু (৫০০ গ্রাম)',
        nameEn: 'Black Seed Honey (500g)',
        descriptionBn: 'কালোজিরা ফুল থেকে সংগৃহীত প্রাকৃতিক মধু।',
        descriptionEn: 'Natural honey collected from black seed flowers.',
        price: 650,
        images: ['https://khaasfood.com/wp-content/uploads/2022/02/kalojira-modhu.jpg'],
        categoryEn: 'Honey',
        categoryBn: 'মধু'
      },
      {
        nameBn: 'সরিষার তেল (১ লিটার)',
        nameEn: 'Mustard Oil (1L)',
        descriptionBn: 'ঘানিতে ভাঙানো খাঁটি সরিষার তেল।',
        descriptionEn: 'Pure mustard oil cold-pressed in traditional wooden ghani.',
        price: 320,
        images: ['https://khaasfood.com/wp-content/uploads/2020/04/Mustard-Oil-1-Ltr.jpg'],
        categoryEn: 'Oil',
        categoryBn: 'তেল'
      },
      {
        nameBn: 'লাল আটা (২ কেজি)',
        nameEn: 'Red Flour (2kg)',
        descriptionBn: 'দেশী গম থেকে ভাঙানো ১০০% খাঁটি লাল আটা।',
        descriptionEn: '100% pure red flour made from local wheat.',
        price: 150,
        images: ['https://khaasfood.com/wp-content/uploads/2017/12/red-atta.jpg'],
        categoryEn: 'Flour',
        categoryBn: 'আটা/ময়দা'
      },
      {
        nameBn: 'হিমালয়ান পিংক সল্ট (৫০০ গ্রাম)',
        nameEn: 'Himalayan Pink Salt (500g)',
        descriptionBn: 'প্রাকৃতিক খনিজ উপাদানে ভরপুর পিংক সল্ট।',
        descriptionEn: 'Pink salt rich in natural minerals.',
        price: 200,
        images: ['https://khaasfood.com/wp-content/uploads/2020/09/Pink-Salt.jpg'],
        categoryEn: 'Salt',
        categoryBn: 'লবণ'
      },
      {
        nameBn: 'কাঠবাদাম (২৫০ গ্রাম)',
        nameEn: 'Almonds (250g)',
        descriptionBn: 'প্রিমিয়াম কোয়ালিটি কাঠবাদাম, সরাসরি আমেরিকা থেকে আমদানিকৃত।',
        descriptionEn: 'Premium quality almonds imported directly from America.',
        price: 450,
        images: ['https://khaasfood.com/wp-content/uploads/2019/11/Kath-badam-Almond.jpg'],
        categoryEn: 'Nuts',
        categoryBn: 'বাদাম'
      },
      {
        nameBn: 'চিয়া সীড (২৫০ গ্রাম)',
        nameEn: 'Chia Seeds (250g)',
        descriptionBn: 'উচ্চ প্রোটিন ও ফাইবার যুক্ত সুপারফুড চিয়া সীড।',
        descriptionEn: 'High protein and fiber-rich superfood chia seeds.',
        price: 350,
        images: ['https://khaasfood.com/wp-content/uploads/2022/03/Chia-Seed-Front.jpg'],
        categoryEn: 'Superfood',
        categoryBn: 'সুপারফুড'
      },
      {
        nameBn: 'দেশী মসুর ডাল (১ কেজি)',
        nameEn: 'Deshi Masoor Dal (1kg)',
        descriptionBn: 'দেশী মসুর ডাল, সম্পূর্ণ কেমিক্যাল মুক্ত।',
        descriptionEn: 'Local masoor dal, completely chemical-free.',
        price: 180,
        images: ['https://khaasfood.com/wp-content/uploads/2018/11/Deshi-Moshur-Dal.jpg'],
        categoryEn: 'Lentils',
        categoryBn: 'ডাল'
      }
    ];

    const outPath = path.resolve(process.cwd(), 'src', 'seeder', 'data', 'real_products.json');
    fs.writeFileSync(outPath, JSON.stringify(hardcoded, null, 2));
    console.log(`Saved ${hardcoded.length} products to ${outPath}`);
}

generateRealProducts();
