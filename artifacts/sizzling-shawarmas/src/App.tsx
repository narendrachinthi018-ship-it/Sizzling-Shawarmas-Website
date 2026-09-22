import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock3, ExternalLink, Flame, Image as ImageIcon, Instagram, MapPin, Minus, Navigation, Phone, Play, Plus, Search, ShoppingBag, Star, Utensils, Video, X } from 'lucide-react';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

type Category = 'All' | 'Shawarma' | 'Biryani' | 'Mandi' | 'Drinks' | 'Veg';
type MenuItem = {
  id: string;
  name: string;
  category: Exclude<Category, 'All' | 'Veg'>;
  description: string;
  price: number | null;
  image: string;
  veg?: boolean;
  spicy?: boolean;
  tag?: string;
};
type CartLine = { item: MenuItem; quantity: number };

const queryClient = new QueryClient();
const WHATSAPP_NUMBER = '919963621739';
const PHONE_DISPLAY = '+91 99636 21739';
const ADDRESS = '127/A, Road No. 6, Opposite JNTU, Addagutta, Samatha Nagar, Kukatpally, Hyderabad, Telangana 500085';
const HOURS_LABEL = 'Open today · closes at 12:30 am';
const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/2iiHmZdz7yzBJcfo9';
const PROMO_HEADLINE = 'Your next craving is waiting.';
const PROMO_COPY = 'Fresh food. Big flavours. Budget-friendly prices.';

const menu: MenuItem[] = [
  { id: 'classic-shawarma', name: 'Classic Chicken Shawarma', category: 'Shawarma', description: 'Slow-roasted chicken, toum, pickles, cabbage and a warm saj wrap.', price: null, image: '/shawarma-hero.jpg', tag: 'House favourite' },
  { id: 'zesty-shawarma', name: 'Zesty Peri Peri Shawarma', category: 'Shawarma', description: 'Charred chicken, peri peri dust, crisp lettuce and a bright lemon finish.', price: null, image: '/grill.jpg', spicy: true },
  { id: 'paneer-shawarma', name: 'Smoky Paneer Shawarma', category: 'Shawarma', description: 'Tandoori paneer, mint mayo, sumac onions and crunchy greens in saj.', price: null, image: '/biryani.jpg', veg: true },
  { id: 'chicken-biryani', name: 'Hyderabadi Chicken Biryani', category: 'Biryani', description: 'Long-grain basmati layered with spiced chicken, saffron and fried onions.', price: null, image: '/biryani.jpg', tag: 'Slow cooked', spicy: true },
  { id: 'mutton-biryani', name: 'Mutton Dum Biryani', category: 'Biryani', description: 'Tender mutton, fragrant rice and whole spices sealed for a proper dum.', price: null, image: '/biryani.jpg', spicy: true },
  { id: 'veg-biryani', name: 'Garden Veg Biryani', category: 'Biryani', description: 'Seasonal vegetables, saffron rice, fried onions and a cooling raita.', price: null, image: '/biryani.jpg', veg: true },
  { id: 'malai-tikka', name: 'Malai Chicken Tikka', category: 'Mandi', description: 'Creamy, tender chicken tikka finished over a hot charcoal grill.', price: null, image: '/grill.jpg', tag: 'Charcoal grill' },
  { id: 'seekh-kebab', name: 'Lucknowi Seekh Kebab', category: 'Mandi', description: 'Minced lamb, green chilli and warm spices shaped, skewered and grilled.', price: null, image: '/grill.jpg', spicy: true },
  { id: 'loaded-fries', name: 'Loaded Masala Fries', category: 'Mandi', description: 'Crisp fries, garlic sauce, pickled jalapeños and our house masala.', price: null, image: '/shawarma-hero.jpg', veg: true },
  { id: 'garlic-bread', name: 'Charred Garlic Bread', category: 'Mandi', description: 'Buttery flatbread with roasted garlic, herbs and a little char.', price: null, image: '/shawarma-hero.jpg', veg: true },
  { id: 'mint-lime', name: 'Mint Lime Cooler', category: 'Drinks', description: 'Fresh mint, lime and a little fizz. Built for Hyderabad heat.', price: null, image: '/grill.jpg', veg: true },
  { id: 'salted-lassi', name: 'Salted Lassi', category: 'Drinks', description: 'Chilled, lightly salted yoghurt drink with roasted cumin.', price: null, image: '/biryani.jpg', veg: true },
];

const gallery = [
  { image: '/shawarma-hero.jpg', label: 'The wrap station' },
  { image: '/biryani.jpg', label: 'Dum, sealed tight' },
  { image: '/grill.jpg', label: 'Over live charcoal' },
];

function money(value: number | null) {
  return value === null ? 'Price pending' : `₹${value.toLocaleString('en-IN')}`;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <RoutedErrorBoundary>
            <Switch>
              <Route path="/" component={Home} />
              <Route component={NotFound} />
            </Switch>
          </RoutedErrorBoundary>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>(() => {
    try {
      const saved = localStorage.getItem('sizzling-cart');
      return saved ? JSON.parse(saved) as CartLine[] : [];
    } catch {
      return [];
    }
  });
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [orderSent, setOrderSent] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const reviewSlides = [
    { eyebrow: 'Verified Google rating', headline: '4.7 / 5', body: '15 reviews are currently listed on Google. Read the original customer feedback before you order.' },
    { eyebrow: 'Keep it honest', headline: 'Real guests only', body: 'Review highlights will be added here only when the restaurant owner supplies or verifies them.' },
  ];

  const filteredMenu = useMemo(() => menu.filter((item) => {
    const matchesCategory = activeCategory === 'All' || (activeCategory === 'Veg' ? item.veg === true : item.category === activeCategory);
    const searchable = `${item.name} ${item.description} ${item.category}`.toLowerCase();
    return matchesCategory && searchable.includes(query.toLowerCase());
  }), [activeCategory, query]);

  const cartCount = cart.reduce((total, line) => total + line.quantity, 0);
  const cartHasPendingPrices = cart.some((line) => line.item.price === null);
  const cartTotal = cart.reduce((total, line) => total + (line.item.price ?? 0) * line.quantity, 0);
  const cartTotalLabel = cartHasPendingPrices ? 'Price pending' : money(cartTotal);

  useEffect(() => {
    localStorage.setItem('sizzling-cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(item: MenuItem, quantity = 1) {
    setCart((current) => {
      const existing = current.find((line) => line.item.id === item.id);
      if (existing) return current.map((line) => line.item.id === item.id ? { ...line, quantity: line.quantity + quantity } : line);
      return [...current, { item, quantity }];
    });
    setSelectedItem(null);
  }

  function changeQuantity(id: string, delta: number) {
    setCart((current) => current.flatMap((line) => {
      if (line.item.id !== id) return [line];
      const quantity = line.quantity + delta;
      return quantity > 0 ? [{ ...line, quantity }] : [];
    }));
  }

  function sendWhatsApp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '');
    const phone = String(form.get('phone') || '');
    const orderType = String(form.get('orderType') || 'Delivery');
    const address = String(form.get('address') || '');
    const instructions = String(form.get('instructions') || '');
    const lines = cart.map((line) => `${line.item.name} × ${line.quantity} — ${money(line.item.price === null ? null : line.item.price * line.quantity)}`).join('\n');
    const message = `Hello Sizzling Shawarmas!\n\nOrder for: ${name}\nPhone: ${phone}\n${orderType}: ${address}\nSpecial instructions: ${instructions || 'None'}\n\n${lines}\n\nEstimated total: ${cartTotalLabel}\n\nPlease confirm availability and final total.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setOrderSent(true);
  }

  return (
    <div className="texture min-h-[100dvh] overflow-x-hidden bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
          <a href="#top" className="flex items-center gap-3" data-testid="link-home">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-background"><Flame size={21} strokeWidth={2.5} /></span>
            <span className="leading-none">
              <span className="block font-display text-lg font-semibold tracking-tight text-foreground">Sizzling</span>
              <span className="font-mono-ui text-[9px] uppercase tracking-[.24em] text-primary">shawarmas & biryanis</span>
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex" aria-label="Main navigation">
            <a href="#top" className="transition-colors hover:text-primary" data-testid="link-home-nav">Home</a>
            <a href="#menu" className="transition-colors hover:text-primary" data-testid="link-menu">Menu</a>
            <a href="#story" className="transition-colors hover:text-primary" data-testid="link-story">About</a>
            <a href="#reviews" className="transition-colors hover:text-primary" data-testid="link-reviews">Reviews</a>
            <a href="#visit" className="transition-colors hover:text-primary" data-testid="link-visit">Location</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`} className="hidden items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary sm:flex" data-testid="link-call"><Phone size={14} /> Call us</a>
            <button onClick={() => setCartOpen(true)} className="relative flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:translate-y-[-1px]" data-testid="button-open-cart">
              <ShoppingBag size={17} /><span className="hidden sm:inline">Your order</span>
              {cartCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1 text-[11px] text-primary">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 pb-16 pt-12 md:pb-24 md:pt-20 lg:grid-cols-[.9fr_1.1fr] lg:gap-16 lg:px-10 lg:pt-24">
          <div className="reveal max-w-[580px]">
            <div className="mb-6 flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[.2em] text-primary"><span className="live-dot h-2 w-2 rounded-full bg-primary" /> {HOURS_LABEL}</div>
            <h1 className="font-display text-[clamp(3.5rem,8vw,7.4rem)] leading-[.88] tracking-[-.055em] text-foreground">Big fire.<br /><span className="text-primary">Bigger flavour.</span></h1>
            <p className="mt-7 max-w-[460px] text-base leading-7 text-muted-foreground md:text-lg">Shawarmas rolled hot, biryanis sealed with care, and grills that carry the room. Your neighbourhood fix for something properly delicious.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#menu" className="group flex items-center gap-3 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground transition hover:translate-y-[-2px]" data-testid="link-order-now">Order from the menu <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></a>
              <a href="#visit" className="flex items-center gap-2 rounded-full border border-border px-5 py-3.5 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary" data-testid="link-find-us"><MapPin size={15} /> Find us</a>
            </div>
            <div className="mt-11 flex items-center gap-6 border-t border-border pt-5">
              <div className="flex items-center gap-2"><Star size={16} fill="currentColor" className="text-primary" /><span className="font-mono-ui text-sm text-foreground">4.7 / 5</span><span className="text-xs text-muted-foreground">Google rating</span></div>
              <div className="h-5 w-px bg-border" />
              <span className="text-xs text-muted-foreground">15 reviews</span>
            </div>
          </div>
          <div className="reveal reveal-delay-2 relative min-h-[390px] md:min-h-[520px]">
            <div className="absolute -right-12 top-3 hidden h-32 w-32 rounded-full border border-primary/30 md:block" />
            <div className="absolute -left-8 bottom-6 z-10 hidden max-w-[185px] rounded-2xl border border-border bg-card/90 p-4 backdrop-blur md:block">
              <div className="mb-2 flex items-center gap-2 text-primary"><span className="h-1.5 w-1.5 rounded-full bg-primary" /><span className="font-mono-ui text-[9px] uppercase tracking-widest">from the grill</span></div>
              <p className="font-display text-xl leading-tight text-foreground">Charred at the edges. Soft in the middle.</p>
            </div>
            <div className="relative h-full min-h-[390px] overflow-hidden rounded-[2rem] border border-border md:min-h-[520px]">
              <img src="/shawarma-hero.jpg" alt="A sizzling chicken shawarma platter" className="h-full w-full object-cover" data-testid="img-hero-food" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/10" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div><p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-primary">Today's mood</p><p className="mt-1 font-display text-2xl text-foreground">Smoky. Juicy. Unapologetic.</p></div>
                <span className="rounded-full border border-foreground/30 bg-background/30 px-3 py-1.5 font-mono-ui text-[9px] uppercase tracking-widest text-foreground backdrop-blur">JNTU · KPHB</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card/35">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-x divide-border md:grid-cols-4">
            {[['01', 'Freshly prepared', 'Made to order, never rushed'], ['02', 'Flavorful shawarmas', 'Rolled hot with fresh sauces'], ['03', 'Delicious biryanis', 'Fragrant rice and slow cooking'], ['04', 'Budget friendly', 'Good food without the fuss']].map(([num, title, copy]) => (
              <div key={num} className="px-5 py-6 md:px-8 md:py-8"><span className="font-mono-ui text-[10px] text-primary">{num}</span><p className="mt-4 font-display text-xl text-foreground">{title}</p><p className="mt-1 text-xs text-muted-foreground">{copy}</p></div>
            ))}
          </div>
        </section>

        <section id="menu" className="mx-auto max-w-[1440px] scroll-mt-20 px-5 py-20 md:py-28 lg:px-10">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div><p className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-primary">The menu / 01</p><h2 className="mt-3 font-display text-5xl tracking-[-.045em] text-foreground md:text-7xl">Pick your pleasure.</h2><p className="mt-4 max-w-md text-muted-foreground">No overthinking. Just good food, made with a little more fire.</p></div>
            <label className="relative block w-full md:max-w-[270px]"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the menu" className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary" data-testid="input-menu-search" /></label>
          </div>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Menu categories">
            {(['All', 'Shawarma', 'Biryani', 'Mandi', 'Drinks', 'Veg'] as Category[]).map((category) => <button key={category} onClick={() => setActiveCategory(category)} className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm transition ${activeCategory === category ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-transparent text-muted-foreground hover:border-primary hover:text-primary'}`} data-testid={`button-category-${category.toLowerCase()}`}>{category}</button>)}
          </div>
          {filteredMenu.length === 0 ? <div className="flex min-h-52 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 text-center"><Utensils size={24} className="text-primary" /><p className="mt-3 font-display text-2xl">Nothing on this page yet.</p><button onClick={() => { setQuery(''); setActiveCategory('All'); }} className="mt-2 text-sm text-primary underline underline-offset-4" data-testid="button-clear-menu">Show everything</button></div> :
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMenu.map((item, index) => <MenuCard key={item.id} item={item} index={index} onSelect={() => setSelectedItem(item)} onAdd={() => addToCart(item)} />)}
            </div>}
        </section>

        <section id="story" className="scroll-mt-20 border-y border-border bg-card/30">
          <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-20 md:py-28 lg:grid-cols-[.8fr_1.2fr] lg:px-10">
            <div className="relative order-2 h-[390px] md:h-[530px] lg:order-1">
              <div className="absolute left-0 top-0 h-[76%] w-[72%] overflow-hidden rounded-[1.5rem] border border-border"><img src="/biryani.jpg" alt="Hyderabadi biryani in a copper handi" className="h-full w-full object-cover" data-testid="img-story-biryani" /></div>
              <div className="absolute bottom-0 right-0 h-[58%] w-[58%] overflow-hidden rounded-[1.5rem] border-8 border-card"><img src="/grill.jpg" alt="Grilled kebabs and chicken" className="h-full w-full object-cover" data-testid="img-story-grill" /></div>
              <div className="absolute bottom-8 left-4 rounded-full bg-primary px-4 py-2 font-mono-ui text-[10px] uppercase tracking-widest text-primary-foreground">made near JNTU</div>
            </div>
            <div className="order-1 lg:order-2"><p className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-primary">Our kitchen / 02</p><h2 className="mt-4 max-w-xl font-display text-5xl leading-[.98] tracking-[-.05em] text-foreground md:text-7xl">The good kind of <span className="text-primary">extra.</span></h2><p className="mt-7 max-w-lg text-base leading-7 text-muted-foreground">The extra char on the chicken. The extra minute for the onions. The extra spoon of biryani you did not plan on finishing.</p><p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">Sizzling is a small, neighbourhood kitchen near JNTU, Kukatpally. Come hungry, leave with a favourite.</p><div className="mt-8 flex items-center gap-4 text-sm text-foreground"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-primary text-primary"><Check size={16} /></span>Thoughtful portions. Honest pricing.</div></div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-12 md:py-16 lg:px-10">
          <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-primary px-6 py-10 text-primary-foreground md:px-12 md:py-12">
            <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full border border-background/20" />
            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div><p className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-background/60">The craving call</p><h2 className="mt-3 max-w-2xl font-display text-4xl leading-none tracking-[-.04em] md:text-6xl">{PROMO_HEADLINE}</h2><p className="mt-4 text-sm text-background/75 md:text-base">{PROMO_COPY}</p></div>
              <a href="#menu" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-background px-5 py-3.5 text-sm font-bold text-foreground transition hover:translate-y-[-2px]" data-testid="link-promo-menu">Explore today&apos;s menu <ArrowRight size={16} /></a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-20 md:py-28 lg:px-10">
          <div className="flex items-end justify-between"><div><p className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-primary">A look inside / 03</p><h2 className="mt-3 font-display text-5xl tracking-[-.045em] text-foreground md:text-6xl">Follow the smoke.</h2></div><a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hidden items-center gap-2 text-sm text-muted-foreground transition hover:text-primary sm:flex" data-testid="link-instagram"><Instagram size={16} /> @sizzlingshawarmas <ExternalLink size={13} /></a></div>
          <div className="mt-9 grid h-[420px] gap-3 sm:grid-cols-3 md:h-[500px]">{gallery.map((photo, index) => <button key={photo.image} onClick={() => setLightboxIndex(index)} className={`group relative overflow-hidden rounded-2xl border border-border text-left ${index === 1 ? 'sm:translate-y-8' : ''}`} data-testid={`button-gallery-${index}`}><img src={photo.image} alt={photo.label} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute inset-x-4 bottom-4 flex items-center justify-between font-mono-ui text-[10px] uppercase tracking-widest text-foreground"><span>{photo.label}</span><ImageIcon size={15} /></span><span className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent opacity-70" /></button>)}</div>
        </section>

         <section className="border-y border-border bg-card/30">
           <div className="mx-auto max-w-[1440px] px-5 py-20 md:py-24 lg:px-10">
             <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
               <div><p className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-primary">Owner media / Google Maps</p><h2 className="mt-3 font-display text-5xl tracking-[-.045em] text-foreground md:text-6xl">See the real place.</h2><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">This photo is sourced from the restaurant&apos;s Google Maps listing. Open the listing to see the complete set of owner and customer photos, plus any videos.</p></div>
               <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-primary hover:underline" data-testid="link-google-media"><ExternalLink size={15} /> Open the Google Maps listing</a>
             </div>
             <div className="mt-10 grid gap-4 md:grid-cols-[1.15fr_.85fr]">
               <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="group relative min-h-[320px] overflow-hidden rounded-[1.5rem] border border-border bg-background" data-testid="link-google-photo">
                 <img src="/google-maps-photo-1.jpg" alt="Chocolate shake and dessert photographed at Sizzling Shawarmas & Biryanis" className="h-full min-h-[320px] w-full object-cover transition duration-700 group-hover:scale-105" />
                 <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-background/90 via-background/40 to-transparent p-5 pt-16"><span><span className="block font-mono-ui text-[10px] uppercase tracking-widest text-primary">Verified listing photo</span><span className="mt-1 block font-display text-2xl text-foreground">From Sizzling on Google Maps</span></span><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><ExternalLink size={16} /></span></div>
               </a>
               <div className="flex flex-col justify-between rounded-[1.5rem] border border-border bg-background p-6 md:p-8">
                 <div>
                   <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary"><Video size={21} /></div>
                   <h3 className="mt-7 font-display text-4xl leading-none text-foreground">Photos, videos, straight from the listing.</h3>
                   <p className="mt-4 text-sm leading-6 text-muted-foreground">Google keeps the full media viewer interactive, so the latest photos and videos stay connected to the restaurant&apos;s live listing.</p>
                 </div>
                 <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-bold text-primary-foreground transition hover:translate-y-[-2px]" data-testid="button-google-videos"><Play size={15} fill="currentColor" /> View photos &amp; videos on Maps</a>
               </div>
             </div>
           </div>
         </section>

        <section id="reviews" className="scroll-mt-20 border-y border-border bg-card/30">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-20 md:grid-cols-[.8fr_1.2fr] md:items-center md:py-24 lg:px-10">
            <div><p className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-primary">Customer notes / 04</p><h2 className="mt-3 font-display text-5xl tracking-[-.045em] text-foreground md:text-6xl">Good food, honestly rated.</h2><p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">We only show review information that is supplied by the restaurant or verified on its Google listing.</p></div>
            <div className="rounded-[1.5rem] border border-border bg-background p-6 md:p-9">
              <div className="flex items-center justify-between"><span className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-primary">{reviewSlides[reviewIndex].eyebrow}</span><span className="font-mono-ui text-xs text-muted-foreground">{String(reviewIndex + 1).padStart(2, '0')} / {String(reviewSlides.length).padStart(2, '0')}</span></div>
              <h3 className="mt-10 font-display text-5xl text-foreground md:text-7xl">{reviewSlides[reviewIndex].headline}</h3>
              <p className="mt-4 max-w-lg text-base leading-7 text-muted-foreground">{reviewSlides[reviewIndex].body}</p>
              <div className="mt-8 flex items-center justify-between border-t border-border pt-5"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Sizzling Shawarmas & Biryanis ${ADDRESS}`)}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary hover:underline" data-testid="link-google-reviews">View on Google</a><div className="flex gap-2"><button onClick={() => setReviewIndex((reviewIndex + reviewSlides.length - 1) % reviewSlides.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground hover:border-primary hover:text-primary" aria-label="Previous review" data-testid="button-review-prev"><ChevronLeft size={17} /></button><button onClick={() => setReviewIndex((reviewIndex + 1) % reviewSlides.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground hover:border-primary hover:text-primary" aria-label="Next review" data-testid="button-review-next"><ChevronRight size={17} /></button></div></div>
            </div>
          </div>
        </section>

        <section id="visit" className="scroll-mt-20 border-y border-border bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-[1fr_auto] md:items-center md:px-10 md:py-20">
            <div><p className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-background/60">Come by / 04</p><h2 className="mt-4 max-w-2xl font-display text-5xl leading-none tracking-[-.05em] md:text-7xl">Bring your appetite.<br />We know a spot.</h2><div className="mt-8 flex flex-col gap-3 text-sm md:flex-row md:gap-8"><span className="flex items-center gap-2"><MapPin size={16} /> {ADDRESS}</span><span className="flex items-center gap-2"><Clock3 size={16} /> {HOURS_LABEL}</span></div></div>
            <div className="flex flex-wrap gap-3 md:justify-end"><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Sizzling Shawarmas & Biryanis ${ADDRESS}`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-background px-5 py-3.5 text-sm font-bold text-foreground transition hover:translate-y-[-2px]" data-testid="link-open-maps"><Navigation size={15} /> Open in Maps</a><a href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`} className="flex items-center gap-2 rounded-full border border-background/30 px-5 py-3.5 text-sm font-bold transition hover:bg-background/10" data-testid="link-call-visit"><Phone size={15} /> {PHONE_DISPLAY}</a></div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10"><div><span className="font-display text-lg text-foreground">Sizzling</span><span className="ml-2 font-mono-ui text-[9px] uppercase tracking-widest">shawarmas & biryanis</span></div><p>Menu prices shown are placeholders and may be updated by the restaurant.</p><p>© {new Date().getFullYear()} Sizzling Shawarmas</p></footer>

      <div className="fixed bottom-4 left-1/2 z-30 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl md:hidden">
        <a href="#top" className="flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2 text-[10px] font-bold text-foreground" data-testid="link-mobile-home"><Flame size={15} /> Home</a>
        <a href="#menu" className="flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2 text-[10px] font-bold text-foreground" data-testid="link-mobile-menu"><Utensils size={15} /> Menu</a>
        <button onClick={() => setCartOpen(true)} className="flex flex-[1.25] flex-col items-center justify-center gap-1 rounded-full bg-primary py-2 text-[10px] font-bold text-primary-foreground" data-testid="button-mobile-cart"><ShoppingBag size={15} /> Cart {cartCount > 0 && `(${cartCount})`}</button>
        <a href="#visit" className="flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2 text-[10px] font-bold text-foreground" data-testid="link-mobile-location"><MapPin size={15} /> Location</a>
        <a href={`tel:${PHONE_DISPLAY.replace(/\s/g, '')}`} className="flex flex-1 flex-col items-center justify-center gap-1 rounded-full py-2 text-[10px] font-bold text-foreground" data-testid="link-mobile-call"><Phone size={15} /> Call</a>
      </div>

      {selectedItem && <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} onAdd={(quantity) => addToCart(selectedItem, quantity)} />}
      {cartOpen && <CartDrawer cart={cart} totalLabel={cartTotalLabel} onClose={() => setCartOpen(false)} onChange={changeQuantity} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />}
      {checkoutOpen && <CheckoutModal cart={cart} totalLabel={cartTotalLabel} sent={orderSent} onClose={() => { setCheckoutOpen(false); setOrderSent(false); }} onSubmit={sendWhatsApp} />}
      {lightboxIndex !== null && <Lightbox index={lightboxIndex} onClose={() => setLightboxIndex(null)} onNext={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)} onPrev={() => setLightboxIndex((lightboxIndex + gallery.length - 1) % gallery.length)} />}
    </div>
  );
}

function MenuCard({ item, index, onSelect, onAdd }: { item: MenuItem; index: number; onSelect: () => void; onAdd: () => void }) {
  return <article className="group overflow-hidden rounded-2xl border border-border bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/60" style={{ animationDelay: `${index * 40}ms` }} data-testid={`card-menu-${item.id}`}>
    <button onClick={onSelect} className="relative block h-48 w-full overflow-hidden text-left" data-testid={`button-details-${item.id}`}><img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />{item.tag && <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 font-mono-ui text-[9px] uppercase tracking-widest text-primary-foreground">{item.tag}</span>}<span className="absolute bottom-3 right-3 rounded-full border border-foreground/20 bg-background/60 px-2 py-1 text-[10px] text-foreground backdrop-blur">{item.veg ? 'veg' : 'non-veg'}{item.spicy ? ' · spicy' : ''}</span></button>
    <div className="p-4"><div className="flex items-start justify-between gap-3"><button onClick={onSelect} className="text-left" data-testid={`button-name-${item.id}`}><h3 className="font-display text-[22px] leading-tight text-foreground">{item.name}</h3></button><span className="font-mono-ui text-sm font-bold text-primary">{money(item.price)}</span></div><p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">{item.description}</p><button onClick={onAdd} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-bold text-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground" data-testid={`button-add-${item.id}`}><Plus size={15} /> Add to order</button></div>
  </article>;
}

function ItemModal({ item, onClose, onAdd }: { item: MenuItem; onClose: () => void; onAdd: (quantity: number) => void }) {
  const [quantity, setQuantity] = useState(1);
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label={`${item.name} details`}><div className="relative max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-border bg-card md:rounded-3xl"><button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur" data-testid="button-close-item"><X size={18} /></button><div className="grid md:grid-cols-2"><img src={item.image} alt={item.name} className="h-64 w-full object-cover md:h-full md:min-h-[380px]" /><div className="p-7 md:p-9"><span className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">{item.category} {item.tag && `· ${item.tag}`}</span><h2 className="mt-3 font-display text-4xl leading-none text-foreground">{item.name}</h2><p className="mt-5 text-sm leading-6 text-muted-foreground">{item.description}</p><div className="mt-7 flex items-center justify-between border-y border-border py-5"><span className="font-mono-ui text-lg text-primary">{money(item.price)}</span><span className="text-xs text-muted-foreground">{item.veg ? 'Vegetarian' : 'Made with chicken / mutton'}</span></div><div className="mt-6 flex items-center justify-between"><span className="text-sm text-muted-foreground">Quantity</span><div className="flex items-center gap-3"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-border" aria-label="Decrease quantity"><Minus size={14} /></button><span className="font-mono-ui text-sm">{quantity}</span><button onClick={() => setQuantity((value) => value + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-border" aria-label="Increase quantity"><Plus size={14} /></button></div></div><button onClick={() => onAdd(quantity)} className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:translate-y-[-2px]" data-testid="button-add-detail"><Plus size={17} /> Add {quantity} to order</button></div></div></div></div>;
}

function CartDrawer({ cart, totalLabel, onClose, onChange, onCheckout }: { cart: CartLine[]; totalLabel: string; onClose: () => void; onChange: (id: string, delta: number) => void; onCheckout: () => void }) {
  return <div className="fixed inset-0 z-50 bg-background/75 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Your order"><div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"><div className="flex items-center justify-between border-b border-border p-5"><div><p className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">Your order</p><h2 className="mt-1 font-display text-3xl text-foreground">Ready when you are.</h2></div><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground" data-testid="button-close-cart"><X size={17} /></button></div>{cart.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-8 text-center"><ShoppingBag size={30} className="text-primary" /><p className="mt-4 font-display text-2xl text-foreground">Your order is empty.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Start with a shawarma, stay for the biryani.</p><button onClick={onClose} className="mt-6 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="button-browse-menu">Browse menu</button></div> : <><div className="flex-1 overflow-y-auto p-5">{cart.map((line) => <div key={line.item.id} className="flex gap-3 border-b border-border py-4 first:pt-0" data-testid={`row-cart-${line.item.id}`}><img src={line.item.image} alt="" className="h-16 w-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="font-display text-lg leading-tight text-foreground">{line.item.name}</p><span className="font-mono-ui text-sm text-primary">{money(line.item.price === null ? null : line.item.price * line.quantity)}</span></div><p className="mt-1 text-xs text-muted-foreground">{money(line.item.price)} each</p><div className="mt-2 flex items-center gap-3"><button onClick={() => onChange(line.item.id, -1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary" data-testid={`button-decrease-${line.item.id}`}><Minus size={13} /></button><span className="font-mono-ui text-xs text-foreground">{line.quantity}</span><button onClick={() => onChange(line.item.id, 1)} className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary" data-testid={`button-increase-${line.item.id}`}><Plus size={13} /></button></div></div></div>)}</div><div className="border-t border-border p-5"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-muted-foreground">Estimated total</span><span className="font-mono-ui text-xl text-primary">{totalLabel}</span></div><p className="mb-4 text-[11px] leading-5 text-muted-foreground">Official prices, availability and delivery details will be confirmed on WhatsApp.</p><button onClick={onCheckout} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground" data-testid="button-checkout">Continue to details <ArrowRight size={16} /></button></div></>}</div></div>;
}

function CheckoutModal({ cart, totalLabel, sent, onClose, onSubmit }: { cart: CartLine[]; totalLabel: string; sent: boolean; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Order details"><div className="relative max-h-[94dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 md:rounded-3xl md:p-8"><button onClick={onClose} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground" data-testid="button-close-checkout"><X size={17} /></button>{sent ? <div className="py-12 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-background"><Check size={26} /></span><h2 className="mt-6 font-display text-4xl text-foreground">Message ready.</h2><p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-muted-foreground">WhatsApp should have opened in a new tab. Send the message there and we will confirm your order.</p><button onClick={onClose} className="mt-7 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground" data-testid="button-close-sent">Back to menu</button></div> : <><p className="font-mono-ui text-[10px] uppercase tracking-widest text-primary">Almost there</p><h2 className="mt-2 font-display text-4xl text-foreground">Where should we send it?</h2><p className="mt-3 text-sm text-muted-foreground">Add your details, then we will hand the order to WhatsApp.</p><form onSubmit={onSubmit} className="mt-7 space-y-4"><label className="block"><span className="mb-2 block text-xs font-semibold text-muted-foreground">Your name</span><input required name="name" placeholder="Name" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary" data-testid="input-order-name" /></label><label className="block"><span className="mb-2 block text-xs font-semibold text-muted-foreground">Phone number</span><input required name="phone" type="tel" placeholder="10-digit mobile number" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary" data-testid="input-order-phone" /></label><label className="block"><span className="mb-2 block text-xs font-semibold text-muted-foreground">Delivery or pickup</span><select name="orderType" className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none focus:border-primary"><option>Delivery</option><option>Pickup</option></select></label><label className="block"><span className="mb-2 block text-xs font-semibold text-muted-foreground">Address or pickup note</span><textarea required name="address" rows={3} placeholder="Flat, street, landmark — or write pickup" className="w-full resize-none rounded-xl border border-border bg-background p-4 text-sm text-foreground outline-none focus:border-primary" data-testid="input-order-address" /></label><label className="block"><span className="mb-2 block text-xs font-semibold text-muted-foreground">Special instructions</span><textarea name="instructions" rows={2} placeholder="Less spicy, extra sauce, etc." className="w-full resize-none rounded-xl border border-border bg-background p-4 text-sm text-foreground outline-none focus:border-primary" data-testid="input-order-instructions" /></label><div className="flex items-center justify-between border-t border-border pt-4"><span className="text-sm text-muted-foreground">{cart.length} item types</span><span className="font-mono-ui text-lg text-primary">{totalLabel}</span></div><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground" data-testid="button-send-whatsapp">Send order on WhatsApp <ArrowRight size={16} /></button></form></>}</div></div>;
}

function Lightbox({ index, onClose, onNext, onPrev }: { index: number; onClose: () => void; onNext: () => void; onPrev: () => void }) {
  const photo = gallery[index];
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/95 p-5 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Gallery image"><button onClick={onClose} className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground" data-testid="button-close-gallery"><X size={18} /></button><button onClick={onPrev} className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground md:left-8" data-testid="button-gallery-prev"><ChevronLeft size={20} /></button><div className="max-w-4xl text-center"><img src={photo.image} alt={photo.label} className="max-h-[75dvh] w-auto rounded-2xl object-contain" /><p className="mt-4 font-mono-ui text-xs uppercase tracking-widest text-primary">{photo.label}</p></div><button onClick={onNext} className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border text-foreground md:right-8" data-testid="button-gallery-next"><ChevronRight size={20} /></button></div>;
}

function NotFound() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-5 text-center"><div><Flame className="mx-auto text-primary" size={35} /><h1 className="mt-5 font-display text-5xl text-foreground">Nothing cooking here.</h1><a href="/" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" data-testid="link-return-home">Back to Sizzling</a></div></div>;
}

export default App;