// virtual:apps/spiritual-healing/client/pages/ManifestationJourney.tsx
import React17, { useState as useState7 } from "react";
import { Link as Link6 } from "react-router-dom";
import { ChevronRight as ChevronRight4, ChevronLeft as ChevronLeft4, Sparkles as Sparkles6 } from "lucide-react";
var STEPS2 = ["understanding", "inner_work", "exercise"];
function ProgressBar2({ step }) {
  const pct = Math.round((STEPS2.indexOf(step) + 1) / STEPS2.length * 100);
  return /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:13:5", className: "w-full h-1 bg-inset" }, /* @__PURE__ */ React17.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:14:7",
      className: "h-1 bg-accent transition-all duration-500",
      style: { width: `${pct}%` }
    }
  ));
}
function StepIndicator2({ step }) {
  const current = STEPS2.indexOf(step);
  const labels = ["Understanding", "Inner Work", "Exercise"];
  return /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:26:5", className: "flex items-center gap-1 mb-8" }, STEPS2.map((s, i) => /* @__PURE__ */ React17.createElement(React17.Fragment, { key: s }, /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:29:11", className: "flex flex-col items-center gap-1" }, /* @__PURE__ */ React17.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:30:13",
      className: `flex items-center justify-center size-7 rounded-full text-xs font-semibold transition-colors ${step === s ? "bg-accent text-accent-fg" : current > i ? "bg-success-weak text-success" : "bg-inset text-secondary"}`
    },
    i + 1
  )), i < STEPS2.length - 1 && /* @__PURE__ */ React17.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:43:13",
      className: `flex-1 h-px ${current > i ? "bg-success" : "bg-border"}`
    }
  ))));
}
function Header2({
  title,
  description
}) {
  return /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:61:5", className: "mb-6" }, /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:62:7", className: "flex items-center gap-3 mb-3" }, /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:63:9", className: "inline-flex rounded-full bg-accent/10 p-3" }, /* @__PURE__ */ React17.createElement(Sparkles6, { className: "size-6 text-accent" })), /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:66:9" }, /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:67:11", className: "text-xs text-secondary uppercase tracking-wide font-medium" }, "Manifestation"), /* @__PURE__ */ React17.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:70:11", className: "text-2xl font-semibold tracking-tight text-primary" }, title))), /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:75:7", className: "text-sm text-secondary italic" }, description));
}
function UnderstandingScreen({ onNext }) {
  return /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:83:5" }, /* @__PURE__ */ React17.createElement(
    Header2,
    {
      title: "Understanding Manifestation",
      description: "Learn how your beliefs, focus, and perception shape the life you experience."
    }
  ), /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:88:7", className: "rounded-lg border border-border bg-raised p-6 space-y-4 mb-6" }, /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:89:9", className: "rounded-md bg-inset px-4 py-3" }, /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:90:11", className: "text-sm text-accent font-medium italic text-center" }, "Manifestation is the process of becoming aware of your beliefs, focusing on what you want, and aligning your inner world with the life you desire.")), /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:96:9", className: "text-sm text-secondary leading-relaxed" }, "You are manifesting 24/7. The life you are living is based on what you have created. You can learn to work with this and create a life you desire \u2014 one that fulfils you and makes you happy. The life you are living is shaped by your beliefs and where you place your attention. If you are living a life you don't enjoy, perhaps you spend your days complaining, wishing things were easier, and continuing the same routine. How can you expect anything to change?"), /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:105:9", className: "text-sm text-secondary leading-relaxed" }, "Life is a mirror of your inner being. If you focus on what you want in life, rather than what you dislike, you will attract more of it. People often sit in victimhood and think they can't achieve great things because those aren't the cards they were dealt. This mindset keeps you stuck. You can achieve anything, and it all starts with inner work."), /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:113:9", className: "text-sm text-secondary leading-relaxed" }, "Most people live based on the past. We cling to the past so much that it creates a false perception of reality. We see things in a limited way, even though life has so many possibilities. Instead, we narrow things down and assume the worst. The first step is to become aware. Once you realise that you are the only one holding yourself back, it becomes much easier to feel motivated to do the work and change. Because that is the truth: you are the only one holding yourself back. You need to take accountability and realise that you can have the life you want."), /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:124:9", className: "text-sm text-secondary leading-relaxed" }, "For example, people who grow up without much money may stay in the same town, living a life similar to everyone around them. They may believe they can't achieve great success and that they will struggle for the rest of their lives, barely getting by and not feeling fulfilled. This is often because it is all they know. On the other hand, if someone grows up around money and has a successful family, even if they do not receive direct help, they may see from their environment that success is possible and go on to achieve great success themselves. The cycle repeats unless you choose to expand your awareness. Anyone is capable of success.")), /* @__PURE__ */ React17.createElement(Button, { className: "w-full", onClick: onNext }, "Continue to Inner Work ", /* @__PURE__ */ React17.createElement(ChevronRight4, { className: "size-4" })));
}
function InnerWorkScreen({
  onBack,
  onNext
}) {
  return /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:153:5" }, /* @__PURE__ */ React17.createElement(
    Header2,
    {
      title: "The Inner Work",
      description: "Explore why self-worth, belief, and inner work are essential before manifestation can fully align."
    }
  ), /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:158:7", className: "rounded-lg border border-border bg-raised p-6 space-y-4 mb-6" }, /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:159:9", className: "text-sm text-secondary leading-relaxed" }, "The most important part of manifesting is believing in yourself and believing that you are worthy. That is why if you do not work on your inner being first, it will not work. Everything starts from within. Shadow work can tie in very well with this. It can help you get to the bottom of your beliefs so you are not stuck in the past, creating a wider range of possibilities for your future. You are not going to be able to achieve your manifestations if, deep down, you feel unworthy. You need to do the work so you know your own value and worth \u2014 then the rest comes much more easily."), /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:170:9", className: "text-sm text-secondary leading-relaxed" }, "Once you know your worth and live with confidence and love for yourself, you will attract great things in your life. You will now know that your dreams and goals are achievable because you deserve them. If you have the belief that everything is so hard for you, then that's the reality that you're going to keep perceiving. You will see life through that lens no matter what, as that's your belief, unless you decide to make a change. Then your perception widens and you realise that was never the truth all along. That goes for all beliefs.")), /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:181:7", className: "flex gap-3" }, /* @__PURE__ */ React17.createElement(Button, { variant: "secondary", onClick: onBack, className: "flex-1" }, /* @__PURE__ */ React17.createElement(ChevronLeft4, { className: "size-4" }), " Back"), /* @__PURE__ */ React17.createElement(Button, { onClick: onNext, className: "flex-1" }, "Start the Exercise ", /* @__PURE__ */ React17.createElement(ChevronRight4, { className: "size-4" }))));
}
var QUESTIONS = [
  { key: "what_to_manifest", label: "What do you want to manifest?" },
  { key: "why_you_want_it", label: "Why do you want this?" },
  {
    key: "version_achieved",
    label: "What version of you has already achieved this?"
  },
  {
    key: "does_differently",
    label: "What does this version of you do differently?"
  },
  {
    key: "one_action",
    label: "What is one action you can take today to become this version of yourself?"
  }
];
function ExerciseScreen({ onBack }) {
  const [answers, setAnswers] = useState7({});
  const [saving, setSaving] = useState7(false);
  const [saved, setSaved] = useState7(false);
  function update(key, value) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }
  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/app-api/manifestation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers)
      });
      setSaved(true);
      toast.success("Your exercise has been saved!");
    } catch {
      toast.error("Could not save \u2014 please try again.");
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:239:5" }, /* @__PURE__ */ React17.createElement(
    Header2,
    {
      title: "Manifestation Exercise",
      description: "Write down what you want, why you want it, and who you need to become to receive it."
    }
  ), /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:245:7", className: "rounded-lg border border-border bg-raised p-6 mb-6 space-y-3" }, /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:246:9", className: "text-sm text-secondary leading-relaxed" }, "The best approach to achieving your manifestation is first, write down a list of things you want and why. Then write down:", " ", /* @__PURE__ */ React17.createElement("em", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:249:11", className: "text-primary" }, '"What version of me has achieved these things?"')), /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:253:9", className: "text-sm text-secondary leading-relaxed" }, "For example, you might write:", " ", /* @__PURE__ */ React17.createElement("em", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:255:11", className: "text-primary" }, "This version of me prioritises themselves, they speak up for themselves, they take risks, they nourish their body, they aren't afraid to make mistakes.")), /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:261:9", className: "text-sm text-secondary leading-relaxed" }, "It all starts from within. Once you see that list, it makes it more comprehensible for your mind. All you have to do is look at that second list and say:", " ", /* @__PURE__ */ React17.createElement("em", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:265:11", className: "text-primary" }, '"I just have to become this person, and then my manifestations will naturally come with that."'))), /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:272:7", className: "space-y-4 mb-6" }, QUESTIONS.map((q) => /* @__PURE__ */ React17.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:274:11",
      key: q.key,
      className: "rounded-lg border border-border bg-raised p-4"
    },
    /* @__PURE__ */ React17.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:278:13", className: "text-sm font-medium text-primary mb-3" }, q.label),
    /* @__PURE__ */ React17.createElement(
      "textarea",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:279:13",
        value: answers[q.key] ?? "",
        onChange: (e) => update(q.key, e.target.value),
        placeholder: "Write your answer here...",
        rows: 3,
        className: "w-full rounded-md border border-border bg-inset px-3 py-2 text-sm text-primary placeholder:text-secondary resize-y focus:outline-none focus:ring-2 focus:ring-accent"
      }
    )
  ))), saved && /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:291:9", className: "rounded-md bg-success-weak border border-success p-3 text-sm text-success text-center mb-4" }, "Your exercise has been saved successfully!"), /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:296:7", className: "flex gap-3" }, /* @__PURE__ */ React17.createElement(Button, { variant: "secondary", onClick: onBack, className: "flex-1" }, /* @__PURE__ */ React17.createElement(ChevronLeft4, { className: "size-4" }), " Back"), /* @__PURE__ */ React17.createElement(Button, { onClick: handleSave, isLoading: saving, className: "flex-1" }, "Save My Exercise")), /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:305:7", className: "text-center mt-4" }, /* @__PURE__ */ React17.createElement(
    Link6,
    {
      to: "/library",
      className: "text-sm text-accent underline underline-offset-4"
    },
    "Back to Library"
  )));
}
function ManifestationJourney() {
  const [step, setStep] = useState7("understanding");
  function next() {
    const i = STEPS2.indexOf(step);
    if (i < STEPS2.length - 1) setStep(STEPS2[i + 1]);
  }
  function back() {
    const i = STEPS2.indexOf(step);
    if (i > 0) setStep(STEPS2[i - 1]);
  }
  return /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:332:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React17.createElement(ProgressBar2, { step }), /* @__PURE__ */ React17.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ManifestationJourney.tsx:334:7", className: "mx-auto max-w-[700px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React17.createElement(StepIndicator2, { step }), step === "understanding" && /* @__PURE__ */ React17.createElement(UnderstandingScreen, { onNext: next }), step === "inner_work" && /* @__PURE__ */ React17.createElement(InnerWorkScreen, { onBack: back, onNext: next }), step === "exercise" && /* @__PURE__ */ React17.createElement(ExerciseScreen, { onBack: back })));
}

