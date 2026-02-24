export default function Catalog() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Поиск */}
      <input
        type="text"
        placeholder="Поиск товара..."
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-3 text-lg mb-6 focus:outline-none focus:border-[#f20019]"
      />

      {/* Фильтры-чипы */}
      <div className="flex gap-2 flex-wrap mb-8">
        {["Все", "Морепродукты", "Снеки", "Закуски", "В наличии", "Акции"].map((tag) => (
          <button key={tag} className="px-5 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-full text-sm">
            {tag}
          </button>
        ))}
      </div>

      {/* Grid товаров (пока моки) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1,2,3,4,5,6,7,8].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="h-48 bg-gray-800 flex items-center justify-center text-6xl">🐟</div>
            <div className="p-4">
              <div className="font-medium mb-1">Стейк лосося {i}</div>
              <div className="text-[#f20019] font-bold">890 ₽ / кг</div>
              <button className="mt-3 w-full bg-[#f20019] hover:bg-red-600 py-3 rounded-xl font-medium transition-colors">
                + В корзину
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
