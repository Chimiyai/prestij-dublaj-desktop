// src/pages/DiscoverPage.tsx
export default function DiscoverPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Keşfet</h1>
      {/* TODO: Buraya filtreler (Ücretli, Ücretsiz, Kategori vb.) ve proje listesi gelecek */}
      <div className="text-center mt-16 text-prestij-text-muted">
        <p>Yeni projeleri buradan keşfedebilirsiniz.</p>
      </div>
    </div>
  );
}