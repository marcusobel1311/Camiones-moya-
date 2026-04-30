import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useAppContext } from '../context/AppContext';
import { Send, Bot, Loader2, Sparkles, User } from 'lucide-react';

export default function ConsultasView() {
  const { trucks, trips, drivers } = useAppContext();
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the Gemini API client
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const dataContext = JSON.stringify({
        camiones: trucks.map(t => ({ id: t.id, placa: t.plate, conductor: t.driver.name, estado: t.status, ubicacion: t.location.address })),
        conductores: drivers.map(d => ({ nombre: d.name, edad: d.age, licencia: d.license })),
        viajes_activos: trips.filter(t => t.status === 'in-progress'),
      });

      const systemPrompt = `Eres el asistente inteligente (Gerente Virtual) de Alexander Moya C.A. 
Tu trabajo es responder exclusivamente preguntas sobre la flota actual, basándote en los siguientes datos en vivo:
${dataContext}

Reglas:
- Sé amable, conciso y profesional.
- Usa los datos proveídos para responder sobre camiones, conductores y viajes.
- Si te preguntan algo fuera de este contexto o de la flota, indica que solo tienes acceso a la información de operaciones de la compañía Alexander Moya.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
           { role: 'user', parts: [{ text: systemPrompt }] },
           { role: 'model', parts: [{ text: 'Entendido, estoy listo para responder con la información de la flota actual.' }] },
           ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
           { role: 'user', parts: [{ text: userMessage }] }
        ],
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, hubo un error al realizar la consulta a la IA.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100%-2rem)] bg-white/40 backdrop-blur-md shadow-2xl rounded-2xl overflow-hidden m-4 border border-white/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 flex flex-col justify-center shrink-0">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bot className="text-blue-200" size={28} /> Consultas de Flota
        </h2>
        <p className="text-blue-100 mt-1 max-w-lg text-sm leading-relaxed">
          Asistente virtual potenciado con Google Gemini. Pregunte sobre la ubicación de camiones, conductores disponibles o el estado de sus carreras.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 opacity-70">
            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center rotate-3">
               <Sparkles size={32} />
            </div>
            <div>
              <p className="text-gray-800 font-bold mb-2">Comienza una consulta</p>
              <p className="text-gray-500 text-sm">"¿Dónde está el camión de Carlos Mendoza?" o "¿Cuántos camiones tenemos en mantenimiento?"</p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot size={16} className="text-blue-600" />
                </div>
              )}
              <div className={`rounded-2xl p-4 max-w-[80%] text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <User size={16} className="text-gray-500" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-4 justify-start">
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                <Bot size={16} className="text-blue-600" />
             </div>
             <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-4 text-gray-400 text-sm flex items-center gap-2 shadow-sm">
               <Loader2 className="animate-spin" size={16} /> Analizando datos de flota...
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Consulte a su base de datos..." 
            className="w-full bg-gray-50 border border-gray-200 rounded-full py-4 pl-6 pr-14 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm shadow-inner disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-blue-600"
          >
            <Send size={16} className="ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
