"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Product = {
  id: string; name: string; description: string | null; price: number;
  mrp: number | null; size: string | null; imageUrl: string | null;
  category: { name: string; slug: string };
};
type CartItem = { id: string; name: string; price: number; qty: number; image: string | null };

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("bl_cart") || "[]"); } catch { return []; }
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [drawer, setDrawer] = useState<"closed" | "cart" | "checkout" | "success">("closed");
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", city: "", pincode: "" });
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetch("/api/products").then(r => r.json()).then(setProducts).catch(() => {});
    setCart(loadCart());
  }, []);
  useEffect(() => { localStorage.setItem("bl_cart", JSON.stringify(cart)); }, [cart]);

  const categories = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean)));
  const shown = activeCat === "all" ? products : products.filter(p => p.category?.name === activeCat);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  function addToCart(p: Product) {
    setCart(c => {
      const found = c.find(i => i.id === p.id);
      if (found) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id: p.id, name: p.name, price: p.price, qty: 1, image: p.imageUrl }];
    });
  }
  function changeQty(id: string, delta: number) {
    setCart(c => c.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  }

  async function placeOrder() {
    if (!form.customerName || !form.phone || !form.address || !form.city || !form.pincode) {
      alert("Please fill all delivery details.");
      return;
    }
    setPlacing(true);
    await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items: cart.map(i => ({ productId: i.id, quantity: i.qty })) }),
    });
    setPlacing(false);
    setCart([]);
    setDrawer("success");
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0F0F10] pb-24" style={{ fontFamily: "system-ui, sans-serif" }}>
      <header className="sticky top-0 z-50 bg-white border-b border-[#ECECEE]">
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] rounded-lg bg-black text-[#FFB800] flex items-center justify-center font-black text-sm">BL</div>
            <div>
              <p className="font-black text-[15px] leading-none">BIG LEAN</p>
              <p className="text-[8.5px] font-bold tracking-[.18em] text-[#6B6B72] mt-0.5">SUPPLEMENTS · KASHMIR</p>
            </div>
          </div>
          <button onClick={() => setDrawer("cart")} className="w-9 h-9 rounded-full bg-[#FAFAFA] flex items-center justify-center relative text-base">
            🛍️
            {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-[#FFB800] text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>}
          </button>
        </div>
        <div className="mx-4 mb-3.5 bg-[#FAFAFA] border border-[#ECECEE] rounded-[10px] px-3.5 py-2.5 text-[13px] text-[#6B6B72]">🔍 Search whey, creatine, gainers...</div>
      </header>

      <div className="mx-4 mt-3.5 rounded-2xl bg-gradient-to-br from-[#141414] to-black p-[18px] relative overflow-hidden">
        <span className="inline-flex items-center gap-1 bg-[#FFB800] text-black text-[9.5px] font-extrabold tracking-wider px-2.5 py-1 rounded-full">📅 UPCOMING EVENT</span>
        <p className="text-white text-lg font-black mt-2.5 leading-tight">Grand Store Anniversary Sale</p>
        <p className="text-[#c8c8ca] text-[11.5px] mt-1.5">Flat discounts across Whey, Creatine &amp; Gainers — dates announced soon.</p>
        <button className="inline-block mt-3 bg-[#FFB800] text-black font-extrabold text-xs px-4 py-2 rounded-full">Notify Me</button>
      </div>

      <div className="grid grid-cols-4 border-t border-b border-[#ECECEE] mt-4">
        {[["🛡️","Safe & Secure Payments"],["🚚","Fast Delivery Pan-India"],["✅","Authenticity Guaranteed"],["↩️","Easy Replacement"]].map(([ic,label],i)=>(
          <div key={i} className={`py-4 px-1.5 text-center ${i<3?"border-r border-[#ECECEE]":""}`}>
            <div className="text-[19px]">{ic}</div>
            <p className="text-[9.5px] text-[#6B6B72] mt-1.5 font-semibold leading-tight">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center px-4 pt-[22px] pb-3">
        <span className="w-1 h-[15px] bg-[#FFB800] rounded mr-2"></span>
        <h2 className="text-[17px] font-black">Shop by Category</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 [&::-webkit-scrollbar]:hidden">
        <button onClick={()=>setActiveCat("all")} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${activeCat==="all"?"bg-black text-[#FFB800] border-black":"border-[#ECECEE]"}`}>All</button>
        {categories.map(c => (
          <button key={c} onClick={()=>setActiveCat(c!)} className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border whitespace-nowrap ${activeCat===c?"bg-black text-[#FFB800] border-black":"border-[#ECECEE]"}`}>{c}</button>
        ))}
      </div>

      <div className="flex items-center px-4 pt-2 pb-3">
        <span className="w-1 h-[15px] bg-[#FFB800] rounded mr-2"></span>
        <h2 className="text-[17px] font-black">Products</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 px-4">
        {shown.map(p => (
          <div key={p.id} className="bg-white border border-[#ECECEE] rounded-[14px] p-3 relative">
            <Link href={`/product/${p.id}`}>
              <div className="h-[100px] flex items-center justify-center mb-2 bg-[#FAFAFA] rounded-[10px] overflow-hidden">
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> :
                  <div className="w-11 h-[66px] rounded-[9px] relative" style={{background:"linear-gradient(155deg,#2a2a2c,#111112)"}}>
                    <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-9 h-2 rounded" style={{background:"#FFB800"}}></div>
                  </div>}
              </div>
              <p className="text-[9px] text-[#6B6B72] uppercase font-bold">{p.category?.name}</p>
              <p className="text-[13px] font-extrabold mt-0.5 leading-tight">{p.name}</p>
              <p className="text-[10px] text-[#6B6B72] mt-0.5">{p.size}</p>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-[15px] font-black">₹{p.price}</span>
                {p.mrp && <span className="text-[11px] text-[#6B6B72] line-through">₹{p.mrp}</span>}
              </div>
            </Link>
            <div className="flex flex-col gap-1.5 mt-2.5">
              <button onClick={()=>addToCart(p)} className="bg-white border-[1.4px] border-black text-black text-[11px] font-extrabold py-2 rounded-lg">ADD TO CART</button>
              <button onClick={()=>{addToCart(p);setDrawer("checkout");}} className="bg-[#FFB800] text-black text-[11px] font-extrabold py-2 rounded-lg">BUY NOW</button>
            </div>
          </div>
        ))}
        {shown.length===0 && <p className="col-span-2 text-center text-[#6B6B72] text-sm py-10">No products in this category yet.</p>}
      </div>

      <footer className="px-4 pt-7 pb-24 border-t border-[#ECECEE] mt-6 bg-[#FAFAFA]">
        <p className="font-black text-sm mb-2">BIG LEAN <span className="text-[#8a5c00]">KASHMIR</span></p>
        <p className="text-[11.5px] text-[#6B6B72] leading-relaxed">Genuine fitness and bodybuilding supplements. Visit us in Kulgam or order online — delivered anywhere in India.</p>
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>
            <p className="text-[10.5px] font-extrabold tracking-wider mb-2">OUTLETS</p>
            <p className="text-[11.5px] text-[#6B6B72]">Kulgam Town — Main Market</p>
            <p className="text-[11.5px] text-[#6B6B72]">D.H. Pora (Noorabad), Kulgam</p>
          </div>
          <div>
            <p className="text-[10.5px] font-extrabold tracking-wider mb-2">CONTACT</p>
            <p className="text-[11.5px] text-[#6B6B72]">+91 7006208990</p>
            <p className="text-[11.5px] text-[#6B6B72]">+91 9149860957</p>
          </div>
        </div>
      </footer>

      {cartCount > 0 && drawer==="closed" && (
        <button onClick={()=>setDrawer("cart")} className="fixed bottom-3.5 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[488px] bg-black text-[#FFB800] rounded-2xl px-[18px] py-3.5 flex items-center justify-between font-extrabold text-[13px] z-[60] shadow-xl">
          <span>{cartCount} item{cartCount>1?"s":""} in cart</span>
          <span>View Cart →</span>
        </button>
      )}

      {drawer !== "closed" && (
        <div className="fixed inset-0 z-[70]">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setDrawer("closed")}></div>
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-[400px] bg-white flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#ECECEE]">
              <h3 className="text-base font-black">{drawer==="checkout"?"Checkout":drawer==="success"?"Order Confirmed":"Your Cart"}</h3>
              <button onClick={()=>setDrawer("closed")} className="w-8 h-8 rounded-full bg-[#FAFAFA]">✕</button>
            </div>

            {drawer==="cart" && (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  {cart.length===0 ? <p className="text-[#6B6B72] text-sm py-10 text-center">Your cart is empty.</p> :
                    cart.map(i=>(
                      <div key={i.id} className="flex gap-2.5 py-3 border-b border-[#ECECEE]">
                        <div className="w-[46px] h-[62px] rounded-lg bg-[#111112] shrink-0"></div>
                        <div className="flex-1">
                          <p className="text-[12.5px] font-extrabold">{i.name}</p>
                          <p className="text-[11px] text-[#6B6B72]">₹{i.price}</p>
                          <div className="flex items-center gap-2.5 mt-1.5">
                            <button onClick={()=>changeQty(i.id,-1)} className="w-6 h-6 rounded-full border border-[#ECECEE] text-xs">−</button>
                            <span className="text-xs font-bold">{i.qty}</span>
                            <button onClick={()=>changeQty(i.id,1)} className="w-6 h-6 rounded-full border border-[#ECECEE] text-xs">+</button>
                          </div>
                        </div>
                        <p className="font-black text-[13px]">₹{i.price*i.qty}</p>
                      </div>
                    ))}
                </div>
                <div className="border-t border-[#ECECEE] p-4">
                  <div className="flex justify-between text-[12.5px] text-[#6B6B72] mb-1.5"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                  <div className="flex justify-between text-sm font-black mt-2 mb-3"><span>To Pay</span><span>₹{cartTotal}</span></div>
                  <button onClick={()=>setDrawer("checkout")} disabled={cart.length===0} className="w-full bg-[#FFB800] font-extrabold text-[13.5px] py-3.5 rounded-xl disabled:opacity-40">Proceed to Checkout</button>
                </div>
              </>
            )}

            {drawer==="checkout" && (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                <label className="text-[11px] text-[#6B6B72] font-bold">Full Name</label>
                <input value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})} className="bg-[#FAFAFA] border border-[#ECECEE] rounded-lg px-3 py-2.5 text-sm" />
                <label className="text-[11px] text-[#6B6B72] font-bold">Phone Number</label>
                <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} className="bg-[#FAFAFA] border border-[#ECECEE] rounded-lg px-3 py-2.5 text-sm" />
                <label className="text-[11px] text-[#6B6B72] font-bold">Delivery Address</label>
                <textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})} rows={2} className="bg-[#FAFAFA] border border-[#ECECEE] rounded-lg px-3 py-2.5 text-sm" />
                <label className="text-[11px] text-[#6B6B72] font-bold">City</label>
                <input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} className="bg-[#FAFAFA] border border-[#ECECEE] rounded-lg px-3 py-2.5 text-sm" />
                <label className="text-[11px] text-[#6B6B72] font-bold">Pincode</label>
                <input value={form.pincode} onChange={e=>setForm({...form,pincode:e.target.value})} className="bg-[#FAFAFA] border border-[#ECECEE] rounded-lg px-3 py-2.5 text-sm" />
                <div className="text-[11px] text-[#8a5c00] bg-[#FFF3D6] px-2.5 py-2 rounded-lg mt-1">💵 Pay on Delivery — no online payment needed right now.</div>
                <button onClick={placeOrder} disabled={placing} className="mt-1 bg-[#FFB800] font-extrabold text-[13.5px] py-3.5 rounded-xl disabled:opacity-50">{placing?"Placing Order...":`Place Order — ₹${cartTotal} COD`}</button>
              </div>
            )}

            {drawer==="success" && (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-[58px] h-[58px] rounded-full bg-black text-[#FFB800] text-2xl flex items-center justify-center mb-4">✓</div>
                <h3 className="text-base font-black">Order Placed!</h3>
                <p className="text-xs text-[#6B6B72] mt-1.5">We'll call you to confirm delivery. Thank you for shopping with Big Lean Kashmir.</p>
                <button onClick={()=>setDrawer("closed")} className="mt-6 bg-black text-[#FFB800] font-extrabold text-xs px-5 py-2.5 rounded-full">Continue Shopping</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
            }
