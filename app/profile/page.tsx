"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Interface untuk tipe data post
interface Post {
  id: number;
  title: string;
  created_at: string;
  likes: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalLikes, setTotalLikes] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Ambil Sesi User
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/login");
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      // 2. Ambil Data Tulisan dari Supabase berdasarkan author_id
      const { data: postsData, error } = await supabase
        .from("posts") // Pastikan nama tabel sesuai
        .select("id, title, created_at, likes")
        .eq("author_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!error && postsData) {
        setPosts(postsData);
        
        // 3. Hitung Total Apresiasi (Likes) secara dinamis
        const likesCount = postsData.reduce((acc, curr) => acc + (curr.likes || 0), 0);
        setTotalLikes(likesCount);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Fungsi formatter tanggal sederhana
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="h-4 w-4 bg-orange-500 rounded-full animate-ping"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-500">
      
      {/* Header Navigasi */}
      <nav className="p-8 flex justify-between items-center max-w-4xl mx-auto w-full">
        <Link 
          href="/" 
          className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          ← Kembali ke Beranda
        </Link>
        <button 
          onClick={handleLogout}
          className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
        >
          Keluar Sesi
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-8 pt-10 pb-20">
        
        {/* Identitas Utama */}
        <section className="flex flex-col items-center lg:items-start lg:flex-row gap-10 mb-24">
          <div className="h-28 w-28 rounded-[2.5rem] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center text-4xl font-serif shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
            {user?.user_metadata?.user_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || "U"}
          </div>
          
          <div className="text-center lg:text-left flex-1">
            <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-zinc-900 dark:text-white">
              {user?.user_metadata?.full_name || "Penulis Tanpa Nama"}
            </h1>
            <p className="text-zinc-400 text-sm mt-2 font-medium italic font-serif">
              @{user?.user_metadata?.user_name || user?.email?.split('@')[0]}@tulisankita.com
            </p>
            
            <div className="mt-8 flex justify-center lg:justify-start gap-12 border-t border-zinc-200 dark:border-zinc-900 pt-8">
              <div className="group">
                <span className="block text-2xl font-bold font-serif group-hover:text-orange-500 transition-colors">{posts.length}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Arsip Karya</span>
              </div>
              <div className="group">
                <span className="block text-2xl font-bold font-serif group-hover:text-orange-500 transition-colors">
                  {totalLikes >= 1000 ? `${(totalLikes / 1000).toFixed(1)}k` : totalLikes}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold">Apresiasi</span>
              </div>
            </div>
          </div>
        </section>

        {/* Daftar Karya */}
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-400 whitespace-nowrap">Daftar Literasi</h2>
            <div className="h-[1px] w-full bg-zinc-200 dark:bg-zinc-900"></div>
          </div>

          <div className="grid gap-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link 
                  key={post.id} 
                  href={`/post/${post.id}`} // Link ke detail tulisan
                  className="group p-8 rounded-3xl bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 hover:border-orange-500/30 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-none transition-all duration-500 flex justify-between items-center cursor-pointer"
                >
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold group-hover:text-orange-500 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-medium">
                      Diterbitkan pada {formatDate(post.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-serif font-bold text-zinc-900 dark:text-zinc-100">{post.likes}</span>
                    <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Suka</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-zinc-400 text-xs uppercase tracking-widest italic">Belum ada karya yang diterbitkan.</p>
              </div>
            )}

            {/* Tombol Buat Baru */}
            <Link href="/write" className="w-full">
              <button className="w-full p-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-900 text-zinc-400 dark:text-zinc-700 hover:border-orange-500 hover:text-orange-500 dark:hover:border-orange-500 dark:hover:text-orange-500 transition-all duration-300 flex flex-col items-center justify-center gap-2 group">
                <span className="text-3xl group-hover:scale-125 transition-transform">+</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Mulai Tulisan Baru</span>
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="text-center pb-12 mt-10">
        <div className="h-1 w-1 bg-orange-500 mx-auto mb-6 rounded-full"></div>
        <p className="text-[9px] font-mono text-zinc-300 dark:text-zinc-800 tracking-[0.5em] uppercase">
          Tulisankita — Ruang Abadi untuk Pikiran
        </p>
      </footer>
    </div>
  );
}