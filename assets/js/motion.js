(() => {
  "use strict";

  const loader =
    document.querySelector(
      "#preloader"
    );

  const reduced =
    matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  const removeLoader = () => {
    if (!loader) {
      return;
    }

    loader.style.opacity =
      "0";

    setTimeout(
      () => loader.remove(),
      350
    );
  };

  setTimeout(
    removeLoader,
    4500
  );

  if (!window.gsap) {
    removeLoader();
    return;
  }

  const gsap =
    window.gsap;

  const ScrollTrigger =
    window.ScrollTrigger;

  const ScrollSmoother =
    window.ScrollSmoother;

  const SplitText =
    window.SplitText;


  if (ScrollTrigger) {
    gsap.registerPlugin(
      ScrollTrigger
    );
  }

  if (ScrollSmoother) {
    gsap.registerPlugin(
      ScrollSmoother
    );
  }

  if (SplitText) {
    gsap.registerPlugin(
      SplitText
    );
  }


  /* PRELOADER */

  const progress = {
    value:0
  };

  gsap.timeline({
    onComplete() {
      loader?.remove();
    }
  })
  .to(
    progress,
    {
      value:100,
      duration:.75,
      ease:"power3.inOut",

      onUpdate() {
        const node =
          document.querySelector(
            "#preloader-percent"
          );

        if (node) {
          node.textContent =
            Math.round(
              progress.value
            )
            .toString()
            .padStart(2,"0");
        }
      }
    }
  )
  .to(
    "#preloader-bar",
    {
      scaleX:1,
      duration:.75,
      ease:"power3.inOut"
    },
    0
  )
  .from(
    ".preloader__logo",
    {
      opacity:0,
      scale:.95,
      duration:.6
    },
    0
  )
  .to(
    loader,
    {
      yPercent:-100,
      duration:.7,
      ease:"power4.inOut"
    },
    "+=.04"
  );


  if (
    reduced ||
    !ScrollTrigger
  ) {
    return;
  }


  /* SMOOTHER */

  let smoother = null;

  if (
    ScrollSmoother &&
    innerWidth > 767
  ) {
    try {
      smoother =
        ScrollSmoother.create({
          wrapper:"#smooth-wrapper",
          content:"#smooth-content",
          smooth:.85,
          effects:true,
          smoothTouch:0
        });
    } catch (error) {
      console.warn(
        "ScrollSmoother disabled:",
        error
      );
    }
  }


  /* HERO */

  if (SplitText) {
    try {
      const split =
        new SplitText(
          ".hero__title",
          {
            type:"lines,words",
            mask:"lines"
          }
        );

      gsap.timeline({
        defaults:{
          ease:"power4.out"
        }
      })
      .from(
        ".hero__eyebrow",
        {
          opacity:0,
          y:15,
          duration:.5
        }
      )
      .from(
        split.words,
        {
          yPercent:110,
          opacity:0,
          stagger:.018,
          duration:.9
        },
        "-=.25"
      )
      .from(
        ".hero__copy",
        {
          opacity:0,
          y:18,
          duration:.6
        },
        "-=.45"
      )
      .from(
        ".hero__actions > *",
        {
          opacity:0,
          y:12,
          stagger:.05,
          duration:.45
        },
        "-=.35"
      );
    } catch {}
  }


  /* STANDARD REVEALS */

  gsap.utils
    .toArray(".reveal")
    .forEach(element => {

      gsap.from(
        element,
        {
          opacity:0,
          y:24,
          duration:.78,
          ease:"power3.out",

          scrollTrigger:{
            trigger:element,
            start:"top 90%",
            once:true
          }
        }
      );
    });


  /* HERO PARALLAX */

  gsap.to(
    ".hero__fallback img",
    {
      yPercent:8,
      scale:1.05,
      ease:"none",

      scrollTrigger:{
        trigger:".hero",
        start:"top top",
        end:"bottom top",
        scrub:true
      }
    }
  );


  /* CITY PARALLAX */

  gsap.to(
    ".city-section > img",
    {
      yPercent:-9,
      ease:"none",

      scrollTrigger:{
        trigger:".city-section",
        start:"top bottom",
        end:"bottom top",
        scrub:true
      }
    }
  );


  /* IMMERSIVE IMAGE MOVEMENT */

  document
    .querySelectorAll(
      ".immersive-chapter"
    )
    .forEach(chapter => {

      const frames =
        chapter.querySelectorAll(
          ".scene-fallback__frame"
        );

      frames.forEach(
        (frame,index) => {

          gsap.fromTo(
            frame,
            {
              y:
                12 +
                index * 4,
              scale:.97
            },
            {
              y:
                -10 -
                index * 3,
              scale:1.008,
              ease:"none",

              scrollTrigger:{
                trigger:chapter,
                start:"top bottom",
                end:"bottom top",
                scrub:.7
              }
            }
          );
        }
      );

      const copy =
        chapter.querySelector(
          ".scene-copy"
        );

      if (copy) {
        gsap.fromTo(
          copy,
          {
            opacity:.45,
            y:20
          },
          {
            opacity:1,
            y:0,
            ease:"none",

            scrollTrigger:{
              trigger:chapter,
              start:"top 78%",
              end:"center 62%",
              scrub:.45
            }
          }
        );

        gsap.to(
          copy,
          {
            opacity:.35,
            y:-16,
            ease:"none",

            scrollTrigger:{
              trigger:chapter,
              start:"center 30%",
              end:"bottom 15%",
              scrub:.45
            }
          }
        );
      }
    });


  /* LAND DRAWING */

  document
    .querySelectorAll(
      ".land-wire path"
    )
    .forEach(path => {

      const length =
        path.getTotalLength();

      gsap.set(
        path,
        {
          strokeDasharray:length,
          strokeDashoffset:length
        }
      );

      gsap.to(
        path,
        {
          strokeDashoffset:0,
          ease:"none",

          scrollTrigger:{
            trigger:"#land",
            start:"top 75%",
            end:"bottom 65%",
            scrub:1
          }
        }
      );
    });


  /* SCROLL PROGRESS */

  ScrollTrigger.create({
    start:0,
    end:"max",

    onUpdate(self) {
      gsap.set(
        "#scroll-progress",
        {
          scaleX:self.progress
        }
      );
    }
  });


  /* STORY PROGRESS */

  ScrollTrigger.create({
    trigger:"#ravi",
    start:"top top",
    end:"bottom bottom",

    onUpdate(self) {
      gsap.set(
        "#story-rail-progress",
        {
          scaleY:self.progress
        }
      );
    }
  });


  /* HEADER-SAFE ANCHORS */

  document
    .querySelectorAll(
      'a[href^="#"]'
    )
    .forEach(link => {

      link.addEventListener(
        "click",
        event => {

          const href =
            link.getAttribute(
              "href"
            );

          if (
            !href ||
            href === "#"
          ) {
            return;
          }

          const target =
            document.querySelector(
              href
            );

          if (!target) {
            return;
          }

          event.preventDefault();

          const header =
            document.querySelector(
              "#site-header"
            );

          const offset =
            (
              header?.offsetHeight ||
              70
            ) +
            64;

          if (smoother) {
            const y =
              smoother.offset(
                target,
                "top top"
              ) -
              offset;

            smoother.scrollTo(
              y,
              true
            );
          } else {
            const y =
              target.getBoundingClientRect().top +
              window.scrollY -
              offset;

            window.scrollTo({
              top:y,
              behavior:"smooth"
            });
          }
        }
      );
    });


  /* MAGNETIC - DESKTOP ONLY */

  if (
    matchMedia(
      "(pointer:fine)"
    ).matches
  ) {

    document
      .querySelectorAll(
        ".magnetic"
      )
      .forEach(element => {

        element.addEventListener(
          "pointermove",
          event => {

            const rect =
              element.getBoundingClientRect();

            gsap.to(
              element,
              {
                x:
                  (
                    event.clientX -
                    rect.left -
                    rect.width / 2
                  ) * .09,

                y:
                  (
                    event.clientY -
                    rect.top -
                    rect.height / 2
                  ) * .09,

                duration:.22
              }
            );
          }
        );

        element.addEventListener(
          "pointerleave",
          () => {

            gsap.to(
              element,
              {
                x:0,
                y:0,
                duration:.45,
                ease:"power3.out"
              }
            );
          }
        );
      });
  }


  setTimeout(
    () => ScrollTrigger.refresh(),
    250
  );
})();
