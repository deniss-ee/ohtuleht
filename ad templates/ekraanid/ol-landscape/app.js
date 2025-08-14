const slides = document.querySelectorAll(".slide");
const durations = [1000, 1000, 1000, 1000, 1000, 1000, 1000];

// Debug flags via URL
const params = new URLSearchParams(window.location.search);
const lockedSlideIndex = parseInt(params.get("slide")) || null;
const isPaused = params.get("pause") === "true";

let current = 0;

window.addEventListener("DOMContentLoaded", () => {
  if (lockedSlideIndex && lockedSlideIndex >= 1 && lockedSlideIndex <= slides.length) {
    current = lockedSlideIndex - 1;
  }

  slides[current].classList.add("active");
  slides[current].style.zIndex = 1;

  if (!isPaused) {
    setTimeout(showNextSlide, durations[current]);
  }
});

function showNextSlide() {
  const prev = current;
  current = (current + 1) % slides.length;

  slides[current].style.zIndex = 2;
  slides[current].classList.add("active");

  setTimeout(() => {
    slides[prev].classList.remove("active");
    slides[prev].style.zIndex = 0;
    slides[current].style.zIndex = 1;
  }, 1000);

  setTimeout(showNextSlide, durations[current]);
}
