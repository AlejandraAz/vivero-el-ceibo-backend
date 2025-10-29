import groq from "../config/groqConfig.js";
import { respuestasAmables, TEMATICAS_PERMITIDAS, PALABRAS_PROHIBIDAS } from "../utils/tematicas.js";
import { Op } from "sequelize";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

// Validar temática
const esTematicaPermitida = (pregunta) => {
  const preguntaLower = pregunta.toLowerCase();
  if (PALABRAS_PROHIBIDAS.some(p => preguntaLower.includes(p.toLowerCase()))) return false;
  return TEMATICAS_PERMITIDAS.some(t => preguntaLower.includes(t.toLowerCase()));
};

// Respuesta por fuera de temática
const generarRespuestaFueraDeTematica = () => {
  return respuestasAmables[Math.floor(Math.random() * respuestasAmables.length)];
};

// Detectar intención (puntual vs general)
const detectarIntencion = (pregunta) => {
  const lower = pregunta.toLowerCase();
  const expresionesPuntuales = ["tenes", "tienes", "hay", "queda", "disponible", "stock"];
  const expresionesGenerales = ["qué", "cuales", "mostrame", "mostrar", "ver"];

  if (expresionesPuntuales.some(p => lower.includes(p))) return "puntual";
  if (expresionesGenerales.some(p => lower.includes(p))) return "general";
  return "general";
};

// Buscar productos relacionados
const buscarProductosRelacionados = async (pregunta, tipoIntencion) => {
  const lower = pregunta.toLowerCase();
  

  // let palabraEncontrada = palabrasClave.find(p => lower.includes(p));
  let palabraEncontrada = TEMATICAS_PERMITIDAS.find(t =>
    lower.includes(t.toLowerCase())
  );;

  if (!palabraEncontrada) {
    const regex = /plantas de ([a-záéíóúñ\s]+)/i;
    const match = pregunta.match(regex);
    if (match && match[1]) {
      // palabraEncontrada = match[1].trim();
      const tipo = match[1].trim();
      const coincidencia = TEMATICAS_PERMITIDAS.find(t =>
        t.toLowerCase().includes(tipo.toLowerCase())
      );
      if (coincidencia) palabraEncontrada = coincidencia;
      else palabraEncontrada = tipo; // incluso si no coincide exactamente
    
    }
  }
  if (!palabraEncontrada) return null;

  const productos = await Product.findAll({
    where: {
      name: { [Op.like]: `%${palabraEncontrada}%` },
      stock: { [Op.gt]: 0 },
      status: true,
    },
    limit: tipoIntencion === "puntual" ? 1 : 5,
  });

  if (productos.length === 0) {
    const categoria = await Category.findOne({ where: { nombre: { [Op.like]: `%${palabraEncontrada}%` } } });
    if (categoria) {
      const productosCat = await Product.findAll({
        where: { id_category: categoria.id, stock: { [Op.gt]: 0 }, status: true },
        limit: tipoIntencion === "puntual" ? 1 : 5,
      });
      if (productosCat.length > 0) return { palabra: categoria.nombre, resultados: productosCat };
    }
  }

  if (productos.length > 0) return { palabra: palabraEncontrada, resultados: productos };
  return null;
};

// 🔹 Controlador principal
const getResponse = async (req, res) => {
  try {
    const { pregunta } = req.body;
    if (!pregunta || pregunta.trim().length === 0)
      return res.status(400).json({ error: "Pregunta requerida" });

    const preguntaLimpia = pregunta.trim();

    // 1️⃣ Validar temática
    if (!esTematicaPermitida(preguntaLimpia)) {
      return res.status(200).json({
        respuesta: generarRespuestaFueraDeTematica(),
        tematica_permitida: false,
      });
    }

    // 2️⃣ Detectar intención
    const tipoIntencion = detectarIntencion(preguntaLimpia);

    // 3️⃣ Buscar productos en BD
    const coincidencia = await buscarProductosRelacionados(preguntaLimpia, tipoIntencion);

    if (coincidencia) {
      const productos = coincidencia.resultados;
      const palabra = coincidencia.palabra;

      if (tipoIntencion === "puntual") {
        const producto = productos[0];
        if (producto) {
          return res.status(200).json({
            respuesta: `Sí 🌿, tenemos ${producto.name} en stock ($${parseFloat(producto.price).toFixed(2)})${producto.featured ? " - Destacado" : ""}.`,
            tematica_permitida: true,
            fuente: "base_de_datos",
          });
        } else {
          return res.status(200).json({
            respuesta: `Lo siento 😔, por el momento no tenemos ${palabra} disponible.`,
            tematica_permitida: true,
            fuente: "base_de_datos",
          });
        }
      } else {
        const lista = productos
          .map(p => `🌿 ${p.name} - $${parseFloat(p.price).toFixed(2)} (${p.stock} en stock)${p.featured ? " - Destacado" : ""}`)
          .join("\n");
        return res.status(200).json({
          respuesta: `Actualmente tenemos disponibles productos relacionados con "${palabra}":\n${lista}`,
          tematica_permitida: true,
          fuente: "base_de_datos",
        });
      }
    }

    // 4️⃣ Si no encontró → Groq
    const prompt = `Eres un asistente especializado en VIVEROS y E-COMMERCE.
Tu conocimiento incluye: tipos de plantas, cuidados básicos, productos de jardinería y el vivero "El Ceibo".
Responde en castellano, breve y útil (máx 4 líneas).
Pregunta del cliente: "${preguntaLimpia}"`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 500,
      top_p: 0.9,
      stream: false,
    });

    const respuesta = completion.choices[0]?.message?.content?.trim();
    if (!respuesta) throw new Error("El modelo devolvió una respuesta vacía");

    res.status(200).json({ respuesta, tematica_permitida: true, fuente: "groq" });

  } catch (error) {
    console.error("Error en obtenerRespuesta:", error.message);
    res.status(500).json({
      error: "Error al generar la respuesta",
      detalles: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default getResponse;
