(() => {
  "use strict";

  document.documentElement.classList.add(
    "js-enhanced"
  );


  /* WebGL is enhancement only */

  window.setTimeout(() => {
    if (
      !document.body.classList.contains(
        "webgl-ready"
      )
    ) {
      document.body.classList.add(
        "webgl-fallback"
      );
    }
  }, 2800);


  /* Contact transparency */

  const form =
    document.querySelector(
      "#inquiry-form"
    );

  if (form) {

    const submit =
      form.querySelector(
        '[type="submit"]'
      );

    if (submit) {
      submit.textContent =
        "Prepare Inquiry";
    }

    if (
      !form.querySelector(
        ".contact-delivery-note"
      )
    ) {

      const note =
        document.createElement(
          "p"
        );

      note.className =
        "contact-delivery-note";

      note.textContent =
        "This website does not yet transmit inquiry details to an external recipient. Use Prepare Inquiry to review and copy your details until the official contact channel is configured.";

      form.appendChild(
        note
      );
    }
  }


  /* Native image failure protection */

  document
    .querySelectorAll(
      ".native-scene img, .portfolio-v5 img, .leader-v5 img"
    )
    .forEach(image => {

      image.addEventListener(
        "error",
        () => {
          image.closest(
            "figure, .portfolio-v5__media"
          )?.classList.add(
            "image-load-failed"
          );
        },
        { once:true }
      );
    });


  /* refresh GSAP once layout images settle */

  window.addEventListener(
    "load",
    () => {
      window.ScrollTrigger?.refresh?.();
    },
    { once:true }
  );

})();
