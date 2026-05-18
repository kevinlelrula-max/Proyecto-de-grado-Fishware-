import { useState, useCallback } from "react";
import {
  getConfiguracion,
  updateDatosEmpresa,
  uploadBanner,
  getLayout,
  updateLayout,
} from "../../configuracion/services/configuracion.api";

export const DEFAULT_LAYOUT = [
  { id: "hero",     tipo: "hero",     visible: true, config: {} },
  { id: "catalogo", tipo: "catalogo", visible: true, config: {} },
  { id: "nosotros", tipo: "nosotros", visible: true, config: {} },
  { id: "contacto", tipo: "contacto", visible: true, config: {} },
];

const DATOS_INICIAL = {
  nombre: "", nit: "", slug: "", logoUrl: null,
  color_primario: "#0F6E56", descripcion: "", horario: "",
  banner_url: null,
  hero_titulo: "", hero_subtitulo: "", hero_btn_texto: "",
  nosotros_titulo: "", nosotros_contenido: "",
  instagram: "", whatsapp: "", facebook: "",
  telefono: "", email: "", direccion: "",
};

export function useEditor() {
  const [datos, setDatos]                 = useState(DATOS_INICIAL);
  const [layout, setLayout]               = useState(DEFAULT_LAYOUT);
  const [bannerFile, setBannerFile]       = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [cargando, setCargando]           = useState(true);
  const [guardando, setGuardando]         = useState(false);
  const [exito, setExito]                 = useState(false);
  const [error, setError]                 = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [data, layoutData] = await Promise.all([getConfiguracion(), getLayout()]);
      setDatos({
        nombre:             data.nombre             || "",
        nit:                data.nit                || "",
        slug:               data.slug               || "",
        logoUrl:            data.logoUrl            || null,
        color_primario:     data.color_primario     || "#0F6E56",
        descripcion:        data.descripcion        || "",
        horario:            data.horario            || "",
        banner_url:         data.banner_url         || null,
        hero_titulo:        data.hero_titulo        || "",
        hero_subtitulo:     data.hero_subtitulo     || "",
        hero_btn_texto:     data.hero_btn_texto     || "",
        nosotros_titulo:    data.nosotros_titulo    || "",
        nosotros_contenido: data.nosotros_contenido || "",
        instagram:          data.instagram          || "",
        whatsapp:           data.whatsapp           || "",
        facebook:           data.facebook           || "",
        telefono:           data.telefono           || "",
        email:              data.email              || "",
        direccion:          data.direccion          || "",
      });
      if (data.banner_url) setBannerPreview(data.banner_url);
      if (layoutData && Array.isArray(layoutData) && layoutData.length > 0) {
        // Asegurar que las secciones fijas siempre existan
        const tipos = layoutData.map(s => s.tipo);
        let merged = [...layoutData];
        if (!tipos.includes("hero")) {
          merged.unshift({ id: "hero", tipo: "hero", visible: true, config: {} });
        }
        if (!tipos.includes("catalogo")) {
          const heroIdx = merged.findIndex(s => s.tipo === "hero");
          merged.splice(heroIdx + 1, 0, { id: "catalogo", tipo: "catalogo", visible: true, config: {} });
        }
        if (!tipos.includes("contacto")) {
          merged.push({ id: "contacto", tipo: "contacto", visible: true, config: {} });
        }
        setLayout(merged);
      }
    } catch {}
    finally { setCargando(false); }
  }, []);

  const onChange = useCallback((campo, valor) => {
    setDatos(prev => ({ ...prev, [campo]: valor }));
  }, []);

  const onBannerChange = useCallback((file) => {
    if (!file) return;
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = e => setBannerPreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  // ── Layout handlers ──────────────────────────────────────────────
  const onLayoutChange = useCallback((newLayout) => {
    setLayout(newLayout);
  }, []);

  const onToggleSeccion = useCallback((id) => {
    setLayout(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  }, []);

  const onDeleteSeccion = useCallback((id) => {
    setLayout(prev => prev.filter(s => s.id !== id));
  }, []);

  const onAddSeccion = useCallback((tipo) => {
    const id = `${tipo}_${Date.now()}`;
    const config = tipo === "texto_libre"
      ? { titulo: "", contenido: "", color_fondo: "#ffffff", color_texto: "#0f172a", alineacion: "center" }
      : {};
    setLayout(prev => {
      // Insertar antes de "contacto" si existe, si no al final
      const idxContacto = prev.findIndex(s => s.tipo === "contacto");
      const nuevo = { id, tipo, visible: true, config };
      if (idxContacto !== -1) {
        const copia = [...prev];
        copia.splice(idxContacto, 0, nuevo);
        return copia;
      }
      return [...prev, nuevo];
    });
  }, []);

  const onSeccionConfigChange = useCallback((id, campo, valor) => {
    setLayout(prev => prev.map(s =>
      s.id === id ? { ...s, config: { ...s.config, [campo]: valor } } : s
    ));
  }, []);

  // ── Guardar ──────────────────────────────────────────────────────
  const guardar = useCallback(async () => {
    setGuardando(true);
    setError(null);
    try {
      await Promise.all([
        updateDatosEmpresa({
          nombre: datos.nombre, nit: datos.nit,
          telefono: datos.telefono, email: datos.email, direccion: datos.direccion,
          descripcion: datos.descripcion, color_primario: datos.color_primario,
          instagram: datos.instagram, whatsapp: datos.whatsapp, facebook: datos.facebook,
          horario: datos.horario,
          hero_titulo: datos.hero_titulo, hero_subtitulo: datos.hero_subtitulo, hero_btn_texto: datos.hero_btn_texto,
          nosotros_titulo: datos.nosotros_titulo, nosotros_contenido: datos.nosotros_contenido,
        }),
        updateLayout(layout),
      ]);
      if (bannerFile) {
        const { bannerUrl } = await uploadBanner(bannerFile);
        setDatos(prev => ({ ...prev, banner_url: bannerUrl }));
        setBannerFile(null);
      }
      setExito(true);
      setTimeout(() => setExito(false), 3000);
    } catch {
      setError("No se pudo guardar. Revisa tu conexión.");
    } finally {
      setGuardando(false);
    }
  }, [datos, layout, bannerFile]);

  return {
    datos, layout, bannerPreview,
    cargando, guardando, exito, error,
    cargar, onChange, onBannerChange,
    onLayoutChange, onToggleSeccion, onDeleteSeccion, onAddSeccion, onSeccionConfigChange,
    guardar,
  };
}
