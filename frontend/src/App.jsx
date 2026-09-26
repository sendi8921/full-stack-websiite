import DocumentChatUI from "./DocumentChatUI";
import logoHC from "../../Logo hc.png";

const navItems = [
  {
    label: "Tentang Kami",
    items: ["Profil Perusahaan", "Sejarah", "Visi & Misi", "Nilai Perusahaan"],
  },
  {
    label: "Layanan",
    items: [
      "Transportasi Darat",
      "Transportasi Laut",
      "Transportasi Udara",
      "Pergudangan",
      "Distribusi",
      "Project Cargo",
    ],
  },
  {
    label: "Jaringan",
    items: ["Jaringan & Jangkauan", "Cabang & Hub", "Gudang", "Area Layanan"],
  },
  {
    label: "Publikasi",
    items: ["Berita", "Artikel", "Informasi Perusahaan"],
  },
  {
    label: "Karier",
    items: ["Lowongan", "Kehidupan di Harapan Cipta Logistik"],
  },
  {
    label: "Hubungi Kami",
    items: ["Kontak", "Lokasi", "Formulir Kontak"],
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <img src={logoHC} alt="Harapan Cipta Logistik" className="h-12 w-auto" />

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((menu) => (
              <div key={menu.label} className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-bold uppercase tracking-wide text-[#04163d] transition hover:text-[#f7901f]"
                >
                  {menu.label}
                  <span className="text-[10px]">▼</span>
                </button>

                <div className="invisible absolute left-0 top-full z-20 mt-2 min-w-[220px] rounded-lg bg-white p-2 opacity-0 shadow-lg ring-1 ring-black/5 transition-all duration-150 group-hover:visible group-hover:opacity-100">
                  {menu.items.map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="block rounded-md px-3 py-2 text-sm text-[#04163d] hover:bg-gray-50 hover:text-[#f7901f]"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <button
            type="button"
            className="rounded-xl bg-[#f7901f] px-6 py-3 text-base font-bold text-white transition hover:bg-[#e57f12]"
          >
            Lacak Kiriman
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="mx-auto w-full max-w-5xl">
          <DocumentChatUI />
        </div>
      </main>
    </div>
  );
}
