(() => {
  "use strict";

  const C = window.RS_CONTENT;

  if (!C) {
    console.error("RS_CONTENT missing.");
    return;
  }

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const escapeHTML = value =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");


  /* ==========================================================
     BRAND
     ========================================================== */

  function initBrand() {
    const primary =
      C.brand?.primary;

    const alternate =
      C.brand?.alternate ||
      primary;

    [
      "#header-logo",
      "#preloader-logo",
      "#footer-logo"
    ].forEach(selector => {
      const node = $(selector);

      if (node && primary) {
        node.src = primary;
      }
    });

    const finalLogo =
      $("#final-logo");

    if (finalLogo && alternate) {
      finalLogo.src =
        alternate;
    }
  }


  /* ==========================================================
     STATIC HERO IMAGERY
     ========================================================== */

  function initStaticImages() {
    const hero =
      $("#hero-image");

    const lahore =
      $("#lahore-image");

    if (hero && C.lahore?.[0]) {
      hero.src =
        C.lahore[0];
    }

    if (lahore && C.lahore?.[1]) {
      lahore.src =
        C.lahore[1];
    }
  }


  /* ==========================================================
     IMMERSIVE FALLBACK / EDITORIAL IMAGE SYSTEM

     Three.js is enhancement.
     These images guarantee the user always sees the project.
     ========================================================== */

  function sceneImages(scene) {
    switch (scene) {
      case "arrival":
        return C.ard.arrival || [];

      case "waterfront":
        return C.ard.waterfront || [];

      case "marina":
        return C.ard.marina || [];

      case "promenade":
        return C.ard.promenade || [];

      case "boulevard":
        return C.ard.boulevard || [];

      case "qantara":
        return C.ard.qantara || [];

      case "community":
        return (C.ard.community || [])
          .map(item => item.src);

      case "development":
        return C.ard.development || [];

      case "location":
        return C.ard.location || [];

      default:
        return [];
    }
  }

  function strongestSceneImages(scene, files) {
    const desktopLimits = {
      arrival:1,
      waterfront:3,
      marina:1,
      promenade:4,
      boulevard:4,
      qantara:5,
      community:4,
      development:5,
      location:1
    };

    const mobileLimits = {
      arrival:1,
      waterfront:2,
      marina:1,
      promenade:2,
      boulevard:2,
      qantara:3,
      community:2,
      development:3,
      location:1
    };

    const mobile =
      matchMedia("(max-width: 767px)").matches;

    const limit =
      mobile
        ? mobileLimits[scene]
        : desktopLimits[scene];

    return files.slice(
      0,
      limit || files.length
    );
  }

  function renderSceneFallbacks() {
    $$(".immersive-chapter").forEach(
      (chapter, chapterIndex) => {

        const scene =
          chapter.dataset.scene;

        if (
          !scene ||
          scene === "investment"
        ) {
          return;
        }

        const files =
          strongestSceneImages(
            scene,
            sceneImages(scene)
          );

        if (!files.length) {
          return;
        }

        chapter
          .querySelector(".scene-fallback")
          ?.remove();

        const layer =
          document.createElement("div");

        layer.className =
          `scene-fallback scene-fallback--${scene}`;

        layer.setAttribute(
          "aria-hidden",
          "true"
        );

        const media =
          document.createElement("div");

        media.className =
          "scene-fallback__media";

        files.forEach(
          (src, index) => {

            const figure =
              document.createElement("figure");

            figure.className =
              `scene-fallback__frame scene-fallback__frame--${index + 1}`;

            const image =
              document.createElement("img");

            image.src = src;
            image.alt = "";

            image.loading =
              chapterIndex === 0
                ? "eager"
                : "lazy";

            image.decoding =
              "async";

            figure.appendChild(
              image
            );

            media.appendChild(
              figure
            );
          }
        );

        const shade =
          document.createElement("div");

        shade.className =
          "scene-fallback__shade";

        layer.append(
          media,
          shade
        );

        chapter.prepend(
          layer
        );
      }
    );
  }


  /* ==========================================================
     PORTFOLIO
     ========================================================== */

  const PROJECTS = [
    {
      name:"ARD City",
      market:"Ravi City / RUDA",
      copy:
        "Riverfront, commercial, residential and development-led opportunity considered through location, planning and long-term urban context.",
      image:C.ard.arrival?.[0]
    },

    {
      name:"Sapphire Bay",
      market:"Ravi City / RUDA",
      copy:
        "Selected opportunities within the broader riverfront development environment.",
      image:C.ard.waterfront?.[0]
    },

    {
      name:"Gulberg Commercial",
      market:"Lahore",
      copy:
        "Commercial plots, high-rise assets, corporate properties and strategic development sites.",
      image:C.lahore?.[1]
    },

    {
      name:"Chahar Bagh",
      market:"Ravi City / RUDA",
      copy:
        "Selected residential and development opportunities considered through location, planning and market context.",
      image:C.ard.location?.[0]
    },

    {
      name:"DHA",
      market:"Pakistan",
      copy:
        "Residential, commercial, development-land and strategic acquisition opportunities."
    },

    {
      name:"Bahria",
      market:"Pakistan",
      copy:
        "Selected residential, commercial and investment opportunities across established master-planned markets."
    },

    {
      name:"ParkView",
      market:"Lahore · Islamabad",
      copy:
        "Selected opportunities evaluated according to location, demand and long-term market fundamentals."
    },

    {
      name:"Development Land",
      market:"Strategic Advisory",
      copy:
        "Identification, acquisition support, development positioning and strategic transaction advisory.",
      image:C.ard.development?.[0]
    }
  ];

  function renderPortfolio() {
    const grid =
      $("#portfolio-grid");

    if (!grid) {
      return;
    }

    grid.innerHTML = "";

    PROJECTS.forEach(
      (project, index) => {

        const card =
          document.createElement("article");

        card.className =
          [
            "project-v2",
            `project-v2--${index + 1}`,
            "reveal"
          ].join(" ");

        card.innerHTML = `
          <div class="project-v2__media">

            ${
              project.image
                ? `
                  <img
                    src="${escapeHTML(project.image)}"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  >
                `
                : `
                  <div class="project-v2__geometry" aria-hidden="true">
                    <i></i>
                    <i></i>
                    <i></i>
                  </div>
                `
            }

            <div class="project-v2__shade"></div>

          </div>

          <div class="project-v2__content">

            <div class="project-v2__index">
              <span>${String(index + 1).padStart(2, "0")}</span>
              <span>${escapeHTML(project.market)}</span>
            </div>

            <h3>
              ${escapeHTML(project.name)}
            </h3>

            <p>
              ${escapeHTML(project.copy)}
            </p>

            <div class="project-v2__rule"></div>

          </div>
        `;

        grid.appendChild(
          card
        );
      }
    );
  }


  /* ==========================================================
     LEADERSHIP — EXACTLY ONE IMAGE PER PERSON
     ========================================================== */

  function renderLeadership() {
    const grid =
      $("#leadership-grid");

    if (!grid) {
      return;
    }

    grid.innerHTML = "";

    const bios = {
      "Atif Hussain Jami":
        "Provides strategic direction across business development, institutional relationships and real-estate activities.",

      "Barrister Hesham Sultan Ijaz":
        "Contributes legal, strategic and corporate expertise to governance and business direction.",

      "Syed Harron Gillani":
        "Contributes strategic, commercial and institutional insight to the wider business.",

      "Muhammad Fahad Butt":
        "Leads corporate sales, strategic clients and high-value real-estate transactions.",

      "Imran Ch.":
        "Responsible for sales operations, execution, network coordination and operational growth."
    };

    C.leadership.forEach(
      (leader, index) => {

        const primary =
          leader.images?.[0] || "";

        const initials =
          leader.name
            .split(/\s+/)
            .slice(0,2)
            .map(word => word[0])
            .join("");

        const article =
          document.createElement(
            "article"
          );

        article.className =
          "leader-v2 reveal";

        article.innerHTML = `

          <div class="leader-v2__media">

            ${
              primary
                ? `
                  <img
                    src="${escapeHTML(primary)}"
                    alt="${escapeHTML(leader.name)}"
                    loading="lazy"
                    decoding="async"
                  >
                `
                : `
                  <div class="leader-v2__placeholder">
                    <span>
                      ${escapeHTML(initials)}
                    </span>
                  </div>
                `
            }

            <div class="leader-v2__shade"></div>

          </div>

          <div class="leader-v2__content">

            <div class="leader-v2__index">
              <span>
                ${String(index + 1).padStart(2, "0")}
              </span>

              <span>
                Leadership
              </span>
            </div>

            <h3>
              ${escapeHTML(leader.name)}
            </h3>

            <p class="leader-v2__role">
              ${escapeHTML(leader.role)}
            </p>

            <p class="leader-v2__bio">
              ${
                escapeHTML(
                  bios[leader.name] ||
                  "Strategic leadership and advisory experience."
                )
              }
            </p>

          </div>
        `;

        grid.appendChild(
          article
        );
      }
    );
  }


  /* ==========================================================
     MENU
     ========================================================== */

  function initMenu() {
    const toggle =
      $("#menu-toggle");

    const menu =
      $("#mobile-menu");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener(
      "click",
      () => {

        const open =
          toggle.getAttribute(
            "aria-expanded"
          ) === "true";

        toggle.setAttribute(
          "aria-expanded",
          String(!open)
        );

        menu.classList.toggle(
          "open",
          !open
        );

        document.body.classList.toggle(
          "menu-open",
          !open
        );
      }
    );

    $$("a", menu).forEach(
      link => {
        link.addEventListener(
          "click",
          () => {

            toggle.setAttribute(
              "aria-expanded",
              "false"
            );

            menu.classList.remove(
              "open"
            );

            document.body.classList.remove(
              "menu-open"
            );
          }
        );
      }
    );
  }


  /* ==========================================================
     FORM
     ========================================================== */

  function buildInquiry(form) {
    const data =
      new FormData(form);

    return [
      "RS HOLDINGS — WEBSITE INQUIRY",
      "",
      `Name: ${data.get("name") || ""}`,
      `Email: ${data.get("email") || ""}`,
      `Phone / WhatsApp: ${data.get("phone") || ""}`,
      `Requirement: ${data.get("intent") || ""}`,
      `Market / Project: ${data.get("market") || "Not specified"}`,
      `Investment Range: ${data.get("budget") || "Not specified"}`,
      "",
      "Message:",
      String(data.get("message") || "")
    ].join("\n");
  }

  function initForm() {
    const form =
      $("#inquiry-form");

    const copyButton =
      $("#copy-inquiry");

    const status =
      $("#form-status");

    if (!form || !status) {
      return;
    }

    async function copyInquiry() {
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      try {
        await navigator.clipboard.writeText(
          buildInquiry(form)
        );

        status.textContent =
          "Inquiry copied. Direct submission will be enabled after the official RS Holdings contact details are confirmed.";
      } catch {
        status.textContent =
          "Clipboard permission was blocked by the browser.";
      }
    }

    form.addEventListener(
      "submit",
      event => {
        event.preventDefault();
        copyInquiry();
      }
    );

    copyButton?.addEventListener(
      "click",
      copyInquiry
    );
  }


  /* ==========================================================
     IMAGE ERROR HANDLING
     ========================================================== */

  function initImageErrors() {
    $$("img").forEach(
      image => {

        image.addEventListener(
          "error",
          () => {
            image.classList.add(
              "asset-failed"
            );
          },
          {
            once:true
          }
        );
      }
    );
  }


  /* ==========================================================
     YEAR
     ========================================================== */

  function initYear() {
    const year =
      $("#year");

    if (year) {
      year.textContent =
        new Date().getFullYear();
    }
  }


  /* ==========================================================
     START
     ========================================================== */

  initBrand();
  initStaticImages();

  /* V5 static HTML owns this content: renderSceneFallbacks(); */
  /* V5 static HTML owns this content: renderPortfolio(); */
  /* V5 static HTML owns this content: renderLeadership(); */

  initMenu();
  initForm();
  initImageErrors();
  initYear();

  window.dispatchEvent(
    new CustomEvent(
      "rs:content-ready"
    )
  );
})();
