(function () {
  "use strict";

  const STORAGE_KEY = "ourbook_keepsake_v1";
  const ADMIN_SESSION_KEY = "ourbook_admin_unlocked";
  const ADMIN_PASSWORD = "Forever";
  const ADMIN_FORM_VERSION = "3";

  const VIEW = { STORY: "story", GALLERY: "gallery", FAVORITES: "favorites" };
  const BUCKET_STORY = "ourbook-story";
  const BUCKET_GALLERY = "ourbook-gallery";
  const STORAGE_MAX_BYTES = 5242880;

  let pendingAdminTab = "story";

  const DEFAULT_STORY = {
    heroTitle: "Our Beautiful Memories",
    heroSubtitle: "Every moment captured, every heart shared.",
    mainLarge: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTzphZejbi0rXJAqG_7kbFTNDxbp5geTh4AXEjFqMj-nAnXxK5hqG5XxovERB0JghmosnmqdPIDgFX3TBeYRjt5Cy1qhaqNavUqtiDNS4vIOFfSyIrfr4W8Y4_KYfBymdY3dZhUbmoK9_jiTazpQksp5EX1rIZg4NGQCa5jjB4MqLmfhjRA-DCGS2Q9c2jrWe0FND_epEyxU4hwZsfAJKgw6enwgwxGssEEhT4Qy1s0v9heP-bVqdgt0j2ezALt8SBaXg6kCbcJQ",
      alt: "A romantic couple walking on the beach at sunset",
      overlay: '"The sunset was beautiful, but I couldn\'t stop looking at you."',
      label: "Malibu Beach • June 2023",
    },
    smallSquare: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ8FXJxTdb0uVDSQfAKHYoeQ6cO7hCPg1rQ5cA18soUKtMGzjQnRQI1m3SdqUbjSWGH5m2Tvm5z-oM0yzUolyiDBdIaUv9RrQkvUZFerwmbK7uXvGFfSscMAcAsMv1M7x70G6nKiZvHnSr6EGkpF-_HFP9yBDGvNVe0DGGP4hFcksvhf5xGglkN9wBEVC8Dj4GcyMYyMvAYGeTWDRRTROZd1wXNI90Y7p78QeMXbydMEs4kvjp0Z5TzBnKEuzf2pB27Kv6R8yX1g",
      alt: "Close up of two hands holding espresso cups",
      overlay: "First date coffee. Still remember your order.",
      sideCaption: "— The Beginning",
    },
    polaroid: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDY0kuD1STjh1KQzqp9iJgHCE-rexUdUFCGbChGtN7vUSOQcYKWVadMskZ2dmlT-6scMqiudAkrjd9Gz5dRUtwS6HGesVH92O2j7VB1NufRdJ0oKcr0eByd0UylCmdP4zuoYotwYpebxh6j6ncyoTdoqsyQVGQ1bVHu2Pxa3iaPKKnq892Y8s3tZJeGuNENaCj6zR92G9D9WBWLZbtGU0gplW8kLs8aUaHEGCRX24204Zx0rREFakNRs8UvRuNgsyO-eD-d5qfauQ",
      alt: "Hands holding heart",
      caption: "Piece of my heart",
    },
    cutout: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-i9He6mIEpEcXxAiE-HasYSzq9mIIyfRuRuztEA4MB8D8MLK0EC1-6tfFMH732fnTae3SMto-PRsBZBdTAYrPgiTDrMbQb1YNm-Q27Q3PjGI4Ke3PC3f6VJsWoPkYnFjBJmz9asuhCYLU5fcJQ02x7mDGySEZLjz9Jn0uNxl2PrM0IshbshQPPemFGwrZz1018vkKjGhJw2-Nt95DXCgj40WMcpK5ZdAekXbxQ-IlJkCc72YZNfVwz161v1q7uVWjAYuo-14YFw",
      alt: "Rings",
    },
    portrait: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCP2kMyf4K3-Sgjct65FobpXaPWjvGoRNzxeouc14sNcc38X45VZWNQWAMFugUH32CHnHYC3y01UsV8_fI0EpFe-yhxQlOgrsBgnW3d2-4-SGctIRk5u4l80BxVB-hee4upgHky5Bm2YeeW7aA3M_1cB1fRmGA_u8WLBq6_Pd9DaYeJO3OcE5UlSNuj-z49OT4OFNJV1wkNghViS8WwRM9VmD07aDpDsltkq0ICAHuZq9wcdvljSO_1XrLCgYZolyy8c7rvhc6bg",
      alt: "Flower field laughing",
    },
    mini1: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-i9He6mIEpEcXxAiE-HasYSzq9mIIyfRuRuztEA4MB8D8MLK0EC1-6tfFMH732fnTae3SMto-PRsBZBdTAYrPgiTDrMbQb1YNm-Q27Q3PjGI4Ke3PC3f6VJsWoPkYnFjBJmz9asuhCYLU5fcJQ02x7mDGySEZLjz9Jn0uNxl2PrM0IshbshQPPemFGwrZz1018vkKjGhJw2-Nt95DXCgj40WMcpK5ZdAekXbxQ-IlJkCc72YZNfVwz161v1q7uVWjAYuo-14YFw",
      alt: "Ring detail",
    },
    mini2: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQ8FXJxTdb0uVDSQfAKHYoeQ6cO7hCPg1rQ5cA18soUKtMGzjQnRQI1m3SdqUbjSWGH5m2Tvm5z-oM0yzUolyiDBdIaUv9RrQkvUZFerwmbK7uXvGFfSscMAcAsMv1M7x70G6nKiZvHnSr6EGkpF-_HFP9yBDGvNVe0DGGP4hFcksvhf5xGglkN9wBEVC8Dj4GcyMYyMvAYGeTWDRRTROZd1wXNI90Y7p78QeMXbydMEs4kvjp0Z5TzBnKEuzf2pB27Kv6R8yX1g",
      alt: "Coffee cups",
    },
    mini3: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDY0kuD1STjh1KQzqp9iJgHCE-rexUdUFCGbChGtN7vUSOQcYKWVadMskZ2dmlT-6scMqiudAkrjd9Gz5dRUtwS6HGesVH92O2j7VB1NufRdJ0oKcr0eByd0UylCmdP4zuoYotwYpebxh6j6ncyoTdoqsyQVGQ1bVHu2Pxa3iaPKKnq892Y8s3tZJeGuNENaCj6zR92G9D9WBWLZbtGU0gplW8kLs8aUaHEGCRX24204Zx0rREFakNRs8UvRuNgsyO-eD-d5qfauQ",
      alt: "Heart shape",
    },
    mini4: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTzphZejbi0rXJAqG_7kbFTNDxbp5geTh4AXEjFqMj-nAnXxK5hqG5XxovERB0JghmosnmqdPIDgFX3TBeYRjt5Cy1qhaqNavUqtiDNS4vIOFfSyIrfr4W8Y4_KYfBymdY3dZhUbmoK9_jiTazpQksp5EX1rIZg4NGQCa5jjB4MqLmfhjRA-DCGS2Q9c2jrWe0FND_epEyxU4hwZsfAJKgw6enwgwxGssEEhT4Qy1s0v9heP-bVqdgt0j2ezALt8SBaXg6kCbcJQ",
      alt: "Beach walk",
    },
    letterPhoto: {
      src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCP2kMyf4K3-Sgjct65FobpXaPWjvGoRNzxeouc14sNcc38X45VZWNQWAMFugUH32CHnHYC3y01UsV8_fI0EpFe-yhxQlOgrsBgnW3d2-4-SGctIRk5u4l80BxVB-hee4upgHky5Bm2YeeW7aA3M_1cB1fRmGA_u8WLBq6_Pd9DaYeJO3OcE5UlSNuj-z49OT4OFNJV1wkNghViS8WwRM9VmD07aDpDsltkq0ICAHuZq9wcdvljSO_1XrLCgYZolyy8c7rvhc6bg",
      alt: "Laughing in field",
      volumeLabel: "Captured Memories • Vol. 1",
    },
  };

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

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { story: cloneDefaults(), gallery: [] };
      const parsed = JSON.parse(raw);
      return {
        story: deepMerge(cloneDefaults(), parsed.story || {}),
        gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
      };
    } catch {
      return { story: cloneDefaults(), gallery: [] };
    }
  }

  function saveState(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      alert(
        "No se pudo guardar (almacenamiento lleno). Usa imágenes más pequeñas o restaura valores por defecto."
      );
      console.error(e);
    }
  }

  let state = loadState();
  let currentView = VIEW.STORY;
  let toastTimer = null;

  /** Contexto cuando hay sesión Supabase (RLS + Storage bajo auth.uid()). */
  let syncCtx = { userId: null, keepsakeId: null };
  let supabaseAdminWired = false;

  function isUuid(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || ""));
  }

  function randomUuidV4() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function hasRemoteSync() {
    return !!(window.sb && syncCtx.keepsakeId && syncCtx.userId);
  }

  function publicStorageUrl(bucket, path) {
    if (!window.sb || !path) return "";
    const r = window.sb.storage.from(bucket).getPublicUrl(path);
    return (r && r.data && r.data.publicUrl) || "";
  }

  function dataUrlToBlob(dataUrl) {
    const parts = String(dataUrl).split(",");
    const mime = (parts[0].match(/:(.*?);/) || [])[1] || "image/jpeg";
    const bstr = atob(parts[1] || "");
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    return new Blob([u8], { type: mime });
  }

  function refreshSyncContext(user) {
    const sb = window.sb;
    return sb
      .from("keepsakes")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle()
      .then(function (res) {
        if (res.error) return Promise.reject(res.error);
        if (res.data && res.data.id) {
          syncCtx = { userId: user.id, keepsakeId: res.data.id };
          return;
        }
        return sb
          .from("keepsakes")
          .insert({ owner_id: user.id })
          .select("id")
          .single()
          .then(function (ins) {
            if (ins.error) return Promise.reject(ins.error);
            syncCtx = { userId: user.id, keepsakeId: ins.data.id };
          });
      });
  }

  function mapRowToSlot(row) {
    const key = row.slot_key;
    const def = DEFAULT_STORY[key];
    if (!def) return null;
    const slot = JSON.parse(JSON.stringify(def));
    slot.src =
      row.image_url ||
      (row.storage_path ? publicStorageUrl(BUCKET_STORY, row.storage_path) : slot.src);
    if (row.storage_path) slot.storagePath = row.storage_path;
    if (row.alt != null && row.alt !== "") slot.alt = row.alt;
    if (row.overlay != null) slot.overlay = row.overlay;
    if (row.label != null) slot.label = row.label;
    if (row.side_caption != null) slot.sideCaption = row.side_caption;
    if (row.caption != null) slot.caption = row.caption;
    if (row.volume_label != null) slot.volumeLabel = row.volume_label;
    return slot;
  }

  function mapPhotoToGalleryItem(row) {
    const path = row.storage_path;
    return {
      id: row.id,
      src: publicStorageUrl(BUCKET_GALLERY, path),
      storagePath: path,
      title: row.title || "",
      alt: row.alt || "",
      favorite: !!row.is_favorite,
      addedAt: new Date(row.created_at || Date.now()).getTime(),
    };
  }

  function applyPulledRows(kRow, slotRows, photoRows) {
    const newStory = cloneDefaults();
    if (kRow) {
      if (kRow.hero_title) newStory.heroTitle = kRow.hero_title;
      if (kRow.hero_subtitle) newStory.heroSubtitle = kRow.hero_subtitle;
    }
    (slotRows || []).forEach(function (row) {
      const mapped = mapRowToSlot(row);
      if (mapped) newStory[row.slot_key] = mapped;
    });
    state.story = newStory;
    state.gallery = (photoRows || []).map(mapPhotoToGalleryItem);
    saveState(state);
  }

  function pullRemoteState() {
    if (!hasRemoteSync()) return Promise.resolve();
    const sb = window.sb;
    const kid = syncCtx.keepsakeId;
    return sb
      .from("keepsakes")
      .select("hero_title, hero_subtitle")
      .eq("id", kid)
      .single()
      .then(function (kr) {
        if (kr.error) return Promise.reject(kr.error);
        return sb
          .from("story_slots")
          .select("*")
          .eq("keepsake_id", kid)
          .then(function (sr) {
            if (sr.error) return Promise.reject(sr.error);
            return sb
              .from("gallery_photos")
              .select("*")
              .eq("keepsake_id", kid)
              .order("sort_order", { ascending: true })
              .then(function (gr) {
                if (gr.error) return Promise.reject(gr.error);
                applyPulledRows(kr.data, sr.data || [], gr.data || []);
              });
          });
      });
  }

  function snakeStoryFields(slotKey, slot) {
    const d = DEFAULT_STORY[slotKey] || {};
    const row = {
      keepsake_id: syncCtx.keepsakeId,
      slot_key: slotKey,
      image_url: slot.src || null,
      storage_path: slot.storagePath || null,
      alt: slot.alt != null ? slot.alt : d.alt || "",
    };
    if ("overlay" in d) row.overlay = slot.overlay != null ? slot.overlay : d.overlay;
    if ("label" in d) row.label = slot.label != null ? slot.label : d.label;
    if ("sideCaption" in d) row.side_caption = slot.sideCaption != null ? slot.sideCaption : d.sideCaption;
    if ("caption" in d) row.caption = slot.caption != null ? slot.caption : d.caption;
    if ("volumeLabel" in d) row.volume_label = slot.volumeLabel != null ? slot.volumeLabel : d.volumeLabel;
    return row;
  }

  function upsertStorySlotRow(slotKey, slot) {
    return window.sb
      .from("story_slots")
      .upsert(snakeStoryFields(slotKey, slot), { onConflict: "keepsake_id,slot_key" })
      .then(function (r) {
        if (r.error) return Promise.reject(r.error);
      });
  }

  function pushAllStoryTextsToRemote() {
    const sb = window.sb;
    const kid = syncCtx.keepsakeId;
    const story = readAdminStoryForm();
    return sb
      .from("keepsakes")
      .update({ hero_title: story.heroTitle, hero_subtitle: story.heroSubtitle })
      .eq("id", kid)
      .then(function (u) {
        if (u.error) return Promise.reject(u.error);
        state.story = story;
        const jobs = STORY_SLOT_META.map(function (meta) {
          return upsertStorySlotRow(meta.key, state.story[meta.key] || {});
        });
        return Promise.all(jobs);
      });
  }

  function uploadStorySlotImage(slotKey, dataUrl) {
    if (!hasRemoteSync()) return Promise.reject(new Error("Inicia sesión en Supabase para subir a la nube."));
    const blob = dataUrlToBlob(dataUrl);
    if (blob.size > STORAGE_MAX_BYTES) {
      return Promise.reject(new Error("La imagen supera 5 MB (límite del bucket)."));
    }
    const path = syncCtx.userId + "/" + slotKey + ".jpg";
    return window.sb.storage
      .from(BUCKET_STORY)
      .upload(path, blob, { contentType: "image/jpeg", upsert: true })
      .then(function (up) {
        if (up.error) return Promise.reject(up.error);
        const pub = publicStorageUrl(BUCKET_STORY, path);
        state.story[slotKey] = state.story[slotKey] || {};
        state.story[slotKey].src = pub;
        state.story[slotKey].storagePath = path;
        return upsertStorySlotRow(slotKey, state.story[slotKey]);
      });
  }

  function uploadGalleryToRemote(dataUrl, title, alt) {
    if (!hasRemoteSync()) return Promise.reject(new Error("Inicia sesión en Supabase para subir a la nube."));
    const blob = dataUrlToBlob(dataUrl);
    if (blob.size > STORAGE_MAX_BYTES) {
      return Promise.reject(new Error("La imagen supera 5 MB (límite del bucket)."));
    }
    const sb = window.sb;
    const id = randomUuidV4();
    const path = syncCtx.userId + "/" + id + ".jpg";
    const sortOrder = state.gallery.length;
    return sb.storage
      .from(BUCKET_GALLERY)
      .upload(path, blob, { contentType: "image/jpeg", upsert: true })
      .then(function (up) {
        if (up.error) return Promise.reject(up.error);
        const pub = publicStorageUrl(BUCKET_GALLERY, path);
        return sb
          .from("gallery_photos")
          .insert({
            id: id,
            keepsake_id: syncCtx.keepsakeId,
            storage_path: path,
            title: title || "",
            alt: alt || "",
            is_favorite: false,
            sort_order: sortOrder,
          })
          .select()
          .single()
          .then(function (ins) {
            if (ins.error) return Promise.reject(ins.error);
            state.gallery.push({
              id: ins.data.id,
              src: pub,
              storagePath: path,
              title: ins.data.title || "",
              alt: ins.data.alt || "",
              favorite: !!ins.data.is_favorite,
              addedAt: new Date(ins.data.created_at || Date.now()).getTime(),
            });
            saveState(state);
          });
      });
  }

  function updateAdminCloudUI() {
    const wrap = document.getElementById("admin-cloud-wrap");
    if (!wrap) return;
    if (!window.sb) {
      wrap.classList.add("hidden");
      return;
    }
    wrap.classList.remove("hidden");
    const out = document.getElementById("admin-sb-logged-out");
    const inn = document.getElementById("admin-sb-logged-in");
    const emailEl = document.getElementById("admin-sb-user-email");
    window.sb.auth.getSession().then(function (res) {
      const session = res.data && res.data.session;
      if (session && session.user) {
        if (out) out.classList.add("hidden");
        if (inn) inn.classList.remove("hidden");
        if (emailEl) emailEl.textContent = session.user.email || "";
      } else {
        if (inn) inn.classList.add("hidden");
        if (out) out.classList.remove("hidden");
        if (emailEl) emailEl.textContent = "";
      }
    });
  }

  function wireSupabaseAdmin() {
    if (!window.sb || supabaseAdminWired) return;
    supabaseAdminWired = true;
    window.sb.auth.onAuthStateChange(function (event) {
      if (event === "SIGNED_OUT") {
        syncCtx = { userId: null, keepsakeId: null };
        updateAdminCloudUI();
      }
    });

    document.getElementById("admin-sb-signin")?.addEventListener("click", function () {
      const emailIn = document.getElementById("admin-sb-email");
      const passIn = document.getElementById("admin-sb-password");
      const email = ((emailIn && emailIn.value) || "").trim();
      const password = (passIn && passIn.value) || "";
      if (!email || !password) {
        alert("Introduce email y contraseña de tu usuario en Supabase.");
        return;
      }
      window.sb.auth
        .signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) {
            alert(res.error.message || "No se pudo iniciar sesión. Revisa el usuario en Authentication.");
            return;
          }
          return refreshSyncContext(res.data.user)
            .then(function () {
              return pullRemoteState();
            })
            .then(function () {
              applyStoryToPage();
              fillAdminStoryForm();
              renderAdminGalleryList();
              refreshGalleryViews();
              updateGalleryCountBadge();
              updateAdminCloudUI();
              showToast("Conectado a Supabase; datos cargados desde la nube");
            });
        })
        .catch(function (e) {
          console.error(e);
          alert(e.message || "Error de conexión con Supabase");
        });
    });

    document.getElementById("admin-sb-signout")?.addEventListener("click", function () {
      window.sb.auth.signOut().then(function () {
        syncCtx = { userId: null, keepsakeId: null };
        updateAdminCloudUI();
        showToast("Sesión Supabase cerrada");
      });
    });

    document.getElementById("admin-sb-pull")?.addEventListener("click", function () {
      if (!hasRemoteSync()) {
        alert("Inicia sesión primero.");
        return;
      }
      pullRemoteState()
        .then(function () {
          applyStoryToPage();
          fillAdminStoryForm();
          renderAdminGalleryList();
          refreshGalleryViews();
          updateGalleryCountBadge();
          showToast("Sincronizado desde la nube");
        })
        .catch(function (e) {
          console.error(e);
          alert(e.message || "No se pudo traer datos");
        });
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
      img.src = src || "";
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
    if (hasRemoteSync() && item.storagePath && isUuid(item.id) && window.sb) {
      window.sb
        .from("gallery_photos")
        .update({ is_favorite: item.favorite })
        .eq("id", item.id)
        .then(function (r) {
          if (r.error) console.error(r.error);
        });
    }
    saveState(state);
    refreshGalleryViews();
  }

  function deleteGalleryItem(id) {
    const item = galleryItemById(id);
    const applyLocal = function () {
      state.gallery = state.gallery.filter(function (g) {
        return g.id !== id;
      });
      saveState(state);
      refreshGalleryViews();
    };
    if (!item) return;
    if (hasRemoteSync() && item.storagePath && isUuid(item.id) && window.sb) {
      window.sb.storage
        .from(BUCKET_GALLERY)
        .remove([item.storagePath])
        .then(function (rm) {
          if (rm.error) return Promise.reject(rm.error);
          return window.sb.from("gallery_photos").delete().eq("id", item.id);
        })
        .then(function (r) {
          if (r && r.error) return Promise.reject(r.error);
          applyLocal();
        })
        .catch(function (e) {
          console.error(e);
          alert("No se pudo eliminar en la nube. ¿Sesión activa?");
        });
      return;
    }
    applyLocal();
  }

  function renderGalleryGrid() {
    const host = document.getElementById("gallery-grid");
    if (!host) return;
    if (!state.gallery.length) {
      host.innerHTML =
        '<p class="col-span-full text-center font-body text-on-surface-variant py-16">Aún no hay fotos. Usa el botón + o el panel de administración.</p>';
      return;
    }
    host.innerHTML = state.gallery
      .map(function (item) {
        const fill = item.favorite ? "1" : "0";
        return (
          '<div class="relative bg-surface-container-lowest p-3 sticker-shadow rounded-lg group">' +
          '<div class="aspect-square overflow-hidden bg-surface-container rounded">' +
          '<img src="' +
          escapeAttr(item.src) +
          '" alt="' +
          escapeAttr(item.alt || "") +
          '" class="w-full h-full object-cover" loading="lazy"/>' +
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
        '<p class="col-span-full text-center font-body text-on-surface-variant py-16">Marca corazones en la galería para verlos aquí.</p>';
      return;
    }
    host.innerHTML = list
      .map(function (item) {
        return (
          '<div class="relative bg-surface-container-lowest p-3 sticker-shadow rounded-lg">' +
          '<div class="aspect-square overflow-hidden bg-surface-container rounded">' +
          '<img src="' +
          escapeAttr(item.src) +
          '" alt="' +
          escapeAttr(item.alt || "") +
          '" class="w-full h-full object-cover" loading="lazy"/>' +
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
        "<span>Reemplazar imagen</span>" +
        '<input type="file" accept="image/*" data-story-file="' +
        meta.key +
        '" class="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-on-primary file:cursor-pointer"/></label>' +
        '<div class="flex items-start gap-3 mt-2">' +
        '<img data-story-preview="' +
        meta.key +
        '" class="max-h-24 max-w-[40%] rounded-lg object-cover border border-outline-variant/30 hidden" alt="Vista previa"/>' +
        '<p class="text-[11px] text-on-surface-variant/75 leading-snug pt-1">JPEG comprimido (~1400px). Se guarda al elegir el archivo.</p>' +
        "</div>" +
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
          '<div class="flex items-center gap-3 p-3 border border-outline-variant/20 rounded-xl bg-surface-bright/90 hover:border-primary/20 transition-colors">' +
          '<img src="' +
          escapeAttr(item.src) +
          '" class="w-14 h-14 object-cover rounded-lg shrink-0" alt="" loading="lazy"/>' +
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
    updateAdminCloudUI();
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
      btn.classList.toggle("border-primary", on);
      btn.classList.toggle("text-primary", on);
      btn.classList.toggle("border-transparent", !on);
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
      if (hasRemoteSync()) {
        pushAllStoryTextsToRemote()
          .then(function () {
            saveState(state);
            applyStoryToPage();
            showToast("Cambios guardados en la nube");
          })
          .catch(function (e) {
            console.error(e);
            alert(e.message || "Error al guardar en Supabase");
          });
        return;
      }
      state.story = readAdminStoryForm();
      saveState(state);
      applyStoryToPage();
      showToast("Cambios de la página guardados");
    });

    document.getElementById("admin-story-slots")?.addEventListener("change", function (e) {
      const t = e.target;
      if (!t.matches("[data-story-file]")) return;
      const key = t.getAttribute("data-story-file");
      const file = t.files && t.files[0];
      if (!file) return;
      fileToDataUrl(file)
        .then(function (dataUrl) {
          if (hasRemoteSync()) {
            return uploadStorySlotImage(key, dataUrl).then(function () {
              saveState(state);
              applyStoryToPage();
              const prev = document.querySelector('[data-story-preview="' + key + '"]');
              if (prev) {
                prev.src = state.story[key].src;
                prev.classList.remove("hidden");
              }
              t.value = "";
              showToast("Imagen subida a la nube");
            });
          }
          state.story[key] = state.story[key] || {};
          state.story[key].src = dataUrl;
          delete state.story[key].storagePath;
          saveState(state);
          applyStoryToPage();
          const prev = document.querySelector('[data-story-preview="' + key + '"]');
          if (prev) {
            prev.src = dataUrl;
            prev.classList.remove("hidden");
          }
          t.value = "";
          showToast("Imagen actualizada");
        })
        .catch(function (err) {
          alert(err.message || "Error al procesar la imagen");
        });
    });

    document.getElementById("gallery-upload-btn")?.addEventListener("click", function () {
      const titleIn = document.getElementById("gallery-new-title");
      const altIn = document.getElementById("gallery-new-alt");
      const fileIn = document.getElementById("gallery-new-file");
      const file = fileIn && fileIn.files && fileIn.files[0];
      if (!file) {
        alert("Elige una imagen.");
        return;
      }
      fileToDataUrl(file)
        .then(function (dataUrl) {
          const title = (titleIn && titleIn.value.trim()) || "";
          const alt = (altIn && altIn.value.trim()) || "";
          if (hasRemoteSync()) {
            return uploadGalleryToRemote(dataUrl, title, alt).then(function () {
              if (titleIn) titleIn.value = "";
              if (altIn) altIn.value = "";
              if (fileIn) fileIn.value = "";
              renderAdminGalleryList();
              updateGalleryCountBadge();
              refreshGalleryViews();
              showToast("Foto subida al bucket y guardada en la base");
            });
          }
          state.gallery.push({
            id: uid(),
            src: dataUrl,
            title: title,
            alt: alt,
            favorite: false,
            addedAt: Date.now(),
          });
          saveState(state);
          if (titleIn) titleIn.value = "";
          if (altIn) altIn.value = "";
          if (fileIn) fileIn.value = "";
          renderAdminGalleryList();
          updateGalleryCountBadge();
          refreshGalleryViews();
          showToast("Foto añadida a la galería");
        })
        .catch(function (err) {
          alert(err.message || "Error");
        });
    });

    document.getElementById("admin-reset-all")?.addEventListener("click", function () {
      if (
        confirm(
          "¿Restaurar todo al diseño original? Se borrarán fotos, textos y galería guardados en este dispositivo."
        )
      ) {
        localStorage.removeItem(STORAGE_KEY);
        state = loadState();
        applyStoryToPage();
        fillAdminStoryForm();
        renderAdminGalleryList();
        updateGalleryCountBadge();
        refreshGalleryViews();
        closeAdmin();
        showToast("Valores por defecto restaurados");
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
    wireSupabaseAdmin();
    updateAdminCloudUI();
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
    if (window.sb) {
      window.sb.auth
        .getSession()
        .then(function (res) {
          const session = res.data && res.data.session;
          if (session && session.user) {
            return refreshSyncContext(session.user)
              .then(function () {
                return pullRemoteState();
              })
              .catch(function (e) {
                console.warn("OurBook: no se pudo cargar desde Supabase", e);
              })
              .finally(finishStartApp);
          }
          finishStartApp();
        })
        .catch(function () {
          finishStartApp();
        });
      return;
    }
    finishStartApp();
  }

  var boot = window._ourbookBoot;
  if (boot && typeof boot.then === "function") {
    boot.then(startApp).catch(startApp);
  } else {
    startApp();
  }
})();
