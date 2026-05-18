"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function WritePage() {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null); // Ref untuk auto-resize textarea
  const [title, setTitle] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State untuk manajemen Toast Notification
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

  // Proteksi halaman: Pastikan user login
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      }
    };
    checkUser();
  }, [router]);

  // Efek untuk memantau perubahan judul dan menyesuaikan tinggi textarea secara organik
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Fungsi pembantu untuk memunculkan pesan Toast pop-up
  const showToast = (message: string, type: "error" | "success" = "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setCharCount(text.length);
    }
  };

  const handleSavePost = async (statusPublish: boolean) => {
    const content = editorRef.current?.innerHTML || "";

    if (!title.trim() || !content || content === "<br>") {
      showToast("Judul dan konten tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);

    // Proses insert data disesuaikan murni dengan kolom: title, content, status
    // Kolom id, created_at, likes, dan author_id terisi otomatis oleh Supabase default value
    const { error } = await supabase
      .from("posts")
      .insert([
        { 
          title: title.trim(), 
          content,
          status: statusPublish ? "published" : "draft"
        }
      ]);

    setIsSubmitting(false);

    if (error) {
      showToast(`Gagal menyimpan: ${error.message}`, "error");
    } else {
      showToast(statusPublish ? "Tulisan berhasil diterbitkan!" : "Draft berhasil disimpan!", "success");
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    }
  };

  const getTitleFontSize = () => {
    if (title.length > 60) return "text-xl md:text-2xl";
    if (title.length > 30) return "text-2xl md:text-3xl";
    return "text-3xl md:text-4xl";
  };

  return (
    <div className="min-h-screen bg-[#fcfaf2] text-zinc-800 font-sans transition-colors duration-500 relative">
      
      {/* MODAL TOAST POP-UP (Atas Tengah) */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
          <div className={`px-4 py-2 rounded-full text-xs font-mono tracking-wide shadow-md border flex items-center gap-2 backdrop-blur-sm
            ${toast.type === "error" 
              ? "bg-red-50/90 text-red-600 border-red-200/50" 
              : "bg-emerald-50/90 text-emerald-600 border-emerald-200/50"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full current-color animate-ping" 
              style={{ backgroundColor: 'currentColor' }} 
            />
            {toast.message}
          </div>
        </div>
      )}

      {/* Header Navigasi */}
      <nav className="sticky top-0 z-10 bg-[#fcfaf2]/80 backdrop-blur-md p-6 border-b border-zinc-200/60 flex justify-between items-center max-w-4xl mx-auto w-full">
        <Link 
          href="/profile" 
          className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          ← Batal
        </Link>

        <div className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
          {charCount} Karakter
        </div>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleSavePost(false)}
            disabled={isSubmitting}
            className="px-4 py-2 border border-zinc-300 text-zinc-600 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-zinc-100 active:scale-95 transition-all disabled:opacity-50"
          >
            Draft
          </button>

          <button
            type="button"
            onClick={() => handleSavePost(true)}
            disabled={isSubmitting}
            className="px-4 py-2 bg-zinc-800 text-[#fcfaf2] font-bold text-[10px] uppercase tracking-widest rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
          >
            {isSubmitting ? "Proses..." : "Posting"}
          </button>
        </div>
      </nav>

      {/* Area Menulis */}
      <main className="max-w-3xl mx-auto px-8 pt-12 pb-20">
        <div className="space-y-8">
          
          {/* Input Judul Adaptif */}
          <textarea
            ref={titleRef}
            placeholder="Beri Judul Tulisanku..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            rows={1}
            className={`w-full ${getTitleFontSize()} font-serif font-bold bg-transparent border-none outline-none placeholder-zinc-300 focus:ring-0 p-0 text-center text-zinc-800 resize-none overflow-hidden h-auto block`}
          />

          <div className="h-[1px] w-full bg-zinc-200/60"></div>

          {/* Editor Intuitif (ContentEditable) */}
          <div className="w-full relative min-h-[400px]">
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              data-placeholder="Mulai mengetik di sini... (Tekan Enter untuk paragraf baru)"
              className="w-full text-lg font-serif leading-relaxed tracking-wide bg-transparent border-none outline-none focus:ring-0 p-0 zen-editor min-h-[400px]"
            />
          </div>

        </div>
      </main>

      {/* Aturan CSS Spesifik */}
      <style jsx global>{`
        .zen-editor div, 
        .zen-editor p {
          text-indent: 3rem;       
          margin-bottom: 1.5rem;   
          display: block;
          text-align: justify;    
        }

        .zen-editor {
          text-indent: 3rem;       
          padding-bottom: 1.5rem;  
          text-align: justify;    
        }
        
        .zen-editor:has(div) {
          padding-bottom: 0px;
        }
        
        .zen-editor > div:first-of-type {
          margin-top: 1.5rem;      
        }

        .zen-editor:empty:before {
          content: attr(data-placeholder);
          color: #cbd5e1; 
          position: absolute;
          text-indent: 0px; 
          font-style: italic;
          pointer-events: none;
          text-align: left;       
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}