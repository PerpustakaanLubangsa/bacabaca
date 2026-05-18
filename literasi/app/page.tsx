"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const FEED_DATA = [
  {
    id: 1,
    author: "Zaidan",
    title: "Malam di Ujung Kota",
    likes: "1.2k",
    pages: [
      "Di bawah lampu temaram, kota ini menyimpan rahasia yang tak pernah terucap. Langkah kaki terdengar menjauh, meninggalkan gema di gang sempit yang lembap.",
      "Ia teringat pesan ibunya, bahwa kota tidak pernah tidur untuk mereka yang merasa kesepian.",
      "Akhirnya ia sampai di depan pintu tua itu, tempat segalanya dimulai."
    ]
  },
  {
    id: 2,
    author: "Fathur",
    title: "Logika Tanpa Logistik",
    likes: "850",
    pages: [
      "Kopi sudah dingin, tapi barisan kode di layar masih enggan berjalan sempurna.",
      "Dunia teknologi memang kejam bagi mereka yang lupa akan kebutuhan jasmani.",
      "Deadline tinggal dua jam lagi. Pilihan yang ada hanya dua: menyelesaikan algoritma ini atau menyerah."
    ]
  }
];

export default function LiterasiWithAuth() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const activePost = FEED_DATA[currentIndex];

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const newIndex = Math.round(scrollTop / height);
    if (newIndex !== currentIndex && newIndex < FEED_DATA.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Fungsi pembantu untuk membaca nama dari metadata Google OAuth
  const getUserName = () => {
    if (!user) return "";
    return user.user_metadata?.full_name || user.user_metadata?.name || "Penulis bacabaca";
  };

  return (
    <div className="h-screen w-full flex bg-white dark:bg-zinc-950 overflow-hidden font-sans">
      
      {/* --- SIDEBAR KIRI --- */}
      <aside className="hidden lg:flex w-72 flex-col justify-between p-10 border-r border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10 z-20">
        <div className="space-y-10">
          {/* Info Penulis Konten yang sedang dibaca */}
          <div key={activePost.id} className="animate-in fade-in slide-in-from-left-2 duration-500">
            <div className="h-14 w-14 rounded-2xl bg-zinc-800 dark:bg-zinc-200 text-white dark:text-black flex items-center justify-center font-serif text-xl shadow-lg">
              {activePost.author[0]}
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-zinc-900 dark:text-white">@{activePost.author}</h3>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Penulis Kontributor</p>
            </div>
          </div>

          <nav className="flex flex-col gap-6">
            <button className="flex items-center gap-4 text-zinc-400 hover:text-red-500 transition-colors">
              <span className="text-xl">❤️</span>
              <div className="text-left leading-none">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 block">{activePost.likes}</span>
                <span className="text-[10px] uppercase font-medium">Suka</span>
              </div>
            </button>
            <button className="flex items-center gap-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
              <span className="text-xl">🔖</span>
              <div className="text-left leading-none">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 block">Simpan</span>
                <span className="text-[10px] uppercase font-medium text-zinc-400">Koleksi</span>
              </div>
            </button>
          </nav>
        </div>

        {/* --- DYNAMIC AUTH SECTION --- */}
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900">
          {!loading && (
            <>
              {!user ? (
                <Link 
                  href="/login" 
                  className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-md"
                >
                  Masuk / Daftar
                </Link>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Tombol Profil */}
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 group p-2 -m-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                  >
                    {/* Jika ada foto dari Google, tampilkan fotonya. Jika tidak, pakai inisial huruf */}
                    {user.user_metadata?.avatar_url ? (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar"
                        referrerPolicy="no-referrer" // Mencegah Google memblokir gambar saat dimuat
                        className="h-8 w-8 rounded-full object-cover group-hover:scale-110 transition-transform shadow-sm border border-zinc-200 dark:border-zinc-700"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-[10px] font-bold group-hover:scale-110 transition-transform">
                        {getUserName()[0].toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex flex-col overflow-hidden max-w-[160px]">
                      <span className="text-xs font-bold dark:text-white truncate group-hover:text-orange-500 transition-colors">
                        {getUserName()}
                      </span>
                      <span className="text-[8px] text-zinc-400 truncate tracking-tight">Lihat Profil Utama</span>
                    </div>
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="text-[10px] text-zinc-400 hover:text-red-500 transition-colors text-left font-bold uppercase tracking-widest mt-2"
                  >
                    Keluar Akun
                  </button>
                </div>
              )}
            </>
          )}
          <p className="text-[9px] text-zinc-300 dark:text-zinc-700 mt-6 font-mono text-center tracking-tighter uppercase italic">bacabaca v1.2</p>
        </div>
      </aside>

      {/* --- KONTEN TENGAH --- */}
      <main 
        onScroll={handleScroll}
        className="flex-1 h-screen overflow-y-scroll snap-y snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative"
      >
        {/* Profile/Login Mobile (Floating Top Right) */}
        {!loading && (
          user ? (
            <Link 
              href="/profile" 
              className="lg:hidden absolute top-6 right-6 z-30 h-10 w-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full flex items-center justify-center shadow-sm overflow-hidden"
            >
              {user.user_metadata?.avatar_url ? (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold">{getUserName()[0].toUpperCase()}</span>
              )}
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="lg:hidden absolute top-6 right-6 z-30 px-4 py-2 bg-white/80 dark:bg-black/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm"
            >
              Login
            </Link>
          )
        )}

        {FEED_DATA.map((post) => (
          <section key={post.id} className="h-screen w-full snap-start snap-always flex flex-col overflow-hidden">
            <div className="flex-1 flex overflow-x-scroll snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {post.pages.map((content, index) => (
                <div key={index} className="h-full w-full min-w-full snap-start flex flex-col items-center justify-center px-8 md:px-20 lg:px-32">
                  <article className="max-w-2xl w-full flex flex-col justify-center flex-1">
                    {index === 0 && (
                      <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-zinc-900 dark:text-white leading-tight">
                          {post.title}
                        </h1>
                        <div className="h-1 w-12 bg-orange-500 mt-6"></div>
                      </div>
                    )}
                    <p className="text-xl md:text-2xl lg:text-3xl font-serif leading-relaxed text-zinc-800 dark:text-zinc-200 text-justify">
                      {content}
                    </p>
                    <div className="mt-16 flex items-center justify-center gap-3">
                       {post.pages.map((_, i) => (
                         <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${i === index ? 'w-12 bg-zinc-800 dark:bg-zinc-100' : 'w-2 bg-zinc-200 dark:bg-zinc-800'}`} />
                       ))}
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}