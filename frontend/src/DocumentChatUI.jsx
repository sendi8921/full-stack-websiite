import { useState, useRef, useEffect, useCallback } from "react";
import { FileText, Upload, Send, ChevronDown, Plus, Quote, Loader2 } from "lucide-react";
import {
  fetchDocuments,
  uploadDocument,
  startConversation,
  fetchMessages,
  askQuestion,
} from "./api";

const COLORS = {
  ink: "#1B2A38",
  inkSoft: "#28394A",
  paper: "#F1EDE3",
  paperDeep: "#E9E3D3",
  line: "#D8D2C0",
  lineOnInk: "#3A4C5E",
  textDark: "#20242A",
  textMuted: "#6B6558",
  gold: "#A9782F",
  goldSoft: "#EFE2C4",
};

function Sidebar({ documents, activeDocId, setActiveDocId, onUploadClick, uploading }) {
  return (
    <div
      className="hidden md:flex md:w-72 flex-col shrink-0 h-full"
      style={{ background: COLORS.ink, color: COLORS.paper }}
    >
      <div className="px-5 pt-6 pb-4">
        <p className="font-sans text-[11px] tracking-wide" style={{ color: "#8FA0AF" }}>
          Document Q&amp;A
        </p>
        <h1 className="font-serif text-xl mt-1 leading-snug">Ruang Baca</h1>
      </div>

      <button
        onClick={onUploadClick}
        disabled={uploading}
        className="mx-5 mb-4 flex items-center justify-center gap-2 rounded-md py-2.5 font-sans text-sm transition-colors disabled:opacity-60"
        style={{ background: COLORS.goldSoft, color: COLORS.ink }}
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
        {uploading ? "Mengunggah…" : "Unggah dokumen"}
      </button>

      <div className="flex-1 overflow-y-auto px-3">
        <p className="px-2 mb-2 font-sans text-[11px] tracking-wide" style={{ color: "#6E8092" }}>
          DOKUMEN KAMU
        </p>
        <div className="flex flex-col gap-1">
          {documents.length === 0 && (
            <p className="px-3 py-2 font-sans text-[12px]" style={{ color: "#6E8092" }}>
              Belum ada dokumen. Unggah PDF dulu untuk mulai chat.
            </p>
          )}
          {documents.map((doc) => {
            const active = doc.id === activeDocId;
            const ready = doc.status === "ready";
            return (
              <button
                key={doc.id}
                onClick={() => ready && setActiveDocId(doc.id)}
                className="text-left rounded-md px-3 py-2.5 transition-colors"
                style={{
                  background: active ? COLORS.inkSoft : "transparent",
                  borderLeft: active ? `2px solid ${COLORS.gold}` : "2px solid transparent",
                  opacity: ready ? 1 : 0.55,
                  cursor: ready ? "pointer" : "default",
                }}
              >
                <div className="flex items-start gap-2">
                  <FileText size={15} className="mt-0.5 shrink-0" style={{ color: COLORS.gold }} />
                  <div className="min-w-0">
                    <p className="font-sans text-[13px] leading-snug truncate">{doc.title}</p>
                    <p className="font-sans text-[11px] mt-0.5" style={{ color: "#7C8D9D" }}>
                      {doc.status === "processing" && "Memproses…"}
                      {doc.status === "failed" && "Gagal diproses"}
                      {doc.status === "ready" && `${doc.page_count} halaman`}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 py-4 font-sans text-[11px]" style={{ color: "#5E7182", borderTop: `1px solid ${COLORS.lineOnInk}` }}>
        Jawaban selalu disertai kutipan halaman sumber.
      </div>
    </div>
  );
}

function CitationChip({ citation, expanded, onToggle }) {
  return (
    <div className="rounded-md overflow-hidden" style={{ border: `1px solid ${COLORS.line}` }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 font-sans text-[12px]"
        style={{ background: expanded ? COLORS.goldSoft : "transparent", color: COLORS.textMuted }}
      >
        <span className="flex items-center gap-1.5">
          <Quote size={12} style={{ color: COLORS.gold }} />
          Halaman {citation.page}
        </span>
        <ChevronDown
          size={14}
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 150ms" }}
        />
      </button>
      {expanded && (
        <p
          className="font-serif text-[13px] leading-relaxed px-3 py-2.5"
          style={{ color: COLORS.textDark, background: COLORS.paperDeep }}
        >
          &ldquo;{citation.snippet}&rdquo;
        </p>
      )}
    </div>
  );
}

function Message({ msg, msgIndex, expandedCitation, setExpandedCitation }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[80%] md:max-w-[65%] rounded-lg rounded-tr-sm px-4 py-2.5 font-sans text-[14px] leading-relaxed"
          style={{ background: COLORS.ink, color: COLORS.paper }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] md:max-w-[70%] flex flex-col gap-2.5">
        <p className="font-serif text-[15px] leading-relaxed" style={{ color: COLORS.textDark }}>
          {msg.content}
        </p>
        {msg.citations && msg.citations.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-0.5">
            {msg.citations.map((c, i) => {
              const key = `${msgIndex}-${i}`;
              return (
                <CitationChip
                  key={key}
                  citation={c}
                  expanded={expandedCitation === key}
                  onToggle={() => setExpandedCitation(expandedCitation === key ? null : key)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentChatUI() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [expandedCitation, setExpandedCitation] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (e) {
      setError("Gagal memuat daftar dokumen. Pastikan backend berjalan.");
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    // Poll tiap 4 detik selagi ada dokumen yang masih "processing"
    const interval = setInterval(loadDocuments, 4000);
    return () => clearInterval(interval);
  }, [loadDocuments]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      await uploadDocument(file);
      await loadDocuments();
    } catch (e) {
      setError("Upload gagal. Cek ukuran file (maks 20MB) dan format harus PDF.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const openDocument = async (docId) => {
    setActiveDocId(docId);
    setMessages([]);
    setError(null);
    try {
      const conversation = await startConversation(docId);
      setConversationId(conversation.id);
      const history = await fetchMessages(conversation.id);
      setMessages(history);
    } catch (e) {
      setError("Gagal membuka percakapan untuk dokumen ini.");
    }
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || !conversationId) return;

    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setThinking(true);
    setError(null);

    try {
      const answer = await askQuestion(conversationId, question);
      setMessages((prev) => [...prev, answer]);
    } catch (e) {
      setError("Gagal mendapat jawaban. Coba lagi sebentar.");
    } finally {
      setThinking(false);
    }
  };

  const activeDoc = documents.find((d) => d.id === activeDocId);

  return (
    <div
      className="flex w-full h-[640px] rounded-xl overflow-hidden"
      style={{ background: COLORS.paper, border: `1px solid ${COLORS.line}` }}
    >
      <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />

      <Sidebar
        documents={documents}
        activeDocId={activeDocId}
        setActiveDocId={openDocument}
        onUploadClick={handleUploadClick}
        uploading={uploading}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 md:px-8 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
          <div className="min-w-0">
            <p className="font-sans text-[11px] tracking-wide" style={{ color: COLORS.textMuted }}>
              SEDANG DIBACA
            </p>
            <h2 className="font-serif text-[16px] truncate" style={{ color: COLORS.textDark }}>
              {activeDoc ? activeDoc.title : "Pilih dokumen di sebelah kiri"}
            </h2>
          </div>
          <button
            className="hidden sm:flex items-center gap-1.5 rounded-md px-3 py-1.5 font-sans text-[12px] shrink-0"
            style={{ border: `1px solid ${COLORS.line}`, color: COLORS.textMuted }}
          >
            <Plus size={13} />
            Percakapan baru
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 md:px-8 py-6 flex flex-col gap-5">
          {!activeDoc && (
            <p className="font-sans text-[13px]" style={{ color: COLORS.textMuted }}>
              Unggah PDF di sidebar, lalu pilih dokumennya untuk mulai bertanya.
            </p>
          )}
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} msgIndex={i} expandedCitation={expandedCitation} setExpandedCitation={setExpandedCitation} />
          ))}
          {thinking && (
            <div className="flex items-center gap-2 font-sans text-[13px]" style={{ color: COLORS.textMuted }}>
              <Loader2 size={14} className="animate-spin" />
              Menelusuri dokumen…
            </div>
          )}
          {error && (
            <p className="font-sans text-[12px]" style={{ color: "#B24545" }}>
              {error}
            </p>
          )}
        </div>

        <div className="px-5 md:px-8 py-4" style={{ borderTop: `1px solid ${COLORS.line}` }}>
          <div className="flex items-end gap-2 rounded-lg px-3 py-2" style={{ background: COLORS.paperDeep, border: `1px solid ${COLORS.line}` }}>
            <textarea
              rows={1}
              value={input}
              disabled={!activeDoc}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={activeDoc ? "Tanyakan sesuatu tentang dokumen ini…" : "Pilih dokumen dulu…"}
              className="flex-1 bg-transparent resize-none outline-none font-sans text-[14px] py-1.5 disabled:opacity-50"
              style={{ color: COLORS.textDark }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !activeDoc}
              className="rounded-md p-2 shrink-0 transition-opacity"
              style={{ background: COLORS.ink, color: COLORS.paper, opacity: input.trim() && activeDoc ? 1 : 0.4 }}
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
