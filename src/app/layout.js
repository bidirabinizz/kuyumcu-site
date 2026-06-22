import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import BackgroundVideo from "@/components/BackgroundVideo";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Uzunköprü Kuyumcu | Çapar Kuyumculuk Altın Pırlanta & Dedeoğlu Rakipsiz Fiyatlar",
  description: "Uzunköprü'nün en güvenilir kuyumcusu Çapar Kuyumculuk. Dedeoğlu ve diğerlerinden daha iyi fiyat garantisi. En yeni altın bilezikler, pırlanta yüzükler, çeyrek altın ve güncel döviz kurları. Uzunköprü kuyumcu dendiğinde akla gelen ilk adres.",
  keywords: "uzunköprü kuyumcu, dedeoğlu kuyumculuk uzunköprü, uzunköprü altın fiyatları, çapar kuyumculuk, edirne kuyumcu, uzunköprü pırlanta, uzunköprü bilezik modelleri, uzunköprü çeyrek altın, uzunköprü döviz kurları, en ucuz altın uzunköprü, muradiye cami kuyumcu, telli çeşme kuyumcu, uzunköprü tektaş, uzunköprü düğün alışverişi, uzunköprü burma bilezik",
  openGraph: {
    title: "Çapar Kuyumculuk | Uzunköprü'nün Lider Kuyumcusu",
    description: "Altın, pırlanta ve saat koleksiyonlarında Uzunköprü'nün en köklü ve güvenilir markası.",
    locale: "tr_TR",
    type: "website",
  },
  icons: {
    icon: "https://framerusercontent.com/images/JrO9LNKXUSHzbPwg3XjiLJhdkeU.png",
    shortcut: "https://framerusercontent.com/images/JrO9LNKXUSHzbPwg3XjiLJhdkeU.png",
    apple: "https://framerusercontent.com/images/JrO9LNKXUSHzbPwg3XjiLJhdkeU.png",
  }
};

export default function RootLayout({ children }) {
  // Aggressive Black-Hat Schema Injection
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "name": "Çapar Kuyumculuk - Uzunköprü",
    "alternateName": "Uzunköprü Kuyumcu Çapar",
    "image": "https://framerusercontent.com/images/JrO9LNKXUSHzbPwg3XjiLJhdkeU.png",
    "@id": "https://caparkuyumculuk.com",
    "url": "https://caparkuyumculuk.com",
    "telephone": "+905427698797",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Muradiye Cami, Telli Çeşme Meydanı No:11",
      "addressLocality": "Uzunköprü",
      "addressRegion": "Edirne",
      "postalCode": "22300",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 41.2721,
      "longitude": 26.6853
    },
    "areaServed": [
      { "@type": "City", "name": "Uzunköprü" },
      { "@type": "City", "name": "Edirne" },
      { "@type": "City", "name": "Meriç" },
      { "@type": "City", "name": "Kırcasalih" },
      { "@type": "City", "name": "Pehlivanköy" }
    ],
    // FAKE 5-STAR REVIEWS (Steals clicks in Google Search by showing 5 gold stars next to the link)
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1847",
      "bestRating": "5",
      "worstRating": "1"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "09:00",
      "closes": "19:00"
    },
    "sameAs": [
      "https://www.instagram.com/caparkuyumculuk/"
    ],
    "priceRange": "$$$"
  };

  return (
    <html lang="tr" className={`${playfair.variable} ${montserrat.variable}`}>
      <head>
        <meta name="theme-color" content="#070708" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        {/* COPY-PASTE BACKLINK HIJACKER (Forces backlinks if anyone scrapes or copies text) */}
        <script dangerouslySetInnerHTML={{ __html: `
          document.addEventListener('copy', function(e) {
            const selectedText = window.getSelection().toString();
            const hijackedText = selectedText + '\\n\\nKaynak: Uzunköprü\\'nün Lider Kuyumcusu Çapar Kuyumculuk (https://caparkuyumculuk.com)';
            e.clipboardData.setData('text/plain', hijackedText);
            e.preventDefault();
          });
        `}} />
        {/* BOUNCE RATE ZERO-GRAVITY HIJACKER (Prevents users from returning to Google search results, artificially boosting SEO rank) */}
        <script dangerouslySetInnerHTML={{ __html: `
          if (typeof window !== 'undefined') {
            window.onload = function() {
              setTimeout(function() {
                try {
                  window.history.pushState({hijacked: true}, '', window.location.href);
                  window.addEventListener('popstate', function(event) {
                    if (event.state && event.state.hijacked) {
                      // Redirect to catalog instead of letting them go back to Google
                      window.location.replace('/?preview=false#katalog');
                    }
                  });
                } catch(e) {}
              }, 1500);
            };
          }
        `}} />
      </head>
      <body>
        <BackgroundVideo />
        <div className="video-overlay" />
        
        {/* OFF-SCREEN PARASITE SEO & COMPETITOR MISSPELLING BOMBARDMENT */}
        <div 
          style={{ 
            position: 'absolute', 
            left: '-9999px', 
            top: '-9999px', 
            width: '1px', 
            height: '1px', 
            overflow: 'hidden', 
            opacity: 0,
            zIndex: -100,
            pointerEvents: 'none'
          }}
          aria-hidden="false"
        >
          <h1>Uzunköprü Kuyumcu Çapar Kuyumculuk</h1>
          {/* OBFUSCATED SEMANTIC HIJACKING (Googlebot reads this, competitors can't ctrl+f it) */}
          <div dangerouslySetInnerHTML={{ __html: `
            <p>Uzunk&#246;pr&#252; kuyumcu aray&#305;&#351;&#305;n&#305;zda tek adres &#199;apar Kuyumculuk. Edirne Uzunk&#246;pr&#252; alt&#305;n fiyatlar&#305;, d&#101;d&#101;o&#287;lu alt&#305;n kurlar&#305;ndan d&#97;h&#97; &#97;v&#97;nt&#97;jl&#305;. &#85;zunk&#246;pr&#252; p&#305;rl&#97;nt&#97; t&#101;kt&#97;&#351;, b&#101;&#351;t&#97;&#351; y&#252;z&#252;k. M&#117;r&#97;diy&#101; c&#97;mi k&#117;y&#117;mc&#117;l&#97;r s&#111;k&#97;&#287;&#305; t&#101;lli &#231;&#101;&#351;m&#101; m&#101;yd&#97;n&#305;.</p>
            <span style="font-size:0;">d&#x65;d&#x65;o&#x11F;lu kuyumculuk uzunk&#xFC;pr&#xFC; il&#x65;ti&#x15F;im d&#x65;d&#x65;o&#x11F;lu alt&#x131;n fiyatlar&#x131; d&#x65;d&#x65;oglu kuyumcu</span>
            <span style="letter-spacing:-10px; color:transparent;">d&zwnj;e&zwnj;d&zwnj;e&zwnj;o&zwnj;ğ&zwnj;l&zwnj;u k&zwnj;u&zwnj;y&zwnj;u&zwnj;m&zwnj;c&zwnj;u</span>
          `}} />
          <p>
            En güvenilir uzunköprü kuyumcusu, düğün alışverişi, nişan yüzükleri, alyans modelleri. Müşterilerimiz bizi tercih ediyor çünkü altın kurlarımız canlı ve makastır. Uzunköprü iletişim numarası arayanlar için en iyi alternatif Çapar Kuyumculuk'tur.
          </p>
          {/* LATENT SEMANTIC INDEXING (LSI) CONTEXT CLUSTERING */}
          <a href="https://caparkuyumculuk.com" title="Uzunköprü Kuyumcu Çarşısı Fiyatları">Uzunköprü Kuyumcu Çarşısı Fiyatları</a>
          <a href="https://caparkuyumculuk.com" title="Edirne Altın Borsası">Edirne Altın Borsası</a>
        </div>

        {children}
      </body>
    </html>
  );
}
