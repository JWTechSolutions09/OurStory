(function () {
  "use strict";

  /** Antes se usaba localStorage; se elimina en carga para no dejar restos. */
  const LEGACY_STORAGE_KEY = "ourbook_keepsake_v1";
  const ADMIN_SESSION_KEY = "ourbook_admin_unlocked";
  const ADMIN_PASSWORD = "Forever";
  const ADMIN_FORM_VERSION = "4";

  const VIEW = { STORY: "story", GALLERY: "gallery", FAVORITES: "favorites" };

  let pendingAdminTab = "story";

  const DEFAULT_STORY = {
    heroTitle: "Our Beautiful Memories",
    heroSubtitle: "Every moment captured, every heart shared.",
    mainLarge: {
      src: "Navidad%202025%20-%20Primera%20foto.jpg",
      alt: "Navidad 2025 - Primera foto 🤍😍",
      overlay: "Navidad contigo sabe a hogar 🤍🥰",
      label: "Navidad 2025 • Mi amor 🤍",
    },
    smallSquare: {
      src: "The%20Beginning.jpg",
      alt: "The Beginning 🤍😍",
      overlay: "The Beginning: aquí empezó nuestro para siempre 🤍🥰",
      sideCaption: "— The Beginning 🤍",
    },
    polaroid: {
      src: "Playita%20Otra%20vez.jpg",
      alt: "Playita Otra vez 🤍😍",
      caption: "Playita otra vez… y te elijo otra vez 🤍😍",
    },
    cutout: {
      src: "Mi%20vida.jpg",
      alt: "Mi vida 🤍😍",
    },
    portrait: {
      src: "Siempre%20te%20amare.jpg",
      alt: "Siempre te amare 🤍🥰",
    },
    mini1: {
      src: "Jetsky.jpg",
      alt: "Jetsky 🤍😍",
    },
    mini2: {
      src: "Cada%20atardecer%20contigo%20es%20el%20mejor.jpg",
      alt: "Cada atardecer contigo es el mejor 🤍😍",
    },
    mini3: {
      src: "En%20yola%20para%20PR.jpg",
      alt: "En yola para PR 🤍🥰",
    },
    mini4: {
      src: "Mi%20princesa.jpg",
      alt: "Mi princesa 🤍😍",
    },
    letterPhoto: {
      src: "Primer%20restaurante.jpg",
      alt: "Primer restaurante 🤍🥰",
      volumeLabel: "Captured Memories • Vol. 1 🤍",
    },
  };

  const DEFAULT_GALLERY_FILES = [
    "The Beginning.jpg",
    "2 locos.jpg",
    "Restaurante con mi princesa.jpg",
    "Lo mas hermoso.jpg",
    "Mi modelito.jpg",
    "Comiidita en la monta;a.jpg",
    "Mi hermosa.jpg",
    "La amo.jpg",
    "Con el sobri.jpg",
    "Playita de neuvo.jpg",
    "En yola para PR.jpg",
    "Love.jpg",
    "HBDDDD.jpg",
    "Riito.jpg",
    "Jetsky.jpg",
    "Siempre juntos.jpg",
    "Volviendo de PR en yola.jpg",
    "Puerto Plata.jpg",
    "Mi chichi.jpg",
    "Anillo de promesa.jpg",
    "Primer restaurante.jpg",
    "Ok.jpg",
    "Navidad 2025 - Primera foto.jpg",
    "Floress.jpg",
    "Siempre te amare.jpg",
    "Playita.jpg",
    "Mi vida.jpg",
    "Cada atardecer contigo es el mejor.jpg",
    "Mi princesa.jpg",
    "Primera vez juntos en el Play.jpg",
    "Playita Otra vez.jpg",
    "Puerto Plataa.jpg",
    "Taquitos.jpg",
  ];

  const DEFAULT_GALLERY = DEFAULT_GALLERY_FILES.map(function (fileName, idx) {
    const title = fileName.replace(/\.[^/.]+$/, "");
    return {
      id: "g_seed_" + (idx + 1),
      src: encodeURIComponent(fileName),
      title: title,
      alt: title + " 🤍😍",
      favorite: idx < 12,
      addedAt: 1735689600000 + idx * 86400000,
    };
  });

  /** Qué campos de texto tiene cada slot en el DOM (selector relativo al slot) */
  const STORY_SLOT_TEXT_BINDINGS = [
    { key: "mainLarge", pairs: [["overlay", "[data-slot-overlay]"], ["label", "[data-slot-label]"]] },
    { key: "smallSquare", pairs: [["overlay", "[data-slot-overlay]"], ["sideCaption", "[data-slot-side]"]] },
    { key: "polaroid", pairs: [["caption", "[data-slot-caption]"]] },
    { key: "cutout", pairs: [] },
    { key: "portrait", pairs: [] },
    { key: "mini1", pairs: [] },
    { key: "mini2", pairs: [] },
    { key: "mini3", pairs: [] },
    { key: "mini4", pairs: [] },
    { key: "letterPhoto", pairs: [["volumeLabel", "[data-slot-volume]"]] },
  ];

  const FIELD_LABELS = {
    alt: "Texto alternativo (accesibilidad)",
    overlay: "Texto al pasar el cursor",
    label: "Lugar, fecha o pie de foto",
    sideCaption: "Texto lateral o firma",
    caption: "Leyenda bajo la imagen",
    volumeLabel: "Texto pequeño inferior",
  };

  const STORY_SLOT_META = [
    { key: "mainLarge", label: "Foto grande principal", fields: ["overlay", "label"] },
    { key: "smallSquare", label: "Foto pequeña (cuadrado)", fields: ["overlay", "sideCaption"] },
    { key: "polaroid", label: "Polaroid", fields: ["caption"] },
    { key: "cutout", label: "Recorte orgánico", fields: [] },
    { key: "portrait", label: "Retrato vertical", fields: [] },
    { key: "mini1", label: "Mini galería 1", fields: [] },
    { key: "mini2", label: "Mini galería 2", fields: [] },
    { key: "mini3", label: "Mini galería 3", fields: [] },
    { key: "mini4", label: "Mini galería 4", fields: [] },
    { key: "letterPhoto", label: "Foto junto a la carta", fields: ["volumeLabel"] },
  ];

  function deepMerge(base, patch) {
    if (!patch || typeof patch !== "object") return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    for (const k of Object.keys(patch)) {
      const pv = patch[k];
      const bv = base[k];
      if (pv && typeof pv === "object" && !Array.isArray(pv) && bv && typeof bv === "object" && !Array.isArray(bv)) {
        out[k] = deepMerge(bv, pv);
      } else if (pv !== undefined) {
        out[k] = pv;
      }
    }
    return out;
  }

  function cloneDefaults() {
    return JSON.parse(JSON.stringify(DEFAULT_STORY));
  }

  function normalizeImageSrc(src) {
    var v = String(src || "").trim();
    if (!v) return "";
    if (v.indexOf("http://") === 0 || v.indexOf("https://") === 0 || v.indexOf("data:") === 0) {
      return v;
    }
    if (v.indexOf("/public/") === 0) v = v.slice(8);
    else if (v.indexOf("public/") === 0) v = v.slice(7);
    return v;
  }

  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch (_) {}

  /** Estado inicial en memoria hasta cargar desde Supabase (nunca se persiste en localStorage). */
  function emptyState() {
    return { story: cloneDefaults(), gallery: JSON.parse(JSON.stringify(DEFAULT_GALLERY)) };
  }

  let noSupabaseWarned = false;
  function notifySupabaseRequired() {
    if (noSupabaseWarned) return;
    noSupabaseWarned = true;
    alert(
      "OurBook guarda solo en la base de datos. Configura la URL y la clave anon de Supabase en env.js o en el build (.env), y recarga la página."
    );
  }

  function saveState(next, opts) {
    opts = opts || {};
    void next;
    if (opts.skipRemote) return;
    if (!window.sb) {
      notifySupabaseRequired();
      return;
    }
    scheduleRemotePush();
  }

  let state = emptyState();
  let currentView = VIEW.STORY;
  let toastTimer = null;
  let remotePushTimer = null;
  /** dataUrl pendiente por slot hasta confirmar */
  const pendingStoryByKey = {};
  let galleryPendingDataUrl = null;

  function refreshAdminRemoteBanner() {
    const wrap = document.getElementById("admin-remote-wrap");
    if (!wrap) return;
    if (window.sb) wrap.classList.remove("hidden");
    else wrap.classList.add("hidden");
  }

  function clearGalleryPending() {
    galleryPendingDataUrl = null;
    const wrap = document.getElementById("gallery-pending-wrap");
    const img = document.getElementById("gallery-pending-img");
    const meta = document.getElementById("gallery-pending-meta");
    const btn = document.getElementById("gallery-upload-btn");
    if (wrap) wrap.classList.add("hidden");
    if (img) img.removeAttribute("src");
    if (meta) meta.textContent = "";
    if (btn) btn.disabled = true;
    const fileIn = document.getElementById("gallery-new-file");
    if (fileIn) fileIn.value = "";
  }

  function setAdminRemoteStatus(text) {
    const el = document.getElementById("admin-remote-status");
    if (el && text != null) el.textContent = text;
  }

  function setRemoteButtonsBusy(busy) {
    ["admin-pull-remote", "admin-push-remote"].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.disabled = !!busy;
      el.setAttribute("aria-busy", busy ? "true" : "false");
    });
  }

  /** Tamaño aproximado del JSON que enviamos (límite práctico ~5 MB en muchos hosts). */
  function estimateOurbookPayloadBytes() {
    try {
      return new TextEncoder().encode(
        JSON.stringify({
          id: "default",
          story: state.story,
          gallery: state.gallery,
          updated_at: new Date().toISOString(),
        })
      ).length;
    } catch (e) {
      console.warn("OurBook: no se pudo medir el payload", e);
      return 0;
    }
  }

  const MAX_PAYLOAD_BYTES = 4.5 * 1024 * 1024;

  function formatSupabaseError(e) {
    const msg = (e && e.message) || String(e || "");
    if (/payload too large|413|entity too large|body exceeded/i.test(msg)) {
      return "El envío es demasiado grande (muchas fotos o imágenes muy pesadas). Borra algunas de la galería o usa fotos más pequeñas, luego pulsa «Subir todo ahora».";
    }
    if (/JWT|Invalid API key|invalid.*key/i.test(msg)) {
      return "La clave o la URL de Supabase no son válidas. Revisa env.js o las variables del build.";
    }
    if (/RLS|permission denied|policy|42501/i.test(msg)) {
      return "Sin permiso en la base de datos. Ejecuta de nuevo supabase/ourbook.sql (políticas para anon).";
    }
    if (/Failed to fetch|NetworkError|network/i.test(msg)) {
      return "No hay conexión o el servidor no respondió. Comprueba la red e inténtalo otra vez.";
    }
    return msg || "Error al hablar con la base de datos.";
  }

  function flushRemotePush() {
    if (!window.sb) return Promise.resolve();
    clearTimeout(remotePushTimer);
    remotePushTimer = null;
    return pushStateToSupabase();
  }

  function scheduleRemotePush() {
    if (!window.sb) return;
    clearTimeout(remotePushTimer);
    remotePushTimer = setTimeout(function () {
      remotePushTimer = null;
      pushStateToSupabase().catch(function (e) {
        console.warn("OurBook: no se pudo subir a Supabase", e);
        setAdminRemoteStatus(formatSupabaseError(e));
      });
    }, 700);
  }

  function pushStateToSupabase() {
    if (!window.sb) return Promise.resolve();
    const bytes = estimateOurbookPayloadBytes();
    if (bytes > MAX_PAYLOAD_BYTES) {
      const err = new Error(
        "Los datos superan ~4,5 MB. Reduce imágenes en la galería o en los bloques de la historia."
      );
      return Promise.reject(err);
    }
    return window.sb
      .from("ourbook_state")
      .upsert(
        {
          id: "default",
          story: state.story,
          gallery: state.gallery,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .then(function (r) {
        if (r.error) return Promise.reject(r.error);
        setAdminRemoteStatus("Guardado en la base de datos correctamente.");
      });
  }

  function fetchRemoteIntoState() {
    if (!window.sb) return Promise.resolve(false);
    return window.sb
      .from("ourbook_state")
      .select("story,gallery")
      .eq("id", "default")
      .maybeSingle()
      .then(function (res) {
        if (res.error) return Promise.reject(res.error);
        if (!res.data) return false;
        const row = res.data;
        if (row.story && typeof row.story === "object" && !Array.isArray(row.story)) {
          state.story = deepMerge(cloneDefaults(), row.story);
        }
        if (Array.isArray(row.gallery)) {
          state.gallery = row.gallery
            .filter(function (item) {
              return item && typeof item.src === "string" && item.src.length > 0;
            })
            .map(function (item) {
              return {
                ...item,
                src: normalizeImageSrc(item.src),
              };
            });
        }
        return true;
      });
  }

  function uid() {
    return "g_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
  }

  function fileToDataUrl(file, maxW, quality) {
    maxW = maxW || 1400;
    quality = quality || 0.82;
    return new Promise(function (resolve, reject) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxW) {
          h = (h * maxW) / w;
          w = maxW;
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo leer la imagen"));
      };
      img.src = url;
    });
  }

  function setText(sel, text) {
    const el = document.querySelector(sel);
    if (el) el.textContent = text == null ? "" : String(text);
  }

  function setImg(slotKey, src, alt) {
    const root = document.querySelector('[data-story-slot="' + slotKey + '"]');
    if (!root) return;
    const img = root.querySelector("[data-slot-img]");
    if (img) {
      img.src = normalizeImageSrc(src);
      img.alt = alt || "";
    }
  }

  function applyStoryToPage() {
    const s = state.story;
    setText("[data-hero-title]", s.heroTitle);
    setText("[data-hero-subtitle]", s.heroSubtitle);

    STORY_SLOT_TEXT_BINDINGS.forEach(function (b) {
      const slot = s[b.key];
      if (!slot) return;
      setImg(b.key, slot.src, slot.alt);
      (b.pairs || []).forEach(function (pair) {
        const prop = pair[0];
        const subsel = pair[1];
        setText('[data-story-slot="' + b.key + '"] ' + subsel, slot[prop]);
      });
    });
  }

  function updateNav(view) {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      const on = a.getAttribute("data-nav") === view;
      a.classList.toggle("nav-item--active", on);
      a.setAttribute("aria-current", on ? "page" : "false");
    });
  }

  function showView(name) {
    if (![VIEW.STORY, VIEW.GALLERY, VIEW.FAVORITES].includes(name)) name = VIEW.STORY;
    currentView = name;

    const story = document.getElementById("view-story");
    const gallery = document.getElementById("view-gallery");
    const fav = document.getElementById("view-favorites");
    if (story) story.classList.toggle("hidden", name !== VIEW.STORY);
    if (gallery) gallery.classList.toggle("hidden", name !== VIEW.GALLERY);
    if (fav) fav.classList.toggle("hidden", name !== VIEW.FAVORITES);

    updateNav(name);

    if (name === VIEW.GALLERY) renderGalleryGrid();
    if (name === VIEW.FAVORITES) renderFavoritesGrid();
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (name === VIEW.STORY) {
      requestAnimationFrame(function () {
        document.querySelectorAll("#view-story .reveal-on-scroll:not(.is-visible)").forEach(function (el) {
          const r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.92 && r.bottom > -40) el.classList.add("is-visible");
        });
      });
    }
  }

  function galleryItemById(id) {
    return state.gallery.find(function (g) {
      return g.id === id;
    });
  }

  function isAdminOpen() {
    const m = document.getElementById("admin-modal");
    return !!(m && !m.classList.contains("hidden"));
  }

  function updateGalleryCountBadge() {
    const el = document.getElementById("admin-gallery-count");
    if (el) el.textContent = "(" + state.gallery.length + ")";
  }

  function refreshGalleryViews() {
    if (currentView === VIEW.GALLERY) renderGalleryGrid();
    if (currentView === VIEW.FAVORITES) renderFavoritesGrid();
    if (isAdminOpen()) renderAdminGalleryList();
    updateGalleryCountBadge();
  }

  function toggleGalleryFavorite(id) {
    const item = galleryItemById(id);
    if (!item) return;
    item.favorite = !item.favorite;
    saveState(state);
    refreshGalleryViews();
    if (window.sb) {
      flushRemotePush().catch(function (e) {
        console.warn(e);
        if (isAdminOpen()) setAdminRemoteStatus(formatSupabaseError(e));
      });
    }
  }

  function deleteGalleryItem(id) {
    if (!galleryItemById(id)) return;
    state.gallery = state.gallery.filter(function (g) {
      return g.id !== id;
    });
    saveState(state);
    refreshGalleryViews();
    if (window.sb) {
      flushRemotePush().catch(function (e) {
        console.warn(e);
        if (isAdminOpen()) setAdminRemoteStatus(formatSupabaseError(e));
      });
    }
  }

  function renderGalleryGrid() {
    const host = document.getElementById("gallery-grid");
    if (!host) return;
    if (!state.gallery.length) {
      host.innerHTML =
        '<p class="gallery-grid-empty text-center font-body text-on-surface-variant py-16 px-4">Aún no hay fotos. Usa el botón + o el panel de administración.</p>';
      return;
    }
    host.innerHTML = state.gallery
      .map(function (item) {
        const fill = item.favorite ? "1" : "0";
        return (
          '<div class="relative bg-surface-container-lowest p-3 sm:p-4 sticker-shadow rounded-xl group w-full max-w-md mx-auto">' +
          '<div class="ourbook-photo-frame rounded-xl overflow-hidden flex items-center justify-center">' +
          '<img src="' +
          escapeAttr(normalizeImageSrc(item.src)) +
          '" alt="' +
          escapeAttr(item.alt || "") +
          '" class="w-full h-auto object-contain" loading="lazy"/>' +
          "</div>" +
          (item.title
            ? '<p class="mt-2 font-headline italic text-sm text-on-surface text-center truncate">' +
              escapeHtml(item.title) +
              "</p>"
            : "") +
          '<button type="button" data-fav-toggle="' +
          escapeAttr(item.id) +
          '" class="absolute top-2 right-2 w-10 h-10 rounded-lg bg-[#fffbff]/90 backdrop-blur flex items-center justify-center text-primary hover:scale-110 transition-transform shadow-sm" aria-label="' +
          (item.favorite ? "Quitar favorito" : "Marcar favorito") +
          '" aria-pressed="' +
          (item.favorite ? "true" : "false") +
          '">' +
          '<span class="material-symbols-outlined text-2xl" style="font-variation-settings: \'FILL\' ' +
          fill +
          ';">favorite</span>' +
          "</button>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderFavoritesGrid() {
    const host = document.getElementById("favorites-grid");
    if (!host) return;
    const list = state.gallery.filter(function (g) {
      return g.favorite;
    });
    if (!list.length) {
      host.innerHTML =
        '<p class="gallery-grid-empty text-center font-body text-on-surface-variant py-16 px-4">Marca corazones en la galería para verlos aquí.</p>';
      return;
    }
    host.innerHTML = list
      .map(function (item) {
        return (
          '<div class="relative bg-surface-container-lowest p-3 sm:p-4 sticker-shadow rounded-xl w-full max-w-md mx-auto">' +
          '<div class="ourbook-photo-frame rounded-xl overflow-hidden flex items-center justify-center">' +
          '<img src="' +
          escapeAttr(normalizeImageSrc(item.src)) +
          '" alt="' +
          escapeAttr(item.alt || "") +
          '" class="w-full h-auto object-contain" loading="lazy"/>' +
          "</div>" +
          (item.title
            ? '<p class="mt-2 font-headline italic text-sm text-on-surface text-center truncate">' +
              escapeHtml(item.title) +
              "</p>"
            : "") +
          '<button type="button" data-fav-toggle="' +
          escapeAttr(item.id) +
          '" class="absolute top-2 right-2 w-10 h-10 rounded-lg bg-primary/90 text-on-primary flex items-center justify-center hover:scale-110 transition-transform" aria-label="Quitar de favoritos" aria-pressed="true">' +
          '<span class="material-symbols-outlined text-2xl" style="font-variation-settings: \'FILL\' 1;">favorite</span>' +
          "</button>" +
          "</div>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    if (s == null || s === "") return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function showToast(message) {
    const el = document.getElementById("admin-toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("admin-toast--show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("admin-toast--show");
    }, 2200);
  }

  function buildAdminStoryFormHtml() {
    const heroBlock =
      '<details class="admin-details rounded-xl border border-outline-variant/25 bg-surface-bright/80 overflow-hidden" open>' +
      '<summary class="flex items-center justify-between gap-2 px-4 py-3 bg-surface-container-low/60 font-label text-sm text-primary">' +
      "<span>Cabecera (título principal)</span>" +
      '<span class="material-symbols-outlined text-lg opacity-60">expand_more</span>' +
      "</summary>" +
      '<div class="px-4 pb-4 pt-2 space-y-3 border-t border-outline-variant/10">' +
      '<label class="block text-sm text-on-surface-variant">Título de la página<input type="text" data-story-field="heroTitle" class="admin-input" autocomplete="off"/></label>' +
      '<label class="block text-sm text-on-surface-variant">Subtítulo<input type="text" data-story-field="heroSubtitle" class="admin-input" autocomplete="off"/></label>' +
      "</div>" +
      "</details>";

    const slotsHtml = STORY_SLOT_META.map(function (meta) {
      const fieldInputs = meta.fields
        .map(function (f) {
          const lbl = FIELD_LABELS[f] || f;
          return (
            '<label class="block text-sm text-on-surface-variant mt-2">' +
            escapeHtml(lbl) +
            '<input type="text" data-story-nested="' +
            meta.key +
            "." +
            f +
            '" class="admin-input" autocomplete="off"/></label>'
          );
        })
        .join("");
      return (
        '<details class="admin-details rounded-xl border border-outline-variant/25 bg-surface-bright/80 overflow-hidden">' +
        '<summary class="flex items-center justify-between gap-2 px-4 py-3 bg-surface-container-low/60 font-label text-sm text-on-surface">' +
        "<span>" +
        escapeHtml(meta.label) +
        "</span>" +
        '<span class="material-symbols-outlined text-lg opacity-50 shrink-0">expand_more</span>' +
        "</summary>" +
        '<div class="px-4 pb-4 pt-2 space-y-2 border-t border-outline-variant/10">' +
        '<label class="block text-sm text-on-surface-variant">' +
        escapeHtml(FIELD_LABELS.alt) +
        '<input type="text" data-story-nested="' +
        meta.key +
        '.alt" class="admin-input" autocomplete="off"/></label>' +
        fieldInputs +
        '<label class="mt-3 flex flex-col gap-2 text-sm text-on-surface-variant">' +
        "<span>Elegir nueva imagen</span>" +
        '<input type="file" accept="image/*" data-story-file="' +
        meta.key +
        '" class="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-on-primary file:cursor-pointer"/></label>' +
        '<p class="text-[11px] text-on-surface-variant/70 mt-2 leading-snug">Imagen actual en la página (sin recorte):</p>' +
        '<img data-story-preview="' +
        meta.key +
        '" class="mt-1 w-full max-h-44 object-contain rounded-xl border border-outline-variant/25 bg-surface-bright hidden" alt=""/>' +
        '<div class="hidden mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-2" data-admin-pending-for="' +
        meta.key +
        '">' +
        '<p class="text-xs font-label text-primary">Nueva imagen · revisa y confirma</p>' +
        '<img class="admin-slot-pending-img w-full max-h-56 object-contain rounded-lg bg-surface-bright border border-outline-variant/20" alt=""/>' +
        '<div class="flex flex-wrap gap-2">' +
        '<button type="button" data-admin-pending-apply="' +
        meta.key +
        '" class="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-label hover:opacity-95">Usar esta imagen</button>' +
        '<button type="button" data-admin-pending-cancel="' +
        meta.key +
        '" class="px-4 py-2 rounded-xl border border-outline-variant/50 text-on-surface-variant text-xs font-label hover:bg-surface-container">Cancelar</button>' +
        "</div></div>" +
        '<p class="text-[11px] text-on-surface-variant/60 mt-2 leading-snug">Se comprime a JPEG (~1400px) al confirmar.</p>' +
        "</div>" +
        "</details>"
      );
    }).join("");

    return heroBlock + slotsHtml;
  }

  function initAdminStoryFormOnce() {
    const wrap = document.getElementById("admin-story-slots");
    if (!wrap) return;
    if (wrap.dataset.initialized === "1" && wrap.dataset.formVersion === ADMIN_FORM_VERSION) return;
    wrap.innerHTML = buildAdminStoryFormHtml();
    wrap.dataset.initialized = "1";
    wrap.dataset.formVersion = ADMIN_FORM_VERSION;
  }

  function fillAdminStoryForm() {
    const s = state.story;
    const ht = document.querySelector('[data-story-field="heroTitle"]');
    const hs = document.querySelector('[data-story-field="heroSubtitle"]');
    if (ht) ht.value = s.heroTitle || "";
    if (hs) hs.value = s.heroSubtitle || "";

    STORY_SLOT_META.forEach(function (meta) {
      const slot = s[meta.key];
      if (!slot) return;
      const altIn = document.querySelector('[data-story-nested="' + meta.key + '.alt"]');
      if (altIn) altIn.value = slot.alt || "";
      meta.fields.forEach(function (f) {
        const inp = document.querySelector('[data-story-nested="' + meta.key + "." + f + '"]');
        if (inp) inp.value = slot[f] || "";
      });
      const prev = document.querySelector('[data-story-preview="' + meta.key + '"]');
      if (prev) {
        if (slot.src) {
          prev.src = slot.src;
          prev.classList.remove("hidden");
        } else {
          prev.removeAttribute("src");
          prev.classList.add("hidden");
        }
      }
    });
    document.querySelectorAll("[data-admin-pending-for]").forEach(function (w) {
      w.classList.add("hidden");
      const pi = w.querySelector(".admin-slot-pending-img");
      if (pi) pi.removeAttribute("src");
    });
    Object.keys(pendingStoryByKey).forEach(function (k) {
      delete pendingStoryByKey[k];
    });
    document.querySelectorAll("[data-story-file]").forEach(function (inp) {
      inp.value = "";
    });
    clearGalleryPending();
  }

  function readAdminStoryForm() {
    const s = JSON.parse(JSON.stringify(state.story));
    const ht = document.querySelector('[data-story-field="heroTitle"]');
    const hs = document.querySelector('[data-story-field="heroSubtitle"]');
    if (ht) s.heroTitle = ht.value.trim() || DEFAULT_STORY.heroTitle;
    if (hs) s.heroSubtitle = hs.value.trim() || DEFAULT_STORY.heroSubtitle;

    STORY_SLOT_META.forEach(function (meta) {
      if (!s[meta.key]) s[meta.key] = {};
      const altIn = document.querySelector('[data-story-nested="' + meta.key + '.alt"]');
      if (altIn) s[meta.key].alt = altIn.value.trim() || DEFAULT_STORY[meta.key].alt;
      meta.fields.forEach(function (f) {
        const inp = document.querySelector('[data-story-nested="' + meta.key + "." + f + '"]');
        if (inp) s[meta.key][f] = inp.value.trim() || DEFAULT_STORY[meta.key][f];
      });
    });
    return s;
  }

  function renderAdminGalleryList() {
    const host = document.getElementById("admin-gallery-list");
    if (!host) return;
    if (!state.gallery.length) {
      host.innerHTML =
        '<p class="text-sm text-on-surface-variant py-4 text-center border border-dashed border-outline-variant/30 rounded-xl">Ninguna foto aún.</p>';
      return;
    }
    host.innerHTML = state.gallery
      .map(function (item) {
        const fill = item.favorite ? "1" : "0";
        return (
          '<div class="flex items-stretch gap-4 p-4 border border-outline-variant/20 rounded-2xl bg-surface-bright/95 hover:border-primary/25 transition-colors">' +
          '<div class="w-[6.5rem] sm:w-28 shrink-0 min-h-[6.5rem] max-h-36 rounded-xl overflow-hidden ourbook-photo-frame flex items-center justify-center border border-outline-variant/25">' +
          '<img src="' +
          escapeAttr(normalizeImageSrc(item.src)) +
          '" class="max-w-full max-h-full w-auto h-auto object-contain" alt="" loading="lazy"/>' +
          "</div>" +
          '<div class="flex-grow min-w-0">' +
          '<p class="font-body text-sm font-medium text-on-surface truncate">' +
          escapeHtml(item.title || "Sin título") +
          "</p>" +
          '<p class="text-xs text-on-surface-variant truncate">' +
          escapeHtml(item.alt || "Sin descripción") +
          "</p>" +
          "</div>" +
          '<button type="button" data-admin-fav="' +
          escapeAttr(item.id) +
          '" class="p-2 rounded-lg hover:bg-secondary-container/50 text-primary" aria-label="Favorito" aria-pressed="' +
          (item.favorite ? "true" : "false") +
          '">' +
          '<span class="material-symbols-outlined text-xl" style="font-variation-settings: \'FILL\' ' +
          fill +
          ';">favorite</span></button>' +
          '<button type="button" data-admin-del="' +
          escapeAttr(item.id) +
          '" class="p-2 rounded-lg text-error hover:bg-error/10" aria-label="Eliminar">' +
          '<span class="material-symbols-outlined text-xl">delete</span></button>' +
          "</div>"
        );
      })
      .join("");
  }

  function isAdminUnlocked() {
    try {
      return sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
    } catch {
      return false;
    }
  }

  function unlockAdminSession() {
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    } catch (_) {}
  }

  function lockAdminSession() {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch (_) {}
  }

  function adminGateOpen() {
    const g = document.getElementById("admin-gate-modal");
    return !!(g && !g.classList.contains("hidden"));
  }

  function showAdminGate() {
    const g = document.getElementById("admin-gate-modal");
    const err = document.getElementById("admin-gate-error");
    const input = document.getElementById("admin-gate-password");
    const panel = document.getElementById("admin-gate-panel");
    if (!g || !input) return;
    if (err) err.classList.add("hidden");
    if (panel) panel.classList.remove("admin-gate--shake");
    input.value = "";
    g.classList.remove("hidden");
    g.setAttribute("aria-hidden", "false");
    setTimeout(function () {
      input.focus();
    }, 50);
  }

  function closeAdminGate() {
    const g = document.getElementById("admin-gate-modal");
    if (!g) return;
    g.classList.add("hidden");
    g.setAttribute("aria-hidden", "true");
  }

  function requestAdminAccess(tab) {
    pendingAdminTab = tab || "story";
    if (isAdminUnlocked()) {
      openAdmin(pendingAdminTab);
      return;
    }
    showAdminGate();
  }

  function wireAdminGate() {
    const submit = document.getElementById("admin-gate-submit");
    const cancel = document.getElementById("admin-gate-cancel");
    const input = document.getElementById("admin-gate-password");
    const gModal = document.getElementById("admin-gate-modal");

    submit?.addEventListener("click", function () {
      const pw = ((input && input.value) || "").trim();
      const err = document.getElementById("admin-gate-error");
      const panel = document.getElementById("admin-gate-panel");
      if (pw === ADMIN_PASSWORD) {
        unlockAdminSession();
        closeAdminGate();
        openAdmin(pendingAdminTab);
        return;
      }
      if (err) err.classList.remove("hidden");
      if (panel) {
        panel.classList.remove("admin-gate--shake");
        void panel.offsetWidth;
        panel.classList.add("admin-gate--shake");
      }
      if (input) input.select();
    });

    cancel?.addEventListener("click", closeAdminGate);
    gModal?.addEventListener("click", function (e) {
      if (e.target.id === "admin-gate-modal") closeAdminGate();
    });
    input?.addEventListener("keydown", function (e) {
      if (e.key === "Enter") submit?.click();
    });
  }

  function openAdmin(tab) {
    const modal = document.getElementById("admin-modal");
    if (!modal) return;
    initAdminStoryFormOnce();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    refreshAdminRemoteBanner();
    fillAdminStoryForm();
    renderAdminGalleryList();
    updateGalleryCountBadge();
    setAdminTab(tab || "story");
    document.getElementById("admin-close")?.focus();
  }

  function closeAdmin() {
    const modal = document.getElementById("admin-modal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  }

  function setAdminTab(tab) {
    const isStory = tab === "story";
    document.querySelectorAll(".admin-tab").forEach(function (btn) {
      const t = btn.getAttribute("data-admin-tab");
      const on = (t === "story" && isStory) || (t === "gallery" && !isStory);
      btn.classList.toggle("admin-tab-pill--active", on);
      btn.classList.toggle("text-primary", on);
      btn.classList.toggle("text-on-surface-variant", !on);
    });
    const pStory = document.getElementById("panel-story-admin");
    const pGal = document.getElementById("panel-gallery-admin");
    if (pStory) pStory.classList.toggle("hidden", !isStory);
    if (pGal) pGal.classList.toggle("hidden", isStory);
    const saveBtn = document.getElementById("admin-save-story");
    if (saveBtn) saveBtn.classList.toggle("hidden", !isStory);
  }

  function wireDelegatedClicks() {
    document.getElementById("gallery-grid")?.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-fav-toggle]");
      if (!btn) return;
      e.preventDefault();
      toggleGalleryFavorite(btn.getAttribute("data-fav-toggle"));
    });

    document.getElementById("favorites-grid")?.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-fav-toggle]");
      if (!btn) return;
      e.preventDefault();
      toggleGalleryFavorite(btn.getAttribute("data-fav-toggle"));
    });

    document.getElementById("admin-gallery-list")?.addEventListener("click", function (e) {
      const fav = e.target.closest("[data-admin-fav]");
      if (fav) {
        toggleGalleryFavorite(fav.getAttribute("data-admin-fav"));
        return;
      }
      const del = e.target.closest("[data-admin-del]");
      if (del && confirm("¿Eliminar esta foto de la galería?")) {
        deleteGalleryItem(del.getAttribute("data-admin-del"));
      }
    });
  }

  function wireAdmin() {
    initAdminStoryFormOnce();

    document.getElementById("admin-close")?.addEventListener("click", closeAdmin);
    document.getElementById("admin-modal")?.addEventListener("click", function (e) {
      if (e.target.id === "admin-modal") closeAdmin();
    });

    document.getElementById("tab-story")?.addEventListener("click", function () {
      setAdminTab("story");
    });
    document.getElementById("tab-gallery-admin")?.addEventListener("click", function () {
      setAdminTab("gallery");
    });

    document.getElementById("admin-save-story")?.addEventListener("click", function () {
      state.story = readAdminStoryForm();
      applyStoryToPage();
      if (!window.sb) {
        notifySupabaseRequired();
        return;
      }
      showToast("Guardando en la base de datos…");
      flushRemotePush()
        .then(function () {
          showToast("Textos guardados correctamente");
        })
        .catch(function (e) {
          console.error(e);
          const msg = formatSupabaseError(e);
          setAdminRemoteStatus(msg);
          alert(msg);
        });
    });

    document.getElementById("admin-pull-remote")?.addEventListener("click", function () {
      if (!window.sb) return;
      setRemoteButtonsBusy(true);
      setAdminRemoteStatus("Leyendo desde Supabase…");
      fetchRemoteIntoState()
        .then(function (hadRow) {
          applyStoryToPage();
          fillAdminStoryForm();
          renderAdminGalleryList();
          updateGalleryCountBadge();
          refreshGalleryViews();
          setAdminRemoteStatus(
            hadRow
              ? "Listo: historia y galería cargadas desde la base de datos (imágenes incluidas)."
              : "No hay fila todavía: al guardar o subir se creará en Supabase."
          );
          showToast(hadRow ? "Datos cargados desde la nube" : "Empieza a editar y guarda para crear la fila");
        })
        .catch(function (e) {
          console.error(e);
          const msg = formatSupabaseError(e);
          setAdminRemoteStatus(msg);
          alert(msg);
        })
        .finally(function () {
          setRemoteButtonsBusy(false);
        });
    });

    document.getElementById("admin-push-remote")?.addEventListener("click", function () {
      if (!window.sb) return;
      setRemoteButtonsBusy(true);
      setAdminRemoteStatus("Subiendo historia y galería…");
      clearTimeout(remotePushTimer);
      remotePushTimer = null;
      pushStateToSupabase()
        .then(function () {
          showToast("Todo guardado en Supabase");
        })
        .catch(function (e) {
          console.error(e);
          const msg = formatSupabaseError(e);
          setAdminRemoteStatus(msg);
          alert(msg);
        })
        .finally(function () {
          setRemoteButtonsBusy(false);
        });
    });

    document.getElementById("admin-story-slots")?.addEventListener("click", function (e) {
      const applyBtn = e.target.closest("[data-admin-pending-apply]");
      if (applyBtn) {
        const key = applyBtn.getAttribute("data-admin-pending-apply");
        const dataUrl = pendingStoryByKey[key];
        if (!dataUrl) return;
        state.story[key] = state.story[key] || {};
        state.story[key].src = dataUrl;
        delete state.story[key].storagePath;
        applyStoryToPage();
        const prev = document.querySelector('[data-story-preview="' + key + '"]');
        if (prev) {
          prev.src = dataUrl;
          prev.classList.remove("hidden");
        }
        const wrap = document.querySelector('[data-admin-pending-for="' + key + '"]');
        if (wrap) wrap.classList.add("hidden");
        delete pendingStoryByKey[key];
        const fileIn = document.querySelector('[data-story-file="' + key + '"]');
        if (fileIn) fileIn.value = "";
        if (window.sb) {
          showToast("Guardando imagen en la base de datos…");
          flushRemotePush()
            .then(function () {
              showToast("Imagen aplicada y guardada");
            })
            .catch(function (e) {
              console.error(e);
              alert(formatSupabaseError(e));
            });
        } else {
          notifySupabaseRequired();
        }
        return;
      }
      const cancelBtn = e.target.closest("[data-admin-pending-cancel]");
      if (cancelBtn) {
        const key = cancelBtn.getAttribute("data-admin-pending-cancel");
        delete pendingStoryByKey[key];
        const wrap = document.querySelector('[data-admin-pending-for="' + key + '"]');
        if (wrap) wrap.classList.add("hidden");
        const fileIn = document.querySelector('[data-story-file="' + key + '"]');
        if (fileIn) fileIn.value = "";
      }
    });

    document.getElementById("admin-story-slots")?.addEventListener("change", function (e) {
      const t = e.target;
      if (!t.matches("[data-story-file]")) return;
      const key = t.getAttribute("data-story-file");
      const file = t.files && t.files[0];
      if (!file) return;
      fileToDataUrl(file)
        .then(function (dataUrl) {
          pendingStoryByKey[key] = dataUrl;
          const wrap = document.querySelector('[data-admin-pending-for="' + key + '"]');
          const pImg = wrap && wrap.querySelector(".admin-slot-pending-img");
          if (pImg) pImg.src = dataUrl;
          if (wrap) wrap.classList.remove("hidden");
        })
        .catch(function (err) {
          alert(err.message || "Error al procesar la imagen");
          t.value = "";
        });
    });

    document.getElementById("gallery-new-file")?.addEventListener("change", function () {
      const file = this.files && this.files[0];
      const wrap = document.getElementById("gallery-pending-wrap");
      const img = document.getElementById("gallery-pending-img");
      const meta = document.getElementById("gallery-pending-meta");
      const btn = document.getElementById("gallery-upload-btn");
      galleryPendingDataUrl = null;
      if (!file) {
        clearGalleryPending();
        return;
      }
      fileToDataUrl(file)
        .then(function (dataUrl) {
          galleryPendingDataUrl = dataUrl;
          if (img) img.src = dataUrl;
          if (wrap) wrap.classList.remove("hidden");
          if (meta) {
            meta.textContent =
              file.name + " · " + Math.max(1, Math.round(file.size / 1024)) + " KB (se optimiza al añadir)";
          }
          if (btn) btn.disabled = false;
        })
        .catch(function (err) {
          alert(err.message || "No se pudo leer la imagen");
          this.value = "";
          clearGalleryPending();
        });
    });

    document.getElementById("gallery-upload-btn")?.addEventListener("click", function () {
      const titleIn = document.getElementById("gallery-new-title");
      const altIn = document.getElementById("gallery-new-alt");
      const fileIn = document.getElementById("gallery-new-file");
      if (!galleryPendingDataUrl) {
        alert("Elige una imagen y espera a que aparezca la vista previa.");
        return;
      }
      const title = (titleIn && titleIn.value.trim()) || "";
      const alt = (altIn && altIn.value.trim()) || "";
      const dataUrl = galleryPendingDataUrl;
      state.gallery.push({
        id: uid(),
        src: dataUrl,
        title: title,
        alt: alt,
        favorite: false,
        addedAt: Date.now(),
      });
      if (titleIn) titleIn.value = "";
      if (altIn) altIn.value = "";
      clearGalleryPending();
      renderAdminGalleryList();
      updateGalleryCountBadge();
      refreshGalleryViews();
      if (!window.sb) {
        notifySupabaseRequired();
        return;
      }
      showToast("Guardando foto en la base de datos…");
      flushRemotePush()
        .then(function () {
          showToast("Foto añadida y guardada");
        })
        .catch(function (e) {
          console.error(e);
          alert(formatSupabaseError(e));
        });
    });

    document.getElementById("admin-reset-all")?.addEventListener("click", function () {
      if (
        confirm(
          "¿Restaurar todo al diseño original? Se sobrescribe el contenido en la base de datos con los valores por defecto."
        )
      ) {
        if (!window.sb) {
          notifySupabaseRequired();
          return;
        }
        state = emptyState();
        applyStoryToPage();
        fillAdminStoryForm();
        renderAdminGalleryList();
        updateGalleryCountBadge();
        refreshGalleryViews();
        clearTimeout(remotePushTimer);
        remotePushTimer = null;
        pushStateToSupabase()
          .then(function () {
            closeAdmin();
            showToast("Valores por defecto guardados en la base de datos");
          })
          .catch(function (e) {
            console.error(e);
            alert(formatSupabaseError(e));
          });
      }
    });

    document.getElementById("admin-logout-session")?.addEventListener("click", function () {
      lockAdminSession();
      closeAdmin();
      showToast("Sesión de administración cerrada");
    });
  }

  function initNav() {
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        showView(a.getAttribute("data-nav"));
      });
    });
  }

  document.getElementById("nav-brand")?.addEventListener("click", function () {
    showView(VIEW.STORY);
  });

  document.getElementById("btn-settings")?.addEventListener("click", function () {
    requestAdminAccess("story");
  });

  document.getElementById("btn-favorites-nav")?.addEventListener("click", function () {
    showView(VIEW.FAVORITES);
  });

  document.getElementById("fab-add")?.addEventListener("click", function () {
    requestAdminAccess("gallery");
  });

  document.getElementById("footer-add-memory")?.addEventListener("click", function () {
    requestAdminAccess("gallery");
  });

  function initRevealOnScroll() {
    const els = document.querySelectorAll(".reveal-on-scroll");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-visible");
            io.unobserve(en.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach(function (el) {
      io.observe(el);
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (adminGateOpen()) {
      closeAdminGate();
      return;
    }
    const m = document.getElementById("admin-modal");
    if (m && !m.classList.contains("hidden")) closeAdmin();
  });

  function finishStartApp() {
    refreshAdminRemoteBanner();
    applyStoryToPage();
    wireDelegatedClicks();
    wireAdminGate();
    wireAdmin();
    initNav();
    updateGalleryCountBadge();
    initRevealOnScroll();
    showView(VIEW.STORY);
  }

  function startApp() {
    const boot = window._ourbookBoot;
    function afterBoot() {
      if (window.sb) setAdminRemoteStatus("Conectando con Supabase…");
      fetchRemoteIntoState()
        .then(function (hadRow) {
          if (window.sb) {
            setAdminRemoteStatus(
              hadRow
                ? "Sincronizado: últimos datos cargados desde la base (textos e imágenes)."
                : "Sin datos previos: la primera vez que guardes se creará la fila en Supabase."
            );
          }
        })
        .catch(function (e) {
          console.warn("OurBook: no se pudo leer Supabase", e);
          if (window.sb) {
            setAdminRemoteStatus(formatSupabaseError(e));
          }
        })
        .finally(finishStartApp);
    }
    if (boot && typeof boot.then === "function") {
      boot.then(afterBoot).catch(afterBoot);
      return;
    }
    afterBoot();
  }

  startApp();
})();
