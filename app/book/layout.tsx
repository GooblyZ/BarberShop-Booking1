export default function BookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#100c08]">
      {children}
    </div>
  );
}
