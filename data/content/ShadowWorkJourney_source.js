// virtual:apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx
import React15, { useState as useState5 } from "react";
import { useParams as useParams3, Link as Link4 } from "react-router-dom";
import { useQuery as useQuery6 } from "@tanstack/react-query";
import {
  ChevronRight as ChevronRight2,
  ChevronLeft as ChevronLeft2,
  Zap as Zap5,
  BookOpen,
  Headphones
} from "lucide-react";
var REFLECTION_PROMPTS = [
  "What came up for me during this meditation?",
  "What emotion did I feel most strongly?",
  "Where do I feel this emotion in my body?",
  "When was the first time I remember feeling this way?",
  "What belief might be connected to this feeling?",
  "What part of me still feels unseen, unsafe, or unheard?",
  "What do I need right now to feel supported?"
];
function Bullet({ text }) {
  return /* @__PURE__ */ React15.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:28:5", className: "flex items-start gap-2 text-sm text-secondary" }, /* @__PURE__ */ React15.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:29:7", className: "text-accent mt-0.5 flex-shrink-0" }, "\u2022"), text);
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:43:5" }, /* @__PURE__ */ React15.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:44:7", className: "text-sm font-semibold text-primary mb-2" }, title), children);
}
function ExplanationScreen({ onNext }) {
  return /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:52:5", className: "space-y-6" }, /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:53:7", className: "flex items-center gap-3" }, /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:54:9", className: "inline-flex rounded-full bg-warning-weak p-3" }, /* @__PURE__ */ React15.createElement(Zap5, { className: "size-6 text-warning" })), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:57:9" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:58:11", className: "text-xs text-secondary uppercase tracking-wide font-medium" }, "Shadow Work"), /* @__PURE__ */ React15.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:61:11", className: "text-2xl font-semibold tracking-tight text-primary" }, "What Shadow Work Really Is"))), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:67:7", className: "space-y-6 rounded-lg border border-border bg-raised p-6" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:68:9", className: "text-sm text-secondary leading-relaxed" }, "Shadow work is the gentle practice of exploring the parts of yourself that you have hidden, ignored, judged, or learned to feel ashamed of. These hidden parts are not bad \u2014 they are simply unacknowledged. They often hold the very qualities you think you lack. If you feel unworthy, your worthiness sits in your shadow. If you feel unattractive, your beauty sits in your shadow. If you feel too much, the part of you that feels safe being fully seen sits in your shadow too."), /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:79:9", className: "text-sm text-secondary leading-relaxed" }, "Shadow work is not about blaming yourself or criticising who you are. It is about becoming aware of what you have been carrying, understanding where it came from, and slowly choosing something different for yourself."), /* @__PURE__ */ React15.createElement(Section, { title: "Why We React Without Knowing Why" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:87:11", className: "text-sm text-secondary leading-relaxed" }, "Many of us respond to situations automatically \u2014 getting defensive, anxious, upset, angry, or shutting down \u2014 without understanding the deeper reason. In the moment, it feels like the reaction is about what is happening right now. But often, it is connected to something much older. Shadow work helps you pause and explore the deeper layers beneath your reactions.")), /* @__PURE__ */ React15.createElement(Section, { title: "How Shadow Work Helps You Understand Yourself" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:98:11", className: "text-sm text-secondary leading-relaxed mb-2" }, "When something triggers you, you gently explore it by asking yourself:"), /* @__PURE__ */ React15.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:102:11", className: "space-y-1" }, /* @__PURE__ */ React15.createElement(Bullet, { text: "What exactly is triggering me?" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "Where does this feeling come from?" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "When was the first time I felt this?" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "What belief did I create from that moment?" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "What part of me still feels unsafe, unseen, or unheard?" })), /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:109:11", className: "text-sm text-secondary leading-relaxed mt-2" }, "Even asking these questions begins to shift your awareness. You stop reacting from old pain and start responding from clarity.")), /* @__PURE__ */ React15.createElement(Section, { title: "How Childhood Shapes Your Beliefs" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:116:11", className: "text-sm text-secondary leading-relaxed" }, "Most of our core beliefs were formed when we were children. As kids, we did not have the awareness to question things \u2014 we simply absorbed everything around us. If someone criticised us, ignored us, compared us, or made us feel like we had to earn love, we often created beliefs from those moments without realising it. These beliefs become part of our shadow and continue shaping our adult behaviour.")), /* @__PURE__ */ React15.createElement(Section, { title: "A Simple Example" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:128:11", className: "text-sm text-secondary leading-relaxed mb-2" }, "You might believe you are not smart because you got bad grades as a child. But bad grades do not mean you are not intelligent. They might mean:"), /* @__PURE__ */ React15.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:133:11", className: "space-y-1 mb-2" }, /* @__PURE__ */ React15.createElement(Bullet, { text: "the environment did not suit you" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "the topic was not for you" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "you were not interested" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "you needed things explained differently" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "you were dealing with something else at the time" })), /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:140:11", className: "text-sm text-secondary leading-relaxed" }, "Once you see the truth, you can replace the old belief with a new one: I am smart. This is shadow work \u2014 noticing old beliefs and choosing new ones.")), /* @__PURE__ */ React15.createElement(Section, { title: "How Childhood Experiences Create Adult Patterns" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:148:11", className: "text-sm text-secondary leading-relaxed mb-2" }, "Sometimes one comment from childhood becomes a belief you carry into adulthood. This can turn into:"), /* @__PURE__ */ React15.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:152:11", className: "space-y-1 mb-2" }, /* @__PURE__ */ React15.createElement(Bullet, { text: "over explaining" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "apologising when you did nothing wrong" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "people pleasing" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "feeling responsible for others emotions" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "trying to keep everyone happy" })), /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:159:11", className: "text-sm text-secondary leading-relaxed" }, "Shadow work helps you see where these patterns came from so you can separate what is yours from what is not yours.")), /* @__PURE__ */ React15.createElement(Section, { title: "What You Start to Notice" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:166:11", className: "text-sm text-secondary leading-relaxed mb-2" }, "As you continue shadow work, you may begin noticing:"), /* @__PURE__ */ React15.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:169:11", className: "space-y-1 mb-2" }, /* @__PURE__ */ React15.createElement(Bullet, { text: "how you speak to yourself" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "the people you attract" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "repeating situations" }), /* @__PURE__ */ React15.createElement(Bullet, { text: "recurring emotional patterns" })), /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:175:11", className: "text-sm text-secondary leading-relaxed" }, "The goal is not perfection. The goal is awareness \u2014 the ability to pause, understand yourself, and choose a different response. This is how you stop living from old wounds and start living from a place of clarity, compassion, and understanding."))), /* @__PURE__ */ React15.createElement(Button, { className: "w-full", onClick: onNext }, "Start Meditation ", /* @__PURE__ */ React15.createElement(ChevronRight2, { className: "size-4" })));
}
function MeditationScreen({
  contentId,
  onNext,
  onBack
}) {
  const { data: item } = useQuery6({
    queryKey: ["content-item", contentId],
    queryFn: () => fetch(`/app-api/content/${contentId}`).then((r) => r.json()),
    enabled: !!contentId
  });
  const hasAudio = item?.content_body?.startsWith("audio/");
  return /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:210:5", className: "space-y-6" }, /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:211:7", className: "flex items-center gap-3" }, /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:212:9", className: "inline-flex rounded-full bg-warning-weak p-3" }, /* @__PURE__ */ React15.createElement(Headphones, { className: "size-6 text-warning" })), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:215:9" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:216:11", className: "text-xs text-secondary uppercase tracking-wide font-medium" }, "Shadow Work"), /* @__PURE__ */ React15.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:219:11", className: "text-2xl font-semibold tracking-tight text-primary" }, item?.title ?? "Shadow Work Meditation"))), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:225:7", className: "rounded-lg border border-border bg-raised p-6" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:226:9", className: "text-base text-secondary leading-relaxed" }, "Take your time with this meditation. Let the guidance help you explore what is beneath the surface \u2014 gently and safely. When you are ready, tap ", /* @__PURE__ */ React15.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:229:15", className: "text-primary" }, "Continue to Reflection"), ".")), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:233:7", className: "rounded-lg border border-border bg-raised p-6" }, item?.content_body?.startsWith("audio/") ? /* @__PURE__ */ React15.createElement("audio", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:235:11", controls: true, className: "w-full" }, /* @__PURE__ */ React15.createElement("source", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:236:13", src: `/app-api/audio/${item.content_body}` }), "Your browser does not support the audio element.") : /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:240:11", className: "text-center py-6" }, /* @__PURE__ */ React15.createElement(Headphones, { className: "size-8 text-secondary mx-auto mb-2" }), /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:242:13", className: "text-sm text-secondary" }, "Audio not yet uploaded for this session."))), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:249:7", className: "flex gap-3" }, /* @__PURE__ */ React15.createElement(Button, { variant: "secondary", onClick: onBack, className: "flex-1" }, /* @__PURE__ */ React15.createElement(ChevronLeft2, { className: "size-4" }), " Back"), /* @__PURE__ */ React15.createElement(Button, { onClick: onNext, className: "flex-1" }, "Continue to Reflection ", /* @__PURE__ */ React15.createElement(ChevronRight2, { className: "size-4" }))));
}
function ReflectionScreen({
  onBack,
  contentId
}) {
  const [answers, setAnswers] = useState5({});
  const [saving, setSaving] = useState5(false);
  const [saved, setSaved] = useState5(false);
  function updateAnswer(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }
  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/app-api/shadow-work/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_id: contentId,
          answers: REFLECTION_PROMPTS.map((_, i) => answers[i] ?? null)
        })
      });
      setSaved(true);
      toast.success("Your reflection has been saved!");
    } catch {
      toast.error("Could not save \u2014 please try again.");
    } finally {
      setSaving(false);
    }
  }
  return /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:297:5", className: "space-y-6" }, /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:298:7", className: "flex items-center gap-3" }, /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:299:9", className: "inline-flex rounded-full bg-warning-weak p-3" }, /* @__PURE__ */ React15.createElement(BookOpen, { className: "size-6 text-warning" })), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:302:9" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:303:11", className: "text-xs text-secondary uppercase tracking-wide font-medium" }, "Shadow Work"), /* @__PURE__ */ React15.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:306:11", className: "text-2xl font-semibold tracking-tight text-primary" }, "Reflection Prompts"))), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:312:7", className: "rounded-lg border border-border bg-raised p-6" }, /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:313:9", className: "text-sm text-secondary leading-relaxed" }, "These questions help you understand what came up for you during the meditation. Take your time \u2014 there are no right or wrong answers. Write whatever feels true for you in this moment.")), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:320:7", className: "space-y-4" }, REFLECTION_PROMPTS.map((prompt, index) => /* @__PURE__ */ React15.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:322:11",
      key: index,
      className: "rounded-lg border border-border bg-raised p-4"
    },
    /* @__PURE__ */ React15.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:326:13", className: "text-sm font-medium text-primary mb-3" }, prompt),
    /* @__PURE__ */ React15.createElement(
      "textarea",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:327:13",
        value: answers[index] ?? "",
        onChange: (e) => updateAnswer(index, e.target.value),
        placeholder: "Journal your thoughts here...",
        rows: 3,
        className: "w-full rounded-md border border-border bg-inset px-3 py-2 text-sm text-primary placeholder:text-secondary resize-y focus:outline-none focus:ring-2 focus:ring-accent"
      }
    )
  ))), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:338:7", className: "flex gap-3" }, /* @__PURE__ */ React15.createElement(Button, { variant: "secondary", onClick: onBack, className: "flex-1" }, /* @__PURE__ */ React15.createElement(ChevronLeft2, { className: "size-4" }), " Back"), /* @__PURE__ */ React15.createElement(Button, { onClick: handleSave, isLoading: saving, className: "flex-1" }, saved ? "Saved \u2713" : "Save Reflection")), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:347:7", className: "text-center" }, /* @__PURE__ */ React15.createElement(
    Link4,
    {
      to: "/library",
      className: "text-sm text-accent underline underline-offset-4"
    },
    "Back to Library"
  )));
}
function ShadowWorkJourney() {
  const { id } = useParams3();
  const [step, setStep] = useState5("explanation");
  return /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:364:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:365:7", className: "w-full h-1 bg-inset" }, /* @__PURE__ */ React15.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:366:9",
      className: "h-1 bg-accent transition-all duration-500",
      style: {
        width: step === "explanation" ? "33%" : step === "meditation" ? "66%" : "100%"
      }
    }
  )), /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:379:7", className: "mx-auto max-w-[700px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React15.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:380:9", className: "flex items-center gap-2 mb-8" }, ["explanation", "meditation", "reflection"].map(
    (s, i) => /* @__PURE__ */ React15.createElement(React15.Fragment, { key: s }, /* @__PURE__ */ React15.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:384:17",
        className: `flex items-center justify-center size-7 rounded-full text-xs font-semibold transition-colors ${step === s ? "bg-accent text-accent-fg" : [
          "explanation",
          "meditation",
          "reflection"
        ].indexOf(step) > i ? "bg-success-weak text-success" : "bg-inset text-secondary"}`
      },
      i + 1
    ), i < 2 && /* @__PURE__ */ React15.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/ShadowWorkJourney.tsx:402:19",
        className: `flex-1 h-px ${["explanation", "meditation", "reflection"].indexOf(step) > i ? "bg-success" : "bg-border"}`
      }
    ))
  )), step === "explanation" && /* @__PURE__ */ React15.createElement(ExplanationScreen, { onNext: () => setStep("meditation") }), step === "meditation" && /* @__PURE__ */ React15.createElement(
    MeditationScreen,
    {
      contentId: id ?? "",
      onNext: () => setStep("reflection"),
      onBack: () => setStep("explanation")
    }
  ), step === "reflection" && /* @__PURE__ */ React15.createElement(
    ReflectionScreen,
    {
      onBack: () => setStep("meditation"),
      contentId: id ?? ""
    }
  )));
}

