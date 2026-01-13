document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".dropdown-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("active");
    });
    document.addEventListener("click", () => menu.classList.remove("active"));
  }

  const fadeElements = document.querySelectorAll(".fade-in");
  const handleScroll = () => {
    fadeElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();
});

function playPodium(file) {
  const audio = new Audio(file);
  audio.play().catch((e) => console.error("Audio playback error:", e));
}
