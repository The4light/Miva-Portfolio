"use strict";

const menu = document.querySelector(".menu-button");
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  document.querySelector("#navigation").classList.toggle("open", open);
});

// Tasks are user data: insert their text with textContent, never innerHTML.
const taskForm = document.querySelector("#task-form");
if (taskForm) {
  const key = "desire-cos106-tasks-v1";
  let tasks = [];
  let filter = "all";
  const storageStatus = document.querySelector("#storage-status");
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(saved)) throw new Error("Invalid saved tasks");
    tasks = saved.filter(
      (task) =>
        task &&
        typeof task.id === "string" &&
        typeof task.title === "string" &&
        typeof task.done === "boolean",
    );
  } catch {
    storageStatus.textContent =
      "Saved tasks could not be loaded. You can still use the planner during this visit.";
  }
  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(tasks));
    } catch {
      storageStatus.textContent =
        "Browser storage is unavailable. Tasks will last only for this visit.";
    }
  }
  function renderTasks() {
    const list = document.querySelector("#task-list");
    list.replaceChildren();
    const visible = tasks.filter(
      (task) => filter === "all" || (filter === "completed" ? task.done : !task.done),
    );
    visible.forEach((task) => {
      const row = document.createElement("li");
      row.className = "task-row";
      const label = document.createElement("label");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.done;
      checkbox.addEventListener("change", () => {
        task.done = checkbox.checked;
        save();
        renderTasks();
      });
      const title = document.createElement("span");
      title.textContent = task.title;
      label.append(checkbox, title);
      const remove = document.createElement("button");
      remove.className = "delete-task";
      remove.type = "button";
      remove.textContent = "Delete";
      remove.setAttribute("aria-label", `Delete task: ${task.title}`);
      remove.addEventListener("click", () => {
        tasks = tasks.filter((item) => item.id !== task.id);
        save();
        renderTasks();
        document.querySelector("#task-title").focus();
      });
      row.append(label, remove);
      list.append(row);
    });
    const completed = tasks.filter((task) => task.done).length;
    document.querySelector("#task-status").textContent =
      `${tasks.length} task${tasks.length === 1 ? "" : "s"} · ${completed} completed · ${tasks.length - completed} remaining`;
    const empty = document.querySelector("#task-empty");
    empty.hidden = visible.length > 0;
    empty.textContent = tasks.length
      ? "No tasks in this view."
      : "A fresh page. Add your first academic task above.";
  }
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#task-title");
    const title = input.value.trim();
    input.setCustomValidity(title ? "" : "Enter a task before adding it.");
    if (!input.reportValidity()) return;
    tasks.push({ id: crypto.randomUUID(), title, done: false });
    save();
    renderTasks();
    taskForm.reset();
    input.focus();
  });
  document
    .querySelector("#task-title")
    .addEventListener("input", (event) => event.target.setCustomValidity(""));
  document.querySelectorAll("[data-filter]").forEach((button) =>
    button.addEventListener("click", () => {
      filter = button.dataset.filter;
      document
        .querySelectorAll("[data-filter]")
        .forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      renderTasks();
    }),
  );
  renderTasks();
}

const contact = document.querySelector("#contact-form");
if (contact) {
  const fields = ["name", "email", "phone", "message"];
  const draft = document.querySelector("#email-draft");
  const status = document.querySelector("#contact-status");
  contact.addEventListener("input", () => {
    draft.hidden = true;
    draft.removeAttribute("href");
    status.textContent = "";
  });
  contact.addEventListener("submit", (event) => {
    event.preventDefault();
    let firstInvalid;
    const values = {};
    fields.forEach((name) => {
      const input = contact.elements.namedItem(name);
      const value = input.value.trim();
      values[name] = value;
      let error = value ? "" : "Please complete this field.";
      if (value && name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        error = "Enter a valid email address.";
      if (value && name === "phone" && !/^\d+$/.test(value)) error = "Use digits only (0–9).";
      document.querySelector(`#${name}-error`).textContent = error;
      input.setAttribute("aria-invalid", String(Boolean(error)));
      if (error && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      status.textContent = "Please correct the highlighted fields.";
      draft.hidden = true;
      firstInvalid.focus();
      return;
    }
    const body = `Name: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone}\n\n${values.message}`;
    draft.href = `mailto:d.ogbonna0705@miva.edu.ng?subject=${encodeURIComponent("Portfolio enquiry from " + values.name)}&body=${encodeURIComponent(body)}`;
    draft.hidden = false;
    status.textContent =
      "Your message is valid and ready. Open the email draft below to send it from your email app.";
  });
}

const gradeForm = document.querySelector("#grade-form");
if (gradeForm)
  gradeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const scores = [1, 2, 3].map((index) =>
      Number(document.querySelector(`#score-${index}`).value),
    );
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    document.querySelector("#grade-result").textContent =
      `Average: ${average.toFixed(1)}%. ${average >= 50 ? "You reached the illustrative 50% target." : "Below the illustrative 50% target — keep practising."}`;
  });
if (document.querySelector("#card-question")) {
  const cards = [
    {
      question: "What does HTML describe?",
      answer: "HTML describes the structure and meaning of content on a web page.",
    },
    {
      question: "What is CSS used for?",
      answer:
        "CSS controls presentation, including colour, typography, layout, and responsive behaviour.",
    },
    {
      question: "What does JavaScript add to a page?",
      answer:
        "JavaScript adds behaviour, such as responding to clicks, validating forms, and updating content.",
    },
  ];
  let index = 0;
  const answer = document.querySelector("#card-answer");
  const reveal = document.querySelector("#reveal");
  function renderCard() {
    document.querySelector("#card-count").textContent = `Card ${index + 1} of ${cards.length}`;
    document.querySelector("#card-question").textContent = cards[index].question;
    answer.textContent = cards[index].answer;
    answer.hidden = true;
    reveal.textContent = "Reveal answer";
    reveal.setAttribute("aria-expanded", "false");
    reveal.setAttribute("aria-controls", "card-answer");
  }
  reveal.addEventListener("click", () => {
    answer.hidden = !answer.hidden;
    reveal.textContent = answer.hidden ? "Reveal answer" : "Hide answer";
    reveal.setAttribute("aria-expanded", String(!answer.hidden));
  });
  document.querySelector("#next-card").addEventListener("click", () => {
    index = (index + 1) % cards.length;
    renderCard();
  });
  renderCard();
}

// Large, one-time scroll entrances; content remains visible without JS or reduced motion.
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
if (!motionPreference.matches && "IntersectionObserver" in window) {
  document.body.classList.add("motion-ready");
  const reveals = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          reveals.unobserve(entry.target);
        }
      }),
    { threshold: 0.08 },
  );
  document.querySelectorAll(".reveal").forEach((element) => reveals.observe(element));
  motionPreference.addEventListener("change", (event) => {
    if (event.matches) document.body.classList.remove("motion-ready");
  });
}
const waypointScreen = document.querySelector("#waypoint-screen");
if (waypointScreen) {
  const gallery = [
    {
      file: "tasks-after-desktop.jpg",
      label: "Task workspace",
      alt: "Waypoint task workspace with task organization and progress controls",
    },
    {
      file: "trips-after-desktop.jpg",
      label: "Travel budget",
      alt: "Waypoint Lagos trip budget with category breakdown and accommodation details",
    },
    {
      file: "habits-after-desktop.jpg",
      label: "Habit tracking",
      alt: "Waypoint habit tracking interface",
    },
    {
      file: "analysis-after-desktop.jpg",
      label: "Progress insights",
      alt: "Waypoint progress analysis interface",
    },
  ];
  let current = 0;
  let galleryRequest = 0;
  function changeImage(direction) {
    current = (current + direction + gallery.length) % gallery.length;
    const item = gallery[current];
    const selected = current;
    const request = ++galleryRequest;
    const image = new Image();
    image.onload = () => {
      if (request !== galleryRequest) return;
      waypointScreen.src = image.src;
      waypointScreen.alt = item.alt;
      waypointScreen.classList.remove("gallery-changing");
      void waypointScreen.offsetWidth;
      waypointScreen.classList.add("gallery-changing");
      document.querySelector("#gallery-caption").textContent = `0${selected + 1} / ${item.label}`;
    };
    image.onerror = () => {
      if (request === galleryRequest)
        document.querySelector("#gallery-caption").textContent =
          "This image could not load. Try another screenshot.";
    };
    image.src = `assets/${item.file}`;
  }
  document.querySelector("#gallery-prev").addEventListener("click", () => changeImage(-1));
  document.querySelector("#gallery-next").addEventListener("click", () => changeImage(1));
}
