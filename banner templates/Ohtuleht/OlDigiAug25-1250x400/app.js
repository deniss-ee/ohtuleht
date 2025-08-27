/**
 * Utility selector
 */
const $ = (sel, root = document) => root.querySelector(sel);

/** SlideManager: controls stacked slide show/hide via 'is-hidden' */
class SlideManager {
  constructor({ slides, activeIndex = 0, onChange = () => {} }) {
    this.slides = slides.map((s) => (typeof s === "string" ? $(s) : s)).filter(Boolean);
    this.activeIndex = activeIndex;
    this.onChange = onChange;
    this.slides.forEach((el, i) => {
      if (i !== this.activeIndex) el.classList.add("is-hidden");
    });
  }
  show(idx) {
    if (idx === this.activeIndex || idx < 0 || idx >= this.slides.length) return;
    const current = this.slides[this.activeIndex];
    const next = this.slides[idx];
    if (!current || !next) return;
    next.classList.remove("is-hidden");
    next.removeAttribute("aria-hidden");
    current.classList.add("is-hidden");
    current.setAttribute("aria-hidden", "true");
    this.activeIndex = idx;
    this.onChange(idx);
  }
  next() {
    this.show(this.activeIndex + 1);
  }
  restart() {
    this.show(0);
  }
}

/** Quiz: single-question multiple choice interaction */
class Quiz {
  constructor({ questionSelector, answersSelector, data, revealDelay = 1500, onAnswered = () => {} }) {
    this.qSel = questionSelector;
    this.aSel = answersSelector;
    this.data = data;
    this.revealDelay = revealDelay;
    this.onAnswered = onAnswered;
    this.locked = false;
  }
  render() {
    const qEl = $(this.qSel);
    const aWrap = $(this.aSel);
    if (!qEl || !aWrap) return;
    this.locked = false;
    qEl.textContent = this.data.template;
    aWrap.innerHTML = "";
    this.data.answers.forEach((ans) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "answer";
      btn.textContent = ans.text;
      btn.dataset.correct = ans.correct ? "1" : "0";
      btn.addEventListener("click", () => this.handle(btn));
      aWrap.appendChild(btn);
    });
  }
  handle(btn) {
    if (this.locked) return;
    this.locked = true;
    const buttons = document.querySelectorAll(".answer");
    buttons.forEach((b) => {
      const correct = b.dataset.correct === "1";
      if (b === btn) {
        b.classList.add(correct ? "correct" : "wrong");
      } else {
        if (correct) b.classList.add("correct");
        else b.classList.add("wrong");
      }
      b.disabled = true;
    });
    const wasCorrect = btn.dataset.correct === "1";
    setTimeout(() => this.onAnswered(wasCorrect), this.revealDelay);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const questionData = {
    template: "Lorem ipsum dolor sit amet, ____________ adipiscing elit. Ut et massa mi.",
    answers: [
      { text: "Donec rhoncus mollis viverra", correct: false },
      { text: "Cras lectus nisl, laoreet eu iaculis eget", correct: true },
      { text: "Morbi porta sed dolor non viverra", correct: false },
    ],
  };

  const slides = new SlideManager({ slides: ["#slide-question", "#slide-offer"] });
  const quiz = new Quiz({
    questionSelector: "#question-text",
    answersSelector: "#answers",
    data: questionData,
    revealDelay: 1500,
    onAnswered: () => slides.next(),
  });
  quiz.render();

  // Public API
  window.Banner = {
    slides,
    quiz,
    showOffer: () => slides.show(1),
    restart: () => {
      slides.restart();
      quiz.render();
    },
  };
});
