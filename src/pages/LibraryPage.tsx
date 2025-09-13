// src/pages/LibraryPage.tsx
// Bu dosya eski HomePage içeriğinizi barındırabilir.
// Şimdilik basit bir iskelet koyalım.

export default function LibraryPage() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Kütüphane</h1>
      {/* TODO: Buraya sekmeler (Ücretli Oyunlar, Ücretsiz Oyunlar) ve proje listesi gelecek */}
      <div className="text-center mt-16 text-prestij-text-muted">
        <p>Kütüphanenizdeki projeler burada listelenecek.</p>
      </div>
    </div>
  );
}