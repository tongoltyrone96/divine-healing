// virtual:apps/spiritual-healing/client/pages/ReikiJourney.tsx
import React16, { useState as useState6 } from "react";
import { Link as Link5 } from "react-router-dom";
import { ChevronRight as ChevronRight3, ChevronLeft as ChevronLeft3, Sparkles as Sparkles5 } from "lucide-react";
var STEPS = ["description", "expect", "benefits", "faq"];
function ProgressBar({ step }) {
  const pct = Math.round((STEPS.indexOf(step) + 1) / STEPS.length * 100);
  return /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:12:5", className: "w-full h-1 bg-inset" }, /* @__PURE__ */ React16.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:13:7",
      className: "h-1 bg-accent transition-all duration-500",
      style: { width: `${pct}%` }
    }
  ));
}
function StepIndicator({ step }) {
  const current = STEPS.indexOf(step);
  return /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:24:5", className: "flex items-center gap-1 mb-8" }, STEPS.map((s, i) => /* @__PURE__ */ React16.createElement(React16.Fragment, { key: s }, /* @__PURE__ */ React16.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:27:11",
      className: `flex items-center justify-center size-7 rounded-full text-xs font-semibold flex-shrink-0 transition-colors ${step === s ? "bg-accent text-accent-fg" : current > i ? "bg-success-weak text-success" : "bg-inset text-secondary"}`
    },
    i + 1
  ), i < STEPS.length - 1 && /* @__PURE__ */ React16.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:39:13",
      className: `flex-1 h-px ${current > i ? "bg-success" : "bg-border"}`
    }
  ))));
}
function Header({ title }) {
  return /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:51:5", className: "flex items-center gap-3 mb-6" }, /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:52:7", className: "inline-flex rounded-full bg-warning-weak p-3" }, /* @__PURE__ */ React16.createElement(Sparkles5, { className: "size-6 text-warning" })), /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:55:7" }, /* @__PURE__ */ React16.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:56:9", className: "text-xs text-secondary uppercase tracking-wide font-medium" }, "Reiki"), /* @__PURE__ */ React16.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:59:9", className: "text-2xl font-semibold tracking-tight text-primary" }, title)));
}
function NavButtons({
  onBack,
  onNext,
  nextLabel = "Continue",
  isLast = false
}) {
  return /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:79:5", className: "flex gap-3 mt-6" }, onBack && /* @__PURE__ */ React16.createElement(Button, { variant: "secondary", onClick: onBack, className: "flex-1" }, /* @__PURE__ */ React16.createElement(ChevronLeft3, { className: "size-4" }), " Back"), isLast ? /* @__PURE__ */ React16.createElement(Button, { asChild: true, className: "flex-1" }, /* @__PURE__ */ React16.createElement(Link5, { to: "/library" }, "Back to Library")) : /* @__PURE__ */ React16.createElement(Button, { onClick: onNext, className: onBack ? "flex-1" : "w-full" }, nextLabel, " ", /* @__PURE__ */ React16.createElement(ChevronRight3, { className: "size-4" })));
}
function Bullet2({ text }) {
  return /* @__PURE__ */ React16.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:100:5", className: "flex items-start gap-2 text-sm text-secondary" }, /* @__PURE__ */ React16.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:101:7", className: "text-accent mt-0.5 flex-shrink-0" }, "\u2022"), text);
}
function DescriptionScreen({ onNext }) {
  return /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:109:5" }, /* @__PURE__ */ React16.createElement(Header, { title: "What is Reiki?" }), /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:111:7", className: "rounded-lg border border-border bg-raised p-6 space-y-3" }, /* @__PURE__ */ React16.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:112:9", className: "text-sm text-secondary leading-relaxed" }, "The word Rei means universal, and the word Ki means life force energy. If your energy is low or there are restrictions in its flow, you are more vulnerable to illness and disease. When it is balanced, your energy is free-flowing, and you are less likely to get sick."), /* @__PURE__ */ React16.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:118:9", className: "text-sm text-secondary leading-relaxed" }, "Reiki is defined as spiritually guided life energy. It is an extremely powerful healing energy and a form of healing that can be used to heal oneself. Once a person is attuned to Reiki, they are permanently linked to the Reiki source."), /* @__PURE__ */ React16.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:124:9", className: "text-sm text-secondary leading-relaxed" }, "Reiki is done by either placing hands on another person or oneself, or by hovering the hands over the body. This can also be done remotely or at a distance \u2014 it works in the same way, but the practitioner imagines the person being there and follows the same procedure."), /* @__PURE__ */ React16.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:130:9", className: "text-sm text-secondary leading-relaxed" }, "The Reiki energy flows through the hands, allowing healing to occur. The individual receiving the Reiki must allow and receive it with the intention of being cleansed.")), /* @__PURE__ */ React16.createElement(NavButtons, { onNext, nextLabel: "What to Expect" }));
}
function ExpectScreen({
  onBack,
  onNext
}) {
  return /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:149:5" }, /* @__PURE__ */ React16.createElement(Header, { title: "What to Expect in a Reiki Session" }), /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:151:7", className: "rounded-lg border border-border bg-raised p-6 space-y-4" }, /* @__PURE__ */ React16.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:152:9", className: "text-sm text-secondary leading-relaxed" }, "A Reiki session is calm, peaceful, and deeply relaxing. You remain fully clothed while lying comfortably on a massage table or sitting in a chair. The practitioner places their hands lightly on or just above your body in a series of positions, allowing healing energy to flow where it is needed."), /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:159:9" }, /* @__PURE__ */ React16.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:160:11", className: "text-sm font-semibold text-primary mb-2" }, "Most people experience:"), /* @__PURE__ */ React16.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:163:11", className: "space-y-1" }, /* @__PURE__ */ React16.createElement(Bullet2, { text: "warmth or tingling" }), /* @__PURE__ */ React16.createElement(Bullet2, { text: "deep relaxation" }), /* @__PURE__ */ React16.createElement(Bullet2, { text: "emotional release" }), /* @__PURE__ */ React16.createElement(Bullet2, { text: "a sense of peace or clarity" }), /* @__PURE__ */ React16.createElement(Bullet2, { text: "gentle shifts in energy" }))), /* @__PURE__ */ React16.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:171:9", className: "text-sm text-secondary leading-relaxed" }, "Some people feel very calm, others feel energised \u2014 every session is unique. Reiki continues working even after the session ends, supporting your body and emotions in the hours and days that follow.")), /* @__PURE__ */ React16.createElement(NavButtons, { onBack, onNext, nextLabel: "Benefits" }));
}
function BenefitsScreen({
  onBack,
  onNext
}) {
  return /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:190:5" }, /* @__PURE__ */ React16.createElement(Header, { title: "Benefits of Reiki" }), /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:192:7", className: "rounded-lg border border-border bg-raised p-6" }, /* @__PURE__ */ React16.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:193:9", className: "space-y-2" }, [
    "Reduces stress and anxiety",
    "Supports emotional healing",
    "Promotes deep relaxation",
    "Helps release energetic blockages",
    "Encourages mental clarity",
    "Balances the nervous system",
    "Enhances sleep quality",
    "Supports the body's natural healing processes",
    "Helps with grounding and inner peace",
    "Complements other healing or therapeutic practices"
  ].map((b) => /* @__PURE__ */ React16.createElement(Bullet2, { key: b, text: b })))), /* @__PURE__ */ React16.createElement(
    NavButtons,
    {
      onBack,
      onNext,
      nextLabel: "Common Questions"
    }
  ));
}
var FAQS = [
  {
    q: "Can Reiki be done remotely (phone or video session)?",
    a: "Yes. Reiki can be sent and received across any distance. The practitioner connects energetically to the recipient, imagines them present, and follows the same process as an in-person session. The Reiki energy flows just as effectively \u2014 distance does not reduce its power or impact."
  },
  {
    q: "Is Reiki safe?",
    a: "Yes. Reiki is gentle, non-invasive, and safe for all ages."
  },
  {
    q: "Do I need to believe in Reiki for it to work?",
    a: "No. Reiki works regardless of belief \u2014 simply being open to relaxation is enough."
  },
  {
    q: "What does Reiki feel like?",
    a: "Warmth, tingling, calmness, emotional release, or deep relaxation. Some people feel subtle sensations, others feel strong shifts."
  },
  {
    q: "Can Reiki help with stress or anxiety?",
    a: "Yes. Reiki is widely used to calm the nervous system and reduce emotional tension."
  },
  {
    q: "How long is a session?",
    a: "Typically 20-60 minutes, depending on the practitioner."
  },
  {
    q: "Can Reiki be combined with other healing practices?",
    a: "Absolutely. Reiki works beautifully alongside meditation, breathwork, counselling, and shadow work."
  }
];
function FAQScreen({ onBack }) {
  const [open, setOpen] = useState6(null);
  return /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:253:5" }, /* @__PURE__ */ React16.createElement(Header, { title: "Common Questions" }), /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:255:7", className: "space-y-2" }, FAQS.map((faq, i) => /* @__PURE__ */ React16.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:257:11",
      key: i,
      className: "rounded-lg border border-border bg-raised overflow-hidden"
    },
    /* @__PURE__ */ React16.createElement(
      "button",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:261:13",
        className: "w-full flex items-center justify-between p-4 text-left",
        onClick: () => setOpen(open === i ? null : i)
      },
      /* @__PURE__ */ React16.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:265:15", className: "text-sm font-medium text-primary" }, faq.q),
      /* @__PURE__ */ React16.createElement(
        ChevronRight3,
        {
          className: `size-4 text-secondary flex-shrink-0 transition-transform ${open === i ? "rotate-90" : ""}`
        }
      )
    ),
    open === i && /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:271:15", className: "px-4 pb-4" }, /* @__PURE__ */ React16.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:272:17", className: "text-sm text-secondary leading-relaxed" }, faq.a))
  ))), /* @__PURE__ */ React16.createElement(NavButtons, { onBack, isLast: true }));
}
function ReikiJourney() {
  const [step, setStep] = useState6("description");
  function next() {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }
  function back() {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }
  return /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:299:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React16.createElement(ProgressBar, { step }), /* @__PURE__ */ React16.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ReikiJourney.tsx:301:7", className: "mx-auto max-w-[700px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React16.createElement(StepIndicator, { step }), step === "description" && /* @__PURE__ */ React16.createElement(DescriptionScreen, { onNext: next }), step === "expect" && /* @__PURE__ */ React16.createElement(ExpectScreen, { onBack: back, onNext: next }), step === "benefits" && /* @__PURE__ */ React16.createElement(BenefitsScreen, { onBack: back, onNext: next }), step === "faq" && /* @__PURE__ */ React16.createElement(FAQScreen, { onBack: back })));
}

