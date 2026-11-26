document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js");

  const preloader = document.getElementById("preloader");
  const enterGarden = document.getElementById("enter-garden");
  const mainContent = document.getElementById("main");
  const navHeader = document.getElementById("navbar");
  const skipLink = document.querySelector(".skip-link");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pandaGreeting = document.getElementById("panda-greeting");
  let preloaderDismissed = false;
  let preloaderCloseTimer = 0;
  let pandaGreetingTimer = 0;

  const showPandaGreeting = (x, y) => {
    pandaGreeting.style.left = `${Math.max(54, Math.min(window.innerWidth - 54, x))}px`;
    pandaGreeting.style.top = `${Math.max(62, Math.min(window.innerHeight - 18, y - 14))}px`;
    pandaGreeting.textContent = "hi!";
    pandaGreeting.classList.add("is-visible");
    window.clearTimeout(pandaGreetingTimer);
    pandaGreetingTimer = window.setTimeout(() => pandaGreeting.classList.remove("is-visible"), 1800);
  };

  const greetPandaIcon = (pandaIcon) => {
    pandaIcon.classList.remove("is-waving");
    void pandaIcon.offsetWidth;
    pandaIcon.classList.add("is-waving");
    pandaIcon.addEventListener("animationend", () => pandaIcon.classList.remove("is-waving"), { once: true });

    const bounds = pandaIcon.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent("panda-greet", {
      detail: { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 }
    }));
  };

  document.addEventListener("click", (event) => {
    const pandaIcon = event.target instanceof Element ? event.target.closest("[data-panda-greet]") : null;
    if (pandaIcon) greetPandaIcon(pandaIcon);
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const pandaIcon = event.target instanceof Element
      ? event.target.closest('[data-panda-greet][role="button"]')
      : null;
    if (!pandaIcon) return;
    event.preventDefault();
    greetPandaIcon(pandaIcon);
  });

  window.addEventListener("panda-greet", (event) => {
    showPandaGreeting(event.detail.x, event.detail.y);
  });

  mainContent.inert = true;
  navHeader.inert = true;
  skipLink.inert = true;

  const dismissPreloader = () => {
    if (preloaderDismissed) return;
    preloaderDismissed = true;
    window.clearTimeout(preloaderCloseTimer);
    preloader.setAttribute("aria-hidden", "true");
    preloader.classList.add("is-leaving");
    document.body.classList.remove("preloader-open");
    mainContent.inert = false;
    navHeader.inert = false;
    skipLink.inert = false;
    window.dispatchEvent(new Event("garden-preloader-dismissed"));
    window.setTimeout(() => {
      preloader.hidden = true;
      mainContent.focus({ preventScroll: true });
    }, 700);
  };

  window.setTimeout(() => {
    if (preloaderDismissed) return;
    enterGarden.classList.add("is-ready");
    enterGarden.focus({ preventScroll: true });
  }, reduceMotion ? 100 : 1900);
  preloaderCloseTimer = window.setTimeout(dismissPreloader, reduceMotion ? 1800 : 10400);
  enterGarden.addEventListener("click", dismissPreloader);
  preloader.addEventListener("keydown", (event) => {
    if (event.key === "Escape") dismissPreloader();
  });

  const nav = document.getElementById("nav-menu");
  const navToggle = document.getElementById("nav-toggle");

  const closeMenu = () => {
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") !== "true";
    nav.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const phrases = ["Data Analyst", "Data Science Intern", "Power BI Learner", "Open Source Contributor"];
  const typing = document.getElementById("typing-text");
  let phraseIndex = 0;
  let characterIndex = 0;
  let deleting = false;

  const typePhrase = () => {
    const phrase = phrases[phraseIndex];
    typing.textContent = phrase.slice(0, characterIndex);
    if (!deleting && characterIndex === phrase.length) {
      deleting = true;
      window.setTimeout(typePhrase, 1300);
      return;
    }
    if (deleting && characterIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    characterIndex += deleting ? -1 : 1;
    window.setTimeout(typePhrase, deleting ? 38 : 75);
  };
  typePhrase();

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...nav.querySelectorAll(".nav-link")];
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${entry.target.id}`;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach((section) => sectionObserver.observe(section));

  const canvas = document.getElementById("petal-canvas");
  const context = canvas.getContext("2d");
  let petals = [];
  let animationFrame = 0;

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    petals = Array.from({ length: Math.min(34, Math.floor(window.innerWidth / 38)) }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: 2 + Math.random() * 3,
      speed: .25 + Math.random() * .65,
      drift: (Math.random() - .5) * .55,
      angle: Math.random() * Math.PI,
      spin: (Math.random() - .5) * .018
    }));
  };

  const drawPetals = () => {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    petals.forEach((petal) => {
      petal.y += petal.speed;
      petal.x += petal.drift + Math.sin(petal.y * .012) * .3;
      petal.angle += petal.spin;
      if (petal.y > window.innerHeight + 10) {
        petal.y = -10;
        petal.x = Math.random() * window.innerWidth;
      }
      context.save();
      context.translate(petal.x, petal.y);
      context.rotate(petal.angle);
      context.fillStyle = "rgba(244, 177, 193, .58)";
      context.beginPath();
      context.ellipse(0, 0, petal.size, petal.size * .58, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    });
    animationFrame = window.requestAnimationFrame(drawPetals);
  };

  resizeCanvas();
  if (!reduceMotion) drawPetals();
  window.addEventListener("resize", resizeCanvas);

  const cursor = document.getElementById("cursor-glow");
  if (window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    window.addEventListener("mousemove", (event) => {
      cursor.style.opacity = "1";
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });
    window.addEventListener("blur", () => { cursor.style.opacity = "0"; });
  }

  window.addEventListener("pagehide", () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
  }, { once: true });
});
