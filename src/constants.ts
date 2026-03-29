import { Video } from './types';

const categories = [
  { name: 'الرياضيات', subcategories: ['الجبر', 'الهندسة', 'الإحصاء'] },
  { name: 'العلوم', subcategories: ['الفيزياء', 'الكيمياء', 'الأحياء'] },
  { name: 'التاريخ', subcategories: ['التاريخ القديم', 'التاريخ الحديث', 'تاريخ العرب'] },
];

export const VIDEOS: Video[] = Array.from({ length: 30 }, (_, i) => {
  const catIndex = Math.floor(i / 10);
  const subIndex = Math.floor((i % 10) / 3.4); // Distribute subcategories
  const category = categories[catIndex];
  const subcategory = category.subcategories[Math.min(subIndex, category.subcategories.length - 1)];

  return {
    id: `video-${i + 1}`,
    title: `${category.name} - ${subcategory}: الدرس ${i + 1}`,
    description: `شرح مفصل لموضوع ${subcategory} ضمن مادة ${category.name}. يتناول هذا الفيديو مفاهيم أساسية وتطبيقات عملية لمساعدة الطلاب على فهم المادة بشكل أعمق.`,
    thumbnail: `https://picsum.photos/seed/edu-${category.name}-${i + 1}/640/360`,
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: `${Math.floor(Math.random() * 15) + 5}:00`,
    category: category.name,
    subcategory: subcategory,
  };
});
