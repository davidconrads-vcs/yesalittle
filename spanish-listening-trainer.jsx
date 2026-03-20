import { useState, useEffect, useRef, useCallback } from "react";

const SCENARIOS = [
  {
    category: "Restaurant",
    icon: "🍽️",
    color: "#E85D3A",
    prompts: [
      { spanish: "¡Hola! ¿Para cuántos?", english: "Hi! For how many?", context: "Hostess greeting you at the door", yourResponse: "Para cuatro, por favor." },
      { spanish: "¿Tienen reserva?", english: "Do you have a reservation?", context: "Hostess at a busy restaurant", yourResponse: "No, no tenemos reserva." },
      { spanish: "¿Qué van a tomar?", english: "What will you have?", context: "Server taking your order", yourResponse: "Para mí, el/la ___." },
      { spanish: "¿Para beber?", english: "To drink?", context: "Server asking about drinks", yourResponse: "Agua del grifo, por favor." },
      { spanish: "¿Todo bien? ¿Necesitan algo más?", english: "Everything good? Do you need anything else?", context: "Server checking on your table", yourResponse: "Todo bien, gracias." },
      { spanish: "¿Quieren postre o café?", english: "Do you want dessert or coffee?", context: "Server after you finish eating", yourResponse: "La cuenta, por favor." },
      { spanish: "¿Van a querer el menú del día o a la carta?", english: "Will you want the set menu or à la carte?", context: "Server handing you menus", yourResponse: "El menú del día, por favor." },
      { spanish: "Lo siento, no nos queda. ¿Quieres otra cosa?", english: "Sorry, we're out of that. Do you want something else?", context: "Server when your choice is unavailable", yourResponse: "¿Qué nos recomiendas?" },
      { spanish: "Aquí tienen. ¡Que aproveche!", english: "Here you go. Enjoy your meal!", context: "Server bringing your food", yourResponse: "¡Gracias!" },
      { spanish: "¿Quieren la cuenta?", english: "Do you want the bill?", context: "Server when you look finished", yourResponse: "Sí, la cuenta, por favor." },
    ]
  },
  {
    category: "Grocery Store",
    icon: "🛒",
    color: "#4CAF50",
    prompts: [
      { spanish: "¡Buenos días! ¿Qué te pongo?", english: "Good morning! What can I get you?", context: "Deli counter worker", yourResponse: "Ponme doscientos gramos de jamón." },
      { spanish: "¿Algo más?", english: "Anything else?", context: "Any counter or checkout", yourResponse: "No, eso es todo. Gracias." },
      { spanish: "¿Quieres bolsa?", english: "Do you want a bag?", context: "Cashier at checkout", yourResponse: "Sí, una bolsa, por favor." },
      { spanish: "Son doce con cincuenta.", english: "That's twelve fifty.", context: "Cashier telling you the total", yourResponse: "¿Se puede pagar con tarjeta?" },
      { spanish: "¿Tienes la tarjeta de socio?", english: "Do you have a membership card?", context: "Cashier at Mercadona or similar", yourResponse: "No, no tengo." },
      { spanish: "El pago con tarjeta es a partir de cinco euros.", english: "Card payment is from five euros up.", context: "Cashier when your total is small", yourResponse: "Vale, en efectivo entonces." },
      { spanish: "¿Lo quieres cortado en lonchas o en un trozo?", english: "Do you want it sliced or in one piece?", context: "Deli counter for cheese or ham", yourResponse: "En lonchas, por favor." },
      { spanish: "No tenemos. Prueba en la tienda de al lado.", english: "We don't have that. Try the store next door.", context: "When asking for a product", yourResponse: "Vale, gracias." },
    ]
  },
  {
    category: "Getting Around",
    icon: "🚶",
    color: "#2196F3",
    prompts: [
      { spanish: "Sigue todo recto y luego a la derecha.", english: "Go straight ahead and then to the right.", context: "Someone giving you directions", yourResponse: "Gracias. ¿Está lejos?" },
      { spanish: "Está a unos diez minutos andando.", english: "It's about a ten minute walk.", context: "After asking how far something is", yourResponse: "Perfecto, gracias." },
      { spanish: "¿Adónde vais?", english: "Where are you going?", context: "Taxi driver when you get in", yourResponse: "A esta dirección, por favor." },
      { spanish: "Con el tráfico van a ser unos veinte minutos.", english: "With traffic it'll be about twenty minutes.", context: "Taxi driver estimating trip time", yourResponse: "Vale, no hay problema." },
      { spanish: "No puedo parar aquí. ¿Te dejo en la esquina?", english: "I can't stop here. Shall I drop you at the corner?", context: "Taxi driver near your destination", yourResponse: "Sí, en la esquina está bien." },
      { spanish: "Tiene que validar el billete antes de subir.", english: "You have to validate the ticket before boarding.", context: "Someone at a metro/bus station", yourResponse: "Ah vale, gracias." },
      { spanish: "Esta línea no va allí. Tienes que hacer transbordo en Passeig de Gràcia.", english: "This line doesn't go there. You have to transfer at Passeig de Gràcia.", context: "Helpful stranger on the metro", yourResponse: "Gracias. ¿En qué línea?" },
    ]
  },
  {
    category: "Airbnb / Check-in",
    icon: "🏠",
    color: "#FF9800",
    prompts: [
      { spanish: "¡Bienvenidos! ¿Qué tal el viaje?", english: "Welcome! How was the trip?", context: "Host greeting you at arrival", yourResponse: "Bien, gracias. Estamos contentos de estar aquí." },
      { spanish: "Os enseño el piso. Por aquí.", english: "I'll show you the apartment. This way.", context: "Host giving you a tour", yourResponse: "Perfecto, gracias." },
      { spanish: "El wifi es este y la contraseña está en la nevera.", english: "The wifi is this one and the password is on the fridge.", context: "Host explaining the apartment", yourResponse: "Genial, gracias." },
      { spanish: "Si necesitáis algo, me escribís por WhatsApp.", english: "If you need anything, message me on WhatsApp.", context: "Host before leaving", yourResponse: "Vale, perfecto. Muchas gracias." },
      { spanish: "Hay que bajar la basura al contenedor de la esquina.", english: "You have to take the trash down to the bin on the corner.", context: "Host explaining house rules", yourResponse: "¿Cuál es el contenedor para reciclar?" },
      { spanish: "Los vecinos son mayores, así que por la noche sin ruido.", english: "The neighbors are elderly, so no noise at night.", context: "Host about building rules", yourResponse: "Claro, no hay problema." },
      { spanish: "¿A qué hora salís el último día?", english: "What time are you leaving on the last day?", context: "Host asking about checkout", yourResponse: "Salimos por la mañana, sobre las diez." },
    ]
  },
  {
    category: "Shopping",
    icon: "🛍️",
    color: "#9C27B0",
    prompts: [
      { spanish: "¡Hola! ¿Te puedo ayudar en algo?", english: "Hi! Can I help you with anything?", context: "Shop assistant greeting you", yourResponse: "Solo estoy mirando, gracias." },
      { spanish: "¿Qué talla buscas?", english: "What size are you looking for?", context: "Clothing store assistant", yourResponse: "La mediana, creo." },
      { spanish: "Los probadores están al fondo a la izquierda.", english: "The fitting rooms are in the back on the left.", context: "Shop assistant pointing the way", yourResponse: "Gracias." },
      { spanish: "Esa está rebajada. Tiene un treinta por ciento de descuento.", english: "That one's on sale. It's thirty percent off.", context: "Shop assistant about an item", yourResponse: "¡Qué bien! Me lo llevo." },
      { spanish: "¿Lo quieres para regalo? ¿Te lo envuelvo?", english: "Do you want it as a gift? Shall I wrap it?", context: "Shop assistant at checkout", yourResponse: "No hace falta, gracias." },
      { spanish: "Solo aceptamos efectivo.", english: "We only accept cash.", context: "Small shop owner", yourResponse: "¿Hay un cajero cerca?" },
    ]
  },
  {
    category: "Activities & Tickets",
    icon: "🎟️",
    color: "#00BCD4",
    prompts: [
      { spanish: "¿Cuántas entradas quieres?", english: "How many tickets do you want?", context: "Ticket window at an attraction", yourResponse: "Cuatro, por favor. Dos adultos y dos niños." },
      { spanish: "Los menores de seis años entran gratis.", english: "Children under six get in free.", context: "Ticket seller explaining pricing", yourResponse: "Los nuestros tienen once y trece." },
      { spanish: "La próxima visita guiada es a las cuatro.", english: "The next guided tour is at four.", context: "Information desk at a museum", yourResponse: "¿Hay visitas en inglés?" },
      { spanish: "No se pueden sacar fotos aquí dentro.", english: "You can't take photos in here.", context: "Museum guard", yourResponse: "Perdona, no lo sabía." },
      { spanish: "Está cerrado hoy por festivo. Abrimos mañana a las diez.", english: "It's closed today for a holiday. We open tomorrow at ten.", context: "Sign or staff at an attraction", yourResponse: "Ah vale, volvemos mañana entonces." },
      { spanish: "¿Habéis reservado por internet?", english: "Have you booked online?", context: "Staff at popular attraction", yourResponse: "Sí, aquí tengo la reserva." },
    ]
  },
  {
    category: "Pharmacy",
    icon: "💊",
    color: "#F44336",
    prompts: [
      { spanish: "¡Hola! ¿Qué necesitas?", english: "Hi! What do you need?", context: "Pharmacist greeting you", yourResponse: "¿Tienes algo para el dolor de cabeza?" },
      { spanish: "¿Es para un adulto o para un niño?", english: "Is it for an adult or a child?", context: "Pharmacist asking who it's for", yourResponse: "Para mi hijo. Tiene once años." },
      { spanish: "¿Tiene alguna alergia?", english: "Does he/she have any allergies?", context: "Pharmacist checking before recommending", yourResponse: "No, que yo sepa." },
      { spanish: "Toma uno cada ocho horas con comida.", english: "Take one every eight hours with food.", context: "Pharmacist explaining dosage", yourResponse: "¿Puedes repetirlo más despacio?" },
      { spanish: "Para eso necesitas receta médica.", english: "For that you need a doctor's prescription.", context: "Pharmacist when you ask for something restricted", yourResponse: "¿Dónde puedo encontrar un médico?" },
      { spanish: "Te recomiendo este. Es muy efectivo y no necesita receta.", english: "I recommend this one. It's very effective and doesn't need a prescription.", context: "Pharmacist suggesting an alternative", yourResponse: "Perfecto, me lo llevo." },
    ]
  },
  {
    category: "Café & Bar",
    icon: "☕",
    color: "#795548",
    prompts: [
      { spanish: "¿Qué os pongo?", english: "What can I get you?", context: "Barista or bartender", yourResponse: "Un café con leche, por favor." },
      { spanish: "¿Solo o con leche?", english: "Black or with milk?", context: "Barista clarifying your coffee order", yourResponse: "Con leche, por favor." },
      { spanish: "¿Grande o pequeño?", english: "Large or small?", context: "Barista asking about size", yourResponse: "Grande, por favor." },
      { spanish: "¿Para tomar aquí o para llevar?", english: "For here or to go?", context: "Barista or fast food worker", yourResponse: "Para tomar aquí." },
      { spanish: "¿Queréis picar algo? Tenemos tapas.", english: "Do you want a bite to eat? We have tapas.", context: "Bartender suggesting food", yourResponse: "¿Qué tapas tienes?" },
      { spanish: "Marchando.", english: "Coming right up.", context: "Bartender confirming your order", yourResponse: "Gracias." },
    ]
  }
];

const allPrompts = SCENARIOS.flatMap(s => 
  s.prompts.map(p => ({ ...p, category: s.category, icon: s.icon, color: s.color }))
);

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function SpeakButton({ text, autoPlay, size = "large" }) {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  const speak = useCallback(() => {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES";
    utter.rate = 0.85;
    
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang === "es-ES") || 
                          voices.find(v => v.lang.startsWith("es"));
    if (spanishVoice) utter.voice = spanishVoice;
    
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [text]);

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(speak, 400);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, speak]);

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  const isLarge = size === "large";
  
  return (
    <button
      onClick={speak}
      style={{
        background: speaking ? "rgba(232, 93, 58, 0.15)" : "rgba(255,255,255,0.06)",
        border: speaking ? "2px solid #E85D3A" : "2px solid rgba(255,255,255,0.12)",
        borderRadius: isLarge ? 20 : 12,
        padding: isLarge ? "18px 32px" : "10px 18px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: isLarge ? 14 : 8,
        color: "#fff",
        fontSize: isLarge ? 17 : 14,
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.25s ease",
        width: isLarge ? "100%" : "auto",
        justifyContent: "center",
      }}
    >
      <span style={{ 
        fontSize: isLarge ? 28 : 20,
        animation: speaking ? "pulse 1s ease-in-out infinite" : "none",
      }}>
        {speaking ? "🔊" : "🔈"}
      </span>
      <span style={{ fontWeight: 500 }}>
        {isLarge ? (speaking ? "Playing..." : "Play Again") : (speaking ? "..." : "Listen")}
      </span>
    </button>
  );
}

function ProgressRing({ current, total }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div style={{ 
      display: "flex", alignItems: "center", gap: 10,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "rgba(255,255,255,0.5)",
    }}>
      <div style={{
        width: 120, height: 4, borderRadius: 2,
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", borderRadius: 2,
          background: "linear-gradient(90deg, #E85D3A, #FF9800)",
          transition: "width 0.5s ease",
        }} />
      </div>
      <span>{current}/{total}</span>
    </div>
  );
}

export default function SpanishTrainer() {
  const [mode, setMode] = useState("menu"); // menu, practice, review
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState("listen"); // listen, reveal
  const [results, setResults] = useState([]); // {prompt, understood: bool}
  const [voicesLoaded, setVoicesLoaded] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoicesLoaded(true);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const startPractice = () => {
    const pool = selectedCategories.size === 0 
      ? allPrompts 
      : allPrompts.filter(p => selectedCategories.has(p.category));
    setQueue(shuffleArray(pool));
    setCurrentIndex(0);
    setPhase("listen");
    setResults([]);
    setMode("practice");
  };

  const markResult = (understood) => {
    const newResults = [...results, { prompt: queue[currentIndex], understood }];
    setResults(newResults);
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(currentIndex + 1);
      setPhase("listen");
    } else {
      setMode("review");
    }
  };

  const current = queue[currentIndex];

  if (mode === "menu") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0D0D0F",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        padding: "32px 20px",
        maxWidth: 520,
        margin: "0 auto",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        
        <div style={{ marginBottom: 40 }}>
          <div style={{ 
            fontSize: 13, fontWeight: 600, letterSpacing: 2, 
            color: "#E85D3A", textTransform: "uppercase", marginBottom: 8,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Listening Trainer
          </div>
          <h1 style={{ 
            fontSize: 32, fontWeight: 700, margin: 0, lineHeight: 1.2,
            background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.65) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            ¿Qué te han dicho?
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>
            Listen to what locals say to you in real situations. Try to understand before revealing the answer.
          </p>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ 
            fontSize: 12, fontWeight: 600, letterSpacing: 1.5,
            color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 14,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            Select scenarios (or start with all)
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SCENARIOS.map(s => {
              const selected = selectedCategories.has(s.category);
              return (
                <button
                  key={s.category}
                  onClick={() => {
                    const next = new Set(selectedCategories);
                    selected ? next.delete(s.category) : next.add(s.category);
                    setSelectedCategories(next);
                  }}
                  style={{
                    background: selected ? `${s.color}20` : "rgba(255,255,255,0.04)",
                    border: `1.5px solid ${selected ? s.color : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12,
                    padding: "10px 16px",
                    color: selected ? s.color : "rgba(255,255,255,0.55)",
                    cursor: "pointer",
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span>{s.icon}</span>
                  <span>{s.category}</span>
                  <span style={{ 
                    fontSize: 11, opacity: 0.5, 
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {s.prompts.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={startPractice}
          style={{
            width: "100%",
            padding: "18px 24px",
            background: "linear-gradient(135deg, #E85D3A, #D4472A)",
            border: "none",
            borderRadius: 16,
            color: "#fff",
            fontSize: 17,
            fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 24px rgba(232, 93, 58, 0.3)",
          }}
        >
          Start Practice — {selectedCategories.size === 0 
            ? `All ${allPrompts.length} phrases` 
            : `${allPrompts.filter(p => selectedCategories.has(p.category)).length} phrases`}
        </button>

        {!voicesLoaded && (
          <div style={{ 
            marginTop: 16, padding: 14, borderRadius: 12,
            background: "rgba(255, 152, 0, 0.1)", border: "1px solid rgba(255, 152, 0, 0.2)",
            fontSize: 13, color: "rgba(255, 152, 0, 0.8)", lineHeight: 1.5,
          }}>
            ⚠️ Loading speech voices... If audio doesn't work, try refreshing the page.
          </div>
        )}
      </div>
    );
  }

  if (mode === "review") {
    const correct = results.filter(r => r.understood).length;
    const missed = results.filter(r => !r.understood);
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0D0D0F",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        padding: "32px 20px",
        maxWidth: 520,
        margin: "0 auto",
      }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeUp 0.5s ease" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {correct === results.length ? "🎉" : correct > results.length * 0.7 ? "💪" : "📚"}
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>Session Complete</h2>
          <div style={{ 
            fontSize: 40, fontWeight: 700, 
            background: "linear-gradient(135deg, #4CAF50, #8BC34A)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {correct}/{results.length}
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 4 }}>
            understood on first listen
          </div>
        </div>

        {missed.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ 
              fontSize: 12, fontWeight: 600, letterSpacing: 1.5,
              color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 14,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Review these ({missed.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {missed.map((r, i) => (
                <div key={i} style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 14,
                  padding: 16,
                  animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                      {r.prompt.icon} {r.prompt.context}
                    </div>
                    <SpeakButton text={r.prompt.spanish} autoPlay={false} size="small" />
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{r.prompt.spanish}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{r.prompt.english}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          {missed.length > 0 && (
            <button
              onClick={() => {
                setQueue(shuffleArray(missed.map(r => r.prompt)));
                setCurrentIndex(0);
                setPhase("listen");
                setResults([]);
                setMode("practice");
              }}
              style={{
                flex: 1, padding: "16px 20px",
                background: "rgba(232, 93, 58, 0.12)",
                border: "1.5px solid #E85D3A",
                borderRadius: 14, color: "#E85D3A",
                fontSize: 15, fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
              }}
            >
              Retry Missed
            </button>
          )}
          <button
            onClick={() => { setMode("menu"); setSelectedCategories(new Set()); }}
            style={{
              flex: 1, padding: "16px 20px",
              background: "rgba(255,255,255,0.06)",
              border: "1.5px solid rgba(255,255,255,0.12)",
              borderRadius: 14, color: "#fff",
              fontSize: 15, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
            }}
          >
            New Session
          </button>
        </div>
      </div>
    );
  }

  // Practice mode
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D0F",
      color: "#fff",
      fontFamily: "'DM Sans', sans-serif",
      padding: "24px 20px",
      maxWidth: 520,
      margin: "0 auto",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <button
          onClick={() => setMode("menu")}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "8px 14px",
            color: "rgba(255,255,255,0.5)", fontSize: 13,
            fontFamily: "'DM Sans', sans-serif",
            cursor: "pointer",
          }}
        >
          ← Exit
        </button>
        <ProgressRing current={currentIndex + 1} total={queue.length} />
      </div>

      {current && (
        <div key={currentIndex} style={{ animation: "fadeUp 0.4s ease" }}>
          {/* Scenario context */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: `${current.color}15`,
            border: `1px solid ${current.color}30`,
            borderRadius: 10,
            padding: "8px 14px",
            marginBottom: 20,
          }}>
            <span>{current.icon}</span>
            <span style={{ fontSize: 13, color: current.color, fontWeight: 500 }}>
              {current.context}
            </span>
          </div>

          {/* Listen prompt */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 28,
            marginBottom: 20,
            textAlign: "center",
          }}>
            <div style={{ 
              fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 16,
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              {phase === "listen" ? "Listen & try to understand" : "Here's what they said"}
            </div>

            {phase === "listen" ? (
              <div style={{ fontSize: 56, marginBottom: 20 }}>👂</div>
            ) : (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 10, lineHeight: 1.4 }}>
                  {current.spanish}
                </div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", marginBottom: 20, lineHeight: 1.5 }}>
                  {current.english}
                </div>
                <div style={{
                  background: "rgba(76, 175, 80, 0.08)",
                  border: "1px solid rgba(76, 175, 80, 0.2)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  marginBottom: 4,
                }}>
                  <div style={{ fontSize: 11, color: "rgba(76, 175, 80, 0.6)", marginBottom: 4, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: 1 }}>
                    You could respond
                  </div>
                  <div style={{ fontSize: 15, color: "rgba(76, 175, 80, 0.9)", fontWeight: 500 }}>
                    {current.yourResponse}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <SpeakButton text={current.spanish} autoPlay={phase === "listen"} size="large" />
            </div>
          </div>

          {/* Actions */}
          {phase === "listen" ? (
            <button
              onClick={() => setPhase("reveal")}
              style={{
                width: "100%",
                padding: "18px 24px",
                background: "linear-gradient(135deg, #E85D3A, #D4472A)",
                border: "none",
                borderRadius: 16,
                color: "#fff",
                fontSize: 17,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(232, 93, 58, 0.3)",
              }}
            >
              Reveal Answer
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10, animation: "fadeUp 0.3s ease" }}>
              <button
                onClick={() => markResult(false)}
                style={{
                  flex: 1, padding: "18px 20px",
                  background: "rgba(244, 67, 54, 0.1)",
                  border: "1.5px solid rgba(244, 67, 54, 0.3)",
                  borderRadius: 14, color: "#F44336",
                  fontSize: 16, fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                }}
              >
                Didn't Get It
              </button>
              <button
                onClick={() => markResult(true)}
                style={{
                  flex: 1, padding: "18px 20px",
                  background: "rgba(76, 175, 80, 0.1)",
                  border: "1.5px solid rgba(76, 175, 80, 0.3)",
                  borderRadius: 14, color: "#4CAF50",
                  fontSize: 16, fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer",
                }}
              >
              Understood ✓
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
