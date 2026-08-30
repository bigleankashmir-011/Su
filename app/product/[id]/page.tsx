"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string; name: string; description: string | null; price: number;
  mrp: number | null; size: string | null; stock: number;
  imageUrl: string | null; images: string[];
  category: { id: string; name: string; slug: string };
};
type CartItem = { id: string; name: string; price: number; qty: number; image: string | null };

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("bl_cart") || "[]"); } catch { return []; }
}
function saveCart(cart: CartItem[]) {
  localStorage.setItem("bl_cart", JSON.stringify(cart));
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${params.id}`).then(r => r.json()).then(p => {
      setProduct(p);
      fetch("/api/products").then(r => r.json()).then((all: Product[]) => {
        setRelated(all.filter(x => x.id !== p.id && x.category?.id === p.category?.id).slice(0, 4));
      });
    });
    setCartCount(loadCart().reduce((s, i) => s + i.qty, 0));
  }, [params.id]);

  function addToCart() {
    if (!product) return;
    const cart = loadCart();
    const found = cart.find(i => i.id === product.id);
    const next = found
      ? cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      : [...cart, { id: product.id, name: product.name, price: product.price, qty: 1, image: product.imageUrl }];
    saveCart(next);
    setCartCount(next.reduce((s, i) => s + i.qty, 0));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  if (!product) {
    return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-[#6B6B72] text-sm">Loading...</div>;
  }

  const gallery = product.images?.length ? product.images : (product.imageUrl ? [product.imageUrl] : []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F0F10] pb-28" style={{ fontFamily: "system-ui, sans-serif" }}>
      <header className="sticky top-0 z-50 bg-white border-b border-[#ECECEE] flex items-center justify-between px-4 py-3.5">
        <Link href="/" className="w-9 h-9 rounded-full bg-[#FAFAFA] flex items-center justify-center text-base">←</Link>
        <p className="font-black text-[13px]">Product Details</p>
        <Link href="/" className="w-9 h-9 rounded-full bg-[#FAFAFA] flex items-center justify-center relative text-base">
          🛍️
          {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#FFB800] text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
        </Link>
      </header>

      <div className="bg-white">
        <div className="h-[260px] flex items-center justify-center bg-[#FAFAFA]">
          {gallery.length > 0 ? (
            <img src={gallery[activeImg]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-24 h-40 rounded-2xl relative" style={{ background: "linear-gradient(155deg,#2a2a2c,#111112)" }}>
              <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-20 h-4 rounded-lg" style={{ background: "#FFB800" }}></div>
            </div>
          )}
        </div>
        {gallery.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {gallery.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${activeImg===i ? "border-black" : "border-[#ECECEE]"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        <p className="text-[10px] text-[#6B6B72] uppercase font-bold tracking-wide">{product.category?.name}</p>
        <h1 className="text-xl font-black mt-1">{product.name}</h1>
        {product.size && <p className="text-[13px] text-[#6B6B72] mt-1">{product.size}</p>}

        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-2xl font-black">₹{product.price}</span>
          {product.mrp && <span className="text-sm text-[#6B6B72] line-through">₹{product.mrp}</span>}
          {product.mrp && <span className="text-xs font-bold text-[#1a9b52]">{Math.round((1 - product.price / product.mrp) * 100)}% OFF</span>}
        </div>

        <p className={`text-xs font-bold mt-2 ${product.stock > 0 ? "text-[#1a9b52]" : "text-red-500"}`}>
          {product.stock > 0 ? "✓ In Stock" : "Out of Stock"}
        </p>

        {product.description && (
          <div className="mt-5">
            <h3 className="text-[13px] font-black mb-2">Product Description</h3>
            <p className="text-[13px] text-[#6B6B72] leading-relaxed">{product.description}</p>
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mt-5 border-t border-b border-[#ECECEE] py-4">
          {[["🛡️","Safe Payments"],["🚚","Fast Delivery"],["✅","Authentic"],["↩️","Easy Return"]].map(([ic,label],i)=>(
            <div key={i} className="text-center">
              <div className="text-base">{ic}</div>
              <p className="text-[8.5px] text-[#6B6B72] mt-1 font-semibold leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center px-4 pb-3">
            <span className="w-1 h-[15px] bg-[#FFB800] rounded mr-2"></span>
            <h2 className="text-[15px] font-black">You May Also Like</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2">
            {related.map(r => (
              <Link key={r.id} href={`/product/${r.id}`} className="shrink-0 w-[140px] bg-white border border-[#ECECEE] rounded-[14px] p-2.5">
                <div className="h-20 flex items-center justify-center mb-2 bg-[#FAFAFA] rounded-lg overflow-hidden">
                  {r.imageUrl ? <img src={r.imageUrl} alt={r.name} className="w-full h-full object-cover" /> :
                    <div className="w-8 h-12 rounded-md" style={{background:"linear-gradient(155deg,#2a2a2c,#111112)"}}></div>}
                </div>
                <p className="text-[11.5px] font-extrabold leading-tight">{r.name}</p>
                <p className="text-[13px] font-black mt-1">₹{r.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#ECECEE] p-4 flex gap-3 max-w-[520px] mx-auto z-50">
        <button onClick={addToCart} className="flex-1 bg-white border-2 border-black text-black font-extrabold text-[13px] py-3 rounded-xl">
          {added ? "✓ Added" : "Add to Cart"}
        </button>
        <Link href="/" onClick={addToCart} className="flex-1 bg-[#FFB800] text-black font-extrabold text-[13px] py-3 rounded-xl text-center">
          Buy Now
        </Link>
      </div>
    </div>
  );
  }
