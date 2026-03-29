/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  ChevronRight, 
  Search,
  LayoutGrid,
  List as ListIcon,
  GraduationCap
} from 'lucide-react';
import { VIDEOS } from './constants';
import { Video } from './types';

export default function App() {
  const [currentVideo, setCurrentVideo] = useState<Video>(VIDEOS[0]);
  const [watchedVideos, setWatchedVideos] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('الكل');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(VIDEOS.map(v => v.category)));
    return ['الكل', ...cats];
  }, []);

  const subcategories = useMemo(() => {
    if (selectedCategory === 'الكل') return ['الكل'];
    const subs = Array.from(new Set(VIDEOS.filter(v => v.category === selectedCategory).map(v => v.subcategory)));
    return ['الكل', ...subs];
  }, [selectedCategory]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory('الكل');
  }, [selectedCategory]);

  const filteredVideos = useMemo(() => {
    return VIDEOS.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           v.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'الكل' || v.category === selectedCategory;
      const matchesSubcategory = selectedSubcategory === 'الكل' || v.subcategory === selectedSubcategory;
      return matchesSearch && matchesCategory && matchesSubcategory;
    });
  }, [searchQuery, selectedCategory, selectedSubcategory]);

  const toggleWatched = (id: string) => {
    setWatchedVideos(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const progress = Math.round((watchedVideos.length / VIDEOS.length) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">القصة الرقمية</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 font-medium">تقدمك الدراسي</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-orange-600"
                  />
                </div>
                <span className="text-sm font-bold text-orange-600">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Video Player */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-200 relative group">
              <video 
                key={currentVideo.url}
                src={currentVideo.url} 
                controls 
                className="w-full h-full object-contain"
                poster={currentVideo.thumbnail}
                onEnded={() => toggleWatched(currentVideo.id)}
              />
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded uppercase tracking-wider">
                      {currentVideo.category}
                    </span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded uppercase tracking-wider">
                      {currentVideo.subcategory}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 mr-2">
                      <Clock className="w-3 h-3" />
                      {currentVideo.duration}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">{currentVideo.title}</h2>
                </div>
                <button 
                  onClick={() => toggleWatched(currentVideo.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    watchedVideos.includes(currentVideo.id) 
                    ? 'bg-green-50 text-green-600 border border-green-200' 
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 ${watchedVideos.includes(currentVideo.id) ? 'fill-green-600 text-white' : ''}`} />
                  <span className="text-sm font-bold">
                    {watchedVideos.includes(currentVideo.id) ? 'مكتمل' : 'تحديد كمكتمل'}
                  </span>
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {currentVideo.description}
              </p>
            </div>
          </div>

          {/* Sidebar: Playlist & Filters */}
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              {/* Search & View Toggle */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="بحث في الدروس..."
                    className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Main Category Filter */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">المادة الأساسية</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        selectedCategory === cat 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategory Filter */}
              {selectedCategory !== 'الكل' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">التصنيف الفرعي</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {subcategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          selectedSubcategory === sub 
                          ? 'bg-slate-800 text-white' 
                          : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Video List */}
            <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {filteredVideos.map((video, index) => (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setCurrentVideo(video)}
                    className={`group cursor-pointer p-3 rounded-xl border transition-all flex gap-3 items-center ${
                      currentVideo.id === video.id 
                      ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' 
                      : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all ${currentVideo.id === video.id ? 'bg-orange-600/20' : ''}`}>
                        {currentVideo.id === video.id ? (
                          <div className="flex gap-0.5 items-end h-3">
                            <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white rounded-full" />
                            <motion.div animate={{ height: [12, 4, 12] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 bg-white rounded-full" />
                            <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 bg-white rounded-full" />
                          </div>
                        ) : (
                          <Play className="w-6 h-6 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                      {watchedVideos.includes(video.id) && (
                        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5 shadow-lg">
                          <CheckCircle2 className="w-3 h-3 text-white fill-green-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 text-right">
                      <h3 className={`text-sm font-bold truncate ${currentVideo.id === video.id ? 'text-orange-700' : 'text-slate-700'}`}>
                        {video.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 justify-end">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {video.duration}
                        </span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-400">{video.subcategory}</span>
                      </div>
                    </div>
                    
                    <ChevronRight className={`w-4 h-4 transition-transform ${currentVideo.id === video.id ? 'text-orange-400 rotate-90' : 'text-slate-300 group-hover:translate-x-1'}`} />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredVideos.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">لم يتم العثور على دروس تطابق بحثك</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
