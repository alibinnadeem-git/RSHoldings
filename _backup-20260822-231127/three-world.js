import * as THREE
from "three";

import {
  EffectComposer
}
from "three/addons/postprocessing/EffectComposer.js";

import {
  RenderPass
}
from "three/addons/postprocessing/RenderPass.js";

import {
  UnrealBloomPass
}
from "three/addons/postprocessing/UnrealBloomPass.js";

const reduced =
  matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

const C =
  window.RS_CONTENT;

const canvas =
  document.querySelector(
    "#world"
  );

if (
  reduced ||
  !C ||
  !canvas
) {
  document.body.classList.add(
    "webgl-fallback"
  );
} else {
  startWorld();
}

async function startWorld() {
  let renderer;

  try {
    renderer =
      new THREE.WebGLRenderer({
        canvas,
        alpha:true,
        antialias:
          innerWidth > 900,
        powerPreference:
          "high-performance"
      });
  } catch (error) {
    console.warn(
      "WebGL unavailable:",
      error
    );

    document.body.classList.add(
      "webgl-fallback"
    );

    return;
  }

  renderer.outputColorSpace =
    THREE.SRGBColorSpace;

  renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

  renderer.toneMappingExposure =
    1.02;

  renderer.setPixelRatio(
    Math.min(
      devicePixelRatio,
      innerWidth < 768
        ? 1
        : 1.5
    )
  );

  renderer.setSize(
    innerWidth,
    innerHeight,
    false
  );

  const scene =
    new THREE.Scene();

  scene.background =
    new THREE.Color(
      0x031c20
    );

  scene.fog =
    new THREE.Fog(
      0x031c20,
      6,
      31
    );

  const camera =
    new THREE.PerspectiveCamera(
      39,
      innerWidth / innerHeight,
      .1,
      100
    );

  camera.position.set(
    0,
    .1,
    8
  );

  const composer =
    new EffectComposer(
      renderer
    );

  composer.addPass(
    new RenderPass(
      scene,
      camera
    )
  );

  const bloom =
    new UnrealBloomPass(
      new THREE.Vector2(
        innerWidth,
        innerHeight
      ),
      innerWidth < 768
        ? .18
        : .38,
      .7,
      .82
    );

  composer.addPass(
    bloom
  );

  scene.add(
    new THREE.AmbientLight(
      0xb8d5d4,
      .55
    )
  );

  const goldLight =
    new THREE.PointLight(
      0xc7a469,
      7,
      20
    );

  goldLight.position.set(
    -4,
    4,
    5
  );

  scene.add(goldLight);

  const tealLight =
    new THREE.PointLight(
      0x2ca6ad,
      7,
      22
    );

  tealLight.position.set(
    5,
    0,
    2
  );

  scene.add(tealLight);

  const worldGrid =
    new THREE.GridHelper(
      42,
      56,
      0xc7a469,
      0x0a5258
    );

  worldGrid.position.y =
    -3.55;

  worldGrid.material.transparent =
    true;

  worldGrid.material.opacity =
    .15;

  scene.add(worldGrid);

  const river =
    createRiver();

  scene.add(river.mesh);

  const particles =
    createParticles();

  scene.add(particles);

  const rings =
    createBrandRings();

  scene.add(rings);

  const sceneOrder = [
    "arrival",
    "waterfront",
    "marina",
    "promenade",
    "boulevard",
    "qantara",
    "community",
    "development",
    "location",
    "investment"
  ];

  const groups =
    new Map();

  const buildPromises =
    new Map();

  let activeIndex = 0;

  const mobile =
    innerWidth < 768;

  const textureLoader =
    new THREE.TextureLoader();

  const maxTextures =
    mobile
      ? 3
      : Infinity;

  const vertexShader = `
    uniform float uTime;
    uniform float uStrength;

    varying vec2 vUv;

    void main() {
      vUv = uv;

      vec3 p = position;

      p.z +=
        sin(
          uv.y * 3.1415926 +
          uTime * .45
        )
        *
        .05
        *
        uStrength;

      p.z +=
        sin(
          uv.x * 6.0 +
          uTime * .18
        )
        *
        .012;

      gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(p,1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture;
    uniform float uOpacity;
    uniform float uStrength;

    varying vec2 vUv;

    void main() {
      float split =
        .0022 *
        uStrength;

      float r =
        texture2D(
          uTexture,
          vUv + vec2(split,0.0)
        ).r;

      float g =
        texture2D(
          uTexture,
          vUv
        ).g;

      float b =
        texture2D(
          uTexture,
          vUv - vec2(split,0.0)
        ).b;

      vec3 color =
        vec3(r,g,b);

      float edge =
        smoothstep(
          .82,
          .30,
          distance(
            vUv,
            vec2(.5)
          )
        );

      color *=
        mix(.72,1.04,edge);

      gl_FragColor =
        vec4(
          color,
          uOpacity
        );
    }
  `;

  function getImages(id) {
    switch (id) {
      case "arrival":
        return C.ard.arrival;

      case "waterfront":
        return C.ard.waterfront;

      case "marina":
        return C.ard.marina;

      case "promenade":
        return C.ard.promenade;

      case "boulevard":
        return C.ard.boulevard;

      case "qantara":
        return C.ard.qantara;

      case "community":
        return C.ard.community.map(
          item => item.src
        );

      case "development":
        return C.ard.development;

      case "location":
        return C.ard.location;

      default:
        return [];
    }
  }

  async function loadTexture(src) {
    return new Promise(resolve => {
      textureLoader.load(
        src,

        texture => {
          texture.colorSpace =
            THREE.SRGBColorSpace;

          texture.anisotropy =
            Math.min(
              8,
              renderer.capabilities
                .getMaxAnisotropy()
            );

          resolve(texture);
        },

        undefined,

        () => resolve(null)
      );
    });
  }

  async function createPlane(
    group,
    src,
    options = {}
  ) {
    const texture =
      await loadTexture(src);

    if (!texture) {
      return null;
    }

    const image =
      texture.image;

    const ratio =
      image.width /
      image.height;

    const width =
      options.width || 4;

    const height =
      width / ratio;

    const geometry =
      new THREE.PlaneGeometry(
        width,
        height,
        mobile ? 8 : 24,
        mobile ? 6 : 16
      );

    const material =
      new THREE.ShaderMaterial({
        uniforms:{
          uTexture:{
            value:texture
          },
          uOpacity:{
            value:0
          },
          uStrength:{
            value:0
          },
          uTime:{
            value:0
          }
        },

        vertexShader,
        fragmentShader,
        transparent:true,
        depthWrite:true,
        side:THREE.DoubleSide
      });

    const mesh =
      new THREE.Mesh(
        geometry,
        material
      );

    mesh.position.set(
      options.x || 0,
      options.y || 0,
      options.z || 0
    );

    mesh.rotation.set(
      options.rotationX || 0,
      options.rotationY || 0,
      options.rotationZ || 0
    );

    mesh.userData.home = {
      x:mesh.position.x,
      y:mesh.position.y,
      z:mesh.position.z,
      rotationX:mesh.rotation.x,
      rotationY:mesh.rotation.y,
      rotationZ:mesh.rotation.z
    };

    group.add(mesh);

    return mesh;
  }

  async function buildScene(index) {
    const id =
      sceneOrder[index];

    if (groups.has(id)) {
      return groups.get(id);
    }

    if (buildPromises.has(id)) {
      return buildPromises.get(id);
    }

    const promise =
      (async () => {
        const group =
          new THREE.Group();

        group.name =
          `scene-${id}`;

        group.visible =
          false;

        group.userData.targetAlpha =
          0;

        scene.add(group);

        groups.set(
          id,
          group
        );

        const all =
          getImages(id);

        const files =
          mobile
            ? all.slice(0, maxTextures)
            : all;

        if (id === "arrival") {
          await createPlane(
            group,
            files[0],
            {
              x:1.5,
              y:.05,
              z:-1,
              width:7,
              rotationY:-.15
            }
          );
        }

        if (id === "waterfront") {
          const layout = [
            {
              x:1.5,
              y:0,
              z:-1,
              width:6.7,
              rotationY:-.10
            },
            {
              x:-3.8,
              y:1.5,
              z:-4,
              width:3.2,
              rotationY:.20
            },
            {
              x:4,
              y:-1.9,
              z:-5,
              width:3,
              rotationY:-.20
            }
          ];

          await Promise.all(
            files.map(
              (file, i) =>
                createPlane(
                  group,
                  file,
                  layout[i]
                )
            )
          );
        }

        if (id === "marina") {
          await createPlane(
            group,
            files[0],
            {
              x:1,
              y:0,
              z:-1,
              width:7.3,
              rotationY:-.10
            }
          );
        }

        if (
          id === "promenade" ||
          id === "boulevard" ||
          id === "qantara"
        ) {
          const baseX =
            id === "qantara"
              ? 3.1
              : 3.35;

          const spacing =
            id === "qantara"
              ? 2.05
              : 2.35;

          await Promise.all(
            files.map(
              (file, i) => {
                const side =
                  i % 2 === 0
                    ? -1
                    : 1;

                return createPlane(
                  group,
                  file,
                  {
                    x:
                      side *
                      (
                        baseX +
                        i * .035
                      ),

                    y:
                      (
                        (i % 4) -
                        1.5
                      ) *
                      .95,

                    z:
                      -i *
                      spacing,

                    width:
                      id === "qantara"
                        ? 4.1
                        : 3.9,

                    rotationY:
                      side *
                      -.27
                  }
                );
              }
            )
          );
        }

        if (id === "community") {
          const layout = [
            {
              x:-3,
              y:1.4,
              z:-2,
              width:4.2,
              rotationY:.2
            },
            {
              x:3,
              y:1.25,
              z:-3,
              width:4.2,
              rotationY:-.2
            },
            {
              x:-2.8,
              y:-1.8,
              z:-4,
              width:4,
              rotationY:.16
            },
            {
              x:2.8,
              y:-1.8,
              z:-5,
              width:4,
              rotationY:-.16
            }
          ];

          await Promise.all(
            files.map(
              (file, i) =>
                createPlane(
                  group,
                  file,
                  layout[i]
                )
            )
          );
        }

        if (id === "development") {
          await Promise.all(
            files.map(
              (file, i) => {
                const angle =
                  (
                    i /
                    Math.max(
                      files.length,
                      1
                    )
                  ) *
                  Math.PI *
                  2;

                return createPlane(
                  group,
                  file,
                  {
                    x:
                      Math.cos(angle) *
                      4.2,

                    y:
                      Math.sin(angle) *
                      2,

                    z:
                      -2 -
                      (i % 3) *
                      1.5,

                    width:3.15,

                    rotationY:
                      -Math.cos(angle) *
                      .22
                  }
                );
              }
            )
          );
        }

        if (id === "location") {
          await createPlane(
            group,
            files[0],
            {
              x:0,
              y:-1,
              z:-1.3,
              width:7.4,
              rotationX:-.50
            }
          );
        }

        if (id === "investment") {
          for (
            let i = 0;
            i < 5;
            i++
          ) {
            const ring =
              new THREE.Mesh(
                new THREE.TorusGeometry(
                  2.2,
                  .016,
                  8,
                  160
                ),

                new THREE.MeshBasicMaterial({
                  color:0xc7a469,
                  transparent:true,
                  opacity:.52
                })
              );

            ring.scale.setScalar(
              1 +
              i * .22
            );

            ring.rotation.x =
              .5 +
              i * .18;

            ring.rotation.y =
              i * .31;

            group.add(ring);
          }
        }

        return group;
      })();

    buildPromises.set(
      id,
      promise
    );

    try {
      return await promise;
    } finally {
      buildPromises.delete(id);
    }
  }

  function restoreMesh(mesh) {
    const home =
      mesh.userData.home;

    if (!home) return;

    mesh.position.set(
      home.x,
      home.y,
      home.z
    );

    mesh.rotation.set(
      home.rotationX,
      home.rotationY,
      home.rotationZ
    );
  }

  function disposeGroup(index) {
    const id =
      sceneOrder[index];

    const group =
      groups.get(id);

    if (!group) return;

    group.traverse(object => {
      if (object.geometry) {
        object.geometry.dispose();
      }

      if (object.material) {
        const materials =
          Array.isArray(object.material)
            ? object.material
            : [object.material];

        materials.forEach(material => {
          if (
            material.uniforms
              ?.uTexture
              ?.value
          ) {
            material.uniforms
              .uTexture
              .value
              .dispose();
          }

          material.dispose();
        });
      }
    });

    scene.remove(group);

    groups.delete(id);
  }

  async function activate(index) {
    activeIndex =
      THREE.MathUtils.clamp(
        index,
        0,
        sceneOrder.length - 1
      );

    const id =
      sceneOrder[activeIndex];

    const group =
      await buildScene(activeIndex);

    for (
      const [groupId, item]
      of groups
    ) {
      item.userData.targetAlpha =
        groupId === id
          ? 1
          : 0;

      item.visible =
        true;
    }

    group.children.forEach(
      (mesh, i) => {
        restoreMesh(mesh);

        if (
          mesh.material?.uniforms
        ) {
          mesh.material
            .uniforms
            .uOpacity
            .value =
              0;

          mesh.position.z -=
            2.2 +
            i * .03;
        }
      }
    );

    buildScene(
      Math.min(
        activeIndex + 1,
        sceneOrder.length - 1
      )
    );

    if (activeIndex > 0) {
      buildScene(
        activeIndex - 1
      );
    }

    /*
       Scene retention:
       Desktop retains loaded scenes to eliminate async scene flashes.
       Mobile keeps a small three-scene working set.
    */

    if (mobile) {
      for (
        let i = 0;
        i < sceneOrder.length;
        i++
      ) {
        if (
          Math.abs(
            i - activeIndex
          ) > 2
        ) {
          disposeGroup(i);
        }
      }
    }
  }

  const cameraTarget = {
    x:0,
    y:.1,
    z:8,
    lookX:0,
    lookY:0,
    lookZ:0
  };

  function setCameraForScene(
    id,
    progress
  ) {
    cameraTarget.lookX = 0;
    cameraTarget.lookY = 0;
    cameraTarget.lookZ = 0;

    switch (id) {
      case "arrival":
        cameraTarget.x =
          .15 * progress;

        cameraTarget.y =
          .15 -
          .1 * progress;

        cameraTarget.z =
          8 -
          1.4 * progress;
        break;

      case "waterfront":
        cameraTarget.x =
          -.35 +
          .65 * progress;

        cameraTarget.y =
          .1;

        cameraTarget.z =
          7.2 -
          1.6 * progress;
        break;

      case "marina":
        cameraTarget.x =
          .2 -
          .35 * progress;

        cameraTarget.y =
          .1;

        cameraTarget.z =
          7 -
          1.3 * progress;
        break;

      case "promenade":
        cameraTarget.x =
          Math.sin(
            progress *
            Math.PI *
            2
          ) *
          .35;

        cameraTarget.y =
          .1;

        cameraTarget.z =
          6.5 -
          5.2 * progress;
        break;

      case "boulevard":
        cameraTarget.x =
          Math.sin(
            progress *
            Math.PI *
            1.5
          ) *
          .4;

        cameraTarget.y =
          .05;

        cameraTarget.z =
          6.2 -
          5.5 * progress;
        break;

      case "qantara":
        cameraTarget.x =
          Math.sin(
            progress *
            Math.PI *
            2
          ) *
          .52;

        cameraTarget.y =
          .15 +
          Math.sin(
            progress *
            Math.PI
          ) *
          .2;

        cameraTarget.z =
          6.8 -
          12.5 * progress;
        break;

      case "community":
        cameraTarget.x =
          Math.sin(
            progress *
            Math.PI *
            2
          ) *
          .55;

        cameraTarget.y =
          .1;

        cameraTarget.z =
          7 -
          1.8 * progress;
        break;

      case "development":
        cameraTarget.x =
          Math.sin(
            progress *
            Math.PI *
            2
          ) *
          .8;

        cameraTarget.y =
          Math.cos(
            progress *
            Math.PI
          ) *
          .25;

        cameraTarget.z =
          7 -
          2 * progress;
        break;

      case "location":
        cameraTarget.x = 0;

        cameraTarget.y =
          1.7 -
          1.5 * progress;

        cameraTarget.z =
          8 -
          2.2 * progress;

        cameraTarget.lookY =
          -.7;
        break;

      case "investment":
        cameraTarget.x = 0;
        cameraTarget.y = 0;
        cameraTarget.z =
          7 -
          1.2 * progress;
        break;
    }
  }

  const chapters =
    [
      ...document.querySelectorAll(
        ".immersive-chapter"
      )
    ];

  if (window.ScrollTrigger) {
    chapters.forEach(
      (chapter, index) => {
        const id =
          chapter.dataset.scene;

        ScrollTrigger.create({
          trigger:chapter,
          start:"top 58%",
          end:"bottom 42%",

          onEnter() {
            activate(index);
          },

          onEnterBack() {
            activate(index);
          },

          onUpdate(self) {
            if (index === activeIndex) {
              setCameraForScene(
                id,
                self.progress
              );
            }
          }
        });
      }
    );
  } else {
    activate(0);
  }

  await activate(0);

  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;

  const pointer =
    new THREE.Vector2();

  const raycaster =
    new THREE.Raycaster();

  if (
    matchMedia(
      "(pointer:fine)"
    ).matches
  ) {
    addEventListener(
      "pointermove",
      event => {
        pointerX =
          event.clientX /
          innerWidth -
          .5;

        pointerY =
          event.clientY /
          innerHeight -
          .5;

        pointer.x =
          pointerX *
          2;

        pointer.y =
          -pointerY *
          2;
      },
      {
        passive:true
      }
    );
  }

  let running = true;

  const clock =
    new THREE.Clock();

  function tick() {
    if (!running) return;

    const time =
      clock.getElapsedTime();

    smoothX +=
      (
        pointerX -
        smoothX
      ) * .035;

    smoothY +=
      (
        pointerY -
        smoothY
      ) * .035;

    camera.position.x +=
      (
        cameraTarget.x +
        smoothX * .35 -
        camera.position.x
      ) * .065;

    camera.position.y +=
      (
        cameraTarget.y -
        smoothY * .20 -
        camera.position.y
      ) * .065;

    camera.position.z +=
      (
        cameraTarget.z -
        camera.position.z
      ) * .065;

    camera.lookAt(
      cameraTarget.lookX,
      cameraTarget.lookY,
      cameraTarget.lookZ
    );

    particles.rotation.y =
      time * .012;

    rings.rotation.z =
      time * .035;

    worldGrid.position.z =
      (
        time * .35
      ) % .75;

    river.material.emissiveIntensity =
      1.2 +
      Math.sin(
        time * .8
      ) * .16;

    groups.forEach(group => {
      const target =
        group.userData.targetAlpha || 0;

      let groupHasVisible =
        false;

      group.children.forEach(
        object => {
          const uniforms =
            object.material
              ?.uniforms;

          if (uniforms?.uOpacity) {
            uniforms.uTime.value =
              time;

            uniforms.uOpacity.value +=
              (
                target -
                uniforms.uOpacity.value
              ) * .075;

            groupHasVisible =
              groupHasVisible ||
              uniforms.uOpacity.value > .01;
          }

          if (
            object.material &&
            !uniforms &&
            "opacity" in object.material
          ) {
            object.material.opacity +=
              (
                target * .52 -
                object.material.opacity
              ) * .07;

            groupHasVisible =
              groupHasVisible ||
              object.material.opacity > .01;
          }
        }
      );

      group.visible =
        target > 0 ||
        groupHasVisible;
    });

    const activeId =
      sceneOrder[activeIndex];

    const active =
      groups.get(activeId);

    if (active) {
      const meshes =
        active.children.filter(
          object =>
            object.material
              ?.uniforms
              ?.uStrength
        );

      raycaster.setFromCamera(
        pointer,
        camera
      );

      const hit =
        raycaster.intersectObjects(
          meshes,
          false
        )[0];

      meshes.forEach(mesh => {
        const strength =
          mesh.material
            .uniforms
            .uStrength;

        const target =
          hit &&
          hit.object === mesh
            ? 1
            : 0;

        strength.value +=
          (
            target -
            strength.value
          ) * .07;

        const home =
          mesh.userData.home;

        if (home) {
          mesh.position.z +=
            (
              home.z -
              mesh.position.z
            ) * .06;

          mesh.position.y +=
            (
              home.y -
              mesh.position.y
            ) * .06;
        }
      });
    }

    composer.render();

    requestAnimationFrame(tick);
  }

  tick();

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) {
        running = false;
      } else {
        running = true;
        clock.getDelta();
        tick();
      }
    }
  );

  addEventListener(
    "resize",
    () => {
      camera.aspect =
        innerWidth /
        innerHeight;

      camera.updateProjectionMatrix();

      renderer.setPixelRatio(
        Math.min(
          devicePixelRatio,
          innerWidth < 768
            ? 1
            : 1.5
        )
      );

      renderer.setSize(
        innerWidth,
        innerHeight,
        false
      );

      composer.setSize(
        innerWidth,
        innerHeight
      );
    }
  );

  function createRiver() {
    const points = [];

    for (
      let z = -34;
      z <= 10;
      z += .55
    ) {
      points.push(
        new THREE.Vector3(
          Math.sin(
            z * .34
          ) * 2.2,

          -3.3 +
          Math.sin(
            z * .2
          ) * .07,

          z
        )
      );
    }

    const curve =
      new THREE.CatmullRomCurve3(
        points
      );

    const geometry =
      new THREE.TubeGeometry(
        curve,
        240,
        .17,
        10,
        false
      );

    const material =
      new THREE.MeshPhysicalMaterial({
        color:0x43bbc1,
        transparent:true,
        opacity:.55,
        emissive:0x0d666c,
        emissiveIntensity:1.2,
        roughness:.24,
        metalness:.1
      });

    return {
      mesh:
        new THREE.Mesh(
          geometry,
          material
        )
    };
  }

  function createParticles() {
    const count =
      innerWidth < 768
        ? 260
        : 900;

    const positions =
      new Float32Array(
        count * 3
      );

    for (
      let i = 0;
      i < count;
      i++
    ) {
      positions[i * 3] =
        THREE.MathUtils
          .randFloatSpread(30);

      positions[i * 3 + 1] =
        THREE.MathUtils
          .randFloat(-2, 6);

      positions[i * 3 + 2] =
        THREE.MathUtils
          .randFloat(-30, 6);
    }

    const geometry =
      new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    return new THREE.Points(
      geometry,

      new THREE.PointsMaterial({
        color:0xc7a469,
        size:.025,
        transparent:true,
        opacity:.5,
        depthWrite:false
      })
    );
  }

  function createBrandRings() {
    const group =
      new THREE.Group();

    group.position.set(
      4.6,
      1.7,
      -5
    );

    for (
      let i = 0;
      i < 4;
      i++
    ) {
      const ring =
        new THREE.Mesh(
          new THREE.TorusGeometry(
            1.2 +
            i * .38,
            .012,
            6,
            130
          ),

          new THREE.MeshBasicMaterial({
            color:
              i % 2
                ? 0x2ca6ad
                : 0xc7a469,

            transparent:true,
            opacity:
              .20 -
              i * .025
          })
        );

      ring.rotation.x =
        .6 +
        i * .25;

      ring.rotation.y =
        .15 +
        i * .18;

      group.add(ring);
    }

    return group;
  }
}
