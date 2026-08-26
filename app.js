const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

const menu = document.getElementById("menu");
const burger = document.getElementById("burger");
const nav = document.querySelector(".nav");
const progress = document.getElementById("scroll-progress");
let scrollTicking = false;

const updateScrollState = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progressValue = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress?.style.setProperty("--progress", `${progressValue}%`);
  nav?.classList.toggle("is-scrolled", window.scrollY > 18);
  document.documentElement.style.setProperty("--hero-shift", `${Math.min(window.scrollY * 0.12, 42)}px`);
  scrollTicking = false;
};

window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateScrollState);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollState();

document.querySelectorAll("[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.getAttribute("data-scroll");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    menu?.classList.remove("is-open");
    burger?.classList.remove("is-open");
  });
});

burger?.addEventListener("click", () => {
  menu?.classList.toggle("is-open");
  burger.classList.toggle("is-open");
});

document.querySelectorAll(".job-head").forEach((button) => {
  button.addEventListener("click", () => {
    const job = button.closest(".job");
    const willOpen = !job.classList.contains("is-open");
    document.querySelectorAll(".job").forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector(".job-head")?.setAttribute("aria-expanded", "false");
    });
    if (willOpen) {
      job.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

const navButtons = [...document.querySelectorAll("#menu button")];
const sectionIds = ["about", "work", "projects", "craft", "path", "contact"];

sectionIds.forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      navButtons.forEach((btn) => {
        btn.classList.toggle("is-active", btn.getAttribute("data-scroll") === id);
      });
    },
    { rootMargin: "-35% 0px -50% 0px", threshold: 0.08 }
  );
  observer.observe(el);
});

const growthStages = ["seed", "seedling", "vegetative", "flowering", "fruiting"];
const growthImages = [...document.querySelectorAll("[data-stage-image]")];
const growthSteps = [...document.querySelectorAll(".growth-steps span")];
const growthName = document.querySelector(".growth-stage-name");
const growthVisual = document.querySelector(".growth-visual");
const growthSections = ["top", "about", "work", "projects", "craft"];

const setGrowthStage = (index) => {
  const stage = growthStages[index];
  growthImages.forEach((image) => image.classList.toggle("is-active", image.dataset.stageImage === stage && !image.hidden));
  growthSteps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index));
  if (growthName) growthName.textContent = stage;
};

growthImages.forEach((image) => {
  image.addEventListener("error", () => {
    image.hidden = true;
    growthVisual?.classList.remove("has-image");
  });
  image.addEventListener("load", () => growthVisual?.classList.add("has-image"));
});

growthSections.forEach((id, index) => {
  const section = document.getElementById(id);
  if (!section) return;
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) setGrowthStage(index);
  }, { rootMargin: "-35% 0px -50% 0px", threshold: 0.05 }).observe(section);
});
setGrowthStage(0);

const revealNodes = document.querySelectorAll("[data-reveal]");
revealNodes.forEach((node, index) => {
  node.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
});
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
);
revealNodes.forEach((node) => revealObserver.observe(node));

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".about-card, .skill-card, .program, .contact-card, .job, .project-card").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      card.style.setProperty("--tilt-x", `${y * -2.5}deg`);
      card.style.setProperty("--tilt-y", `${x * 2.5}deg`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });
}

const canvas = document.getElementById("hydro");
if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const ctx = canvas.getContext("2d");
  let frame = 0;
  let raf;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  resize();
  window.addEventListener("resize", resize);

  const draw = () => {
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);
    const cols = 7;
    const gap = w / (cols + 1);

    for (let i = 1; i <= cols; i += 1) {
      const x = gap * i;
      const sway = Math.sin(frame * 0.008 + i * 0.9) * 10;
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.quadraticCurveTo(x + sway, h * 0.55, x + sway * 0.4, 24);
      ctx.strokeStyle = `rgba(184, 245, 66, ${0.1 + (i % 3) * 0.04})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      for (let n = 0; n < 5; n += 1) {
        const t = (n + 1) / 6;
        const y = h - t * (h - 40);
        const leafX = x + sway * t;
        const pulse = 0.55 + Math.sin(frame * 0.02 + i + n) * 0.25;
        ctx.beginPath();
        ctx.ellipse(leafX + (n % 2 ? 8 : -8), y, 9, 4.5, n % 2 ? 0.6 : -0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(184, 245, 66, ${0.16 * pulse})`;
        ctx.fill();
      }
    }

    frame += 1;
    raf = requestAnimationFrame(draw);
  };

  raf = requestAnimationFrame(draw);
}
