export default function ProductCard({product}){
    return(
        <div className="bg-white cursor-pointer rounded-2xl shadow-md hover:shadow-xl transition flex flex-col overflow-hidden border border-gray-100">
            <div className="relative">
                <img
                src={product.image}
                alt={product.title}
                className="h-56 w-full object-contain bg-gray-50"
                />
                <span className="absolute top-2 left-2 bg-orange-400 text-white text-xs px-2 py-0.5 rounded">{product.category}</span>
            </div>
            <div className="flex-1 flex flex-col px-4 py-3 gap-1">
                <h3 className="font-semibold text-md truncate">{product.title}</h3>
                <span className="text-sm text-gray-500">{product.brand}</span>
                <span className="text-gray-600 text-xs">{product.description}</span>
                <div className="flex items-end justify-between mt-2">
                <span className="text-xl font-bold text-orange-400">{product.price} <span className="text-base font-medium">{product.currency}</span></span>
                <span className="text-xs text-gray-400">{product.stock} adet</span>
                </div>
            </div>
        </div>
    );
}