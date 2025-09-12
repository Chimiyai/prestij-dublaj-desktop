// src/App.tsx

function App() {
  return (
    // Tam ekran, koyu gri arka plan, ortalanmış içerik
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 font-sans">
      
      {/* Büyük, kalın ve mor bir başlık */}
      <h1 className="text-5xl font-extrabold text-indigo-400">
        Tailwind Testi Başarılı!
      </h1>

      {/* Normal bir açıklama metni */}
      <p className="mt-4 text-lg text-gray-300">
        Eğer bu yazıyı renkli, büyük ve ortalanmış görüyorsanız, Tailwind CSS doğru bir şekilde çalışıyor demektir.
      </p>

      {/* Hover efekti olan bir test butonu */}
      <button 
        type="button"
        className="mt-8 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 hover:scale-105 transition-all duration-200"
      >
        Hover Test Butonu
      </button>

    </div>
  )
}

export default App