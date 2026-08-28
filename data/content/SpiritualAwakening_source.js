// virtual:apps/spiritual-healing/client/pages/SpiritualAwakening.tsx
import React22, { useState as useState11 } from "react";
import {
  Sunrise as Sunrise2,
  ChevronRight as ChevronRight7,
  ChevronDown as ChevronDown2,
  BookOpen as BookOpen2,
  Feather,
  Star as Star2
} from "lucide-react";
var BENEFITS = [
  "Deep inner peace",
  "Emotional clarity",
  "Stronger intuition",
  "Detachment from fear",
  "Greater presence and awareness",
  "Feeling connected to life and nature",
  "Understanding your purpose",
  "Freedom from old conditioning",
  "More compassion for yourself and others",
  "A sense of unity and oneness"
];
var WHAT_TO_EXPECT = [
  "Heightened emotions",
  "Increased sensitivity",
  "Feeling disconnected from old habits",
  "Questioning beliefs and systems",
  "Strong desire for truth",
  "Moments of deep clarity",
  "Periods of confusion or intensity",
  "A growing sense of inner strength",
  "Feeling different from others",
  "A return to joy, wonder, and presence"
];
var FAQS2 = [
  {
    q: "Is awakening scary?",
    a: "It can feel intense at times, but it ultimately brings clarity, peace, and freedom."
  },
  {
    q: "Why do I feel disconnected from people?",
    a: "Awakening shifts your perspective. You may outgrow old patterns or relationships."
  },
  {
    q: "Is awakening the same as religion?",
    a: "No. Awakening is a personal experience of inner truth, not a belief system."
  },
  {
    q: "Why do emotions feel stronger?",
    a: "You're becoming more aware and present. Emotions surface so they can be healed."
  },
  {
    q: "Does awakening ever end?",
    a: "It's a lifelong unfolding. You continue expanding, learning, and remembering who you are."
  }
];
var PROMPTS = [
  "What beliefs am I beginning to question?",
  "What parts of myself am I rediscovering?",
  "Where do I feel fear, and what is beneath it?",
  "What emotions have been asking for my attention?",
  "What feels more true to me now than before?",
  "What am I ready to release?",
  "What does my soul want me to know today?"
];
function FAQItem({ q, a }) {
  const [open, setOpen] = useState11(false);
  return /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:79:5", className: "border-b border-border-weak last:border-0" }, /* @__PURE__ */ React22.createElement(
    "button",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:80:7",
      className: "flex w-full items-center justify-between py-4 text-left text-sm font-medium text-primary cursor-pointer",
      onClick: () => setOpen((o) => !o),
      "aria-expanded": open
    },
    /* @__PURE__ */ React22.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:85:9" }, q),
    /* @__PURE__ */ React22.createElement(
      ChevronDown2,
      {
        className: `size-4 text-secondary shrink-0 ml-2 transition-transform duration-150 ${open ? "rotate-180" : ""}`
      }
    )
  ), open && /* @__PURE__ */ React22.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:91:9", className: "pb-4 text-sm text-secondary leading-relaxed" }, a));
}
function SpiritualAwakening() {
  const [screen, setScreen] = useState11("overview");
  const [activePrompt, setActivePrompt] = useState11(null);
  const [journals, setJournals] = useState11({});
  function handleSaveJournal(idx) {
    if (!journals[idx]?.trim()) return;
    toast({ title: "Saved", description: "Your reflection has been saved." });
  }
  if (screen === "overview") {
    return /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:110:7", className: "min-h-dvh bg-background pb-24" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:112:9", className: "relative overflow-hidden bg-surface border-b border-border-weak" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:113:11", className: "mx-auto max-w-[1200px] px-4 py-12 md:py-16 flex flex-col items-center text-center" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:114:13", className: "inline-flex rounded-full bg-warning-weak p-4 mb-5" }, /* @__PURE__ */ React22.createElement(Sunrise2, { className: "size-8 text-warning" })), /* @__PURE__ */ React22.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:117:13", className: "text-2xl font-semibold tracking-tight text-primary mb-3" }, "Spiritual Awakening"), /* @__PURE__ */ React22.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:120:13", className: "text-sm text-secondary max-w-md leading-relaxed mb-6" }, "We are powerful beings, and this human life is just an illusion designed to help us learn lessons. Becoming aware is already a huge step forward. The journey may be tough, but it is also the most fulfilling experience you can ever have."), /* @__PURE__ */ React22.createElement(
      Button,
      {
        variant: "primary",
        onClick: () => setScreen("learn-more"),
        className: "gap-2"
      },
      "Learn More ",
      /* @__PURE__ */ React22.createElement(ChevronRight7, { className: "size-4" })
    ))), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:133:9", className: "mx-auto max-w-[1200px] px-4 py-8 space-y-8" }, /* @__PURE__ */ React22.createElement("section", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:135:11" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:136:13", className: "flex items-center gap-2 mb-4" }, /* @__PURE__ */ React22.createElement(Star2, { className: "size-4 text-accent" }), /* @__PURE__ */ React22.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:138:15", className: "text-base font-semibold text-primary" }, "Benefits of Awakening")), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:142:13", className: "grid grid-cols-1 md:grid-cols-2 gap-2" }, BENEFITS.map((b) => /* @__PURE__ */ React22.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:144:17",
        key: b,
        className: "flex items-start gap-2 bg-raised border border-border rounded-lg px-4 py-3"
      },
      /* @__PURE__ */ React22.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:148:19", className: "mt-0.5 size-1.5 rounded-full bg-accent shrink-0" }),
      /* @__PURE__ */ React22.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:149:19", className: "text-sm text-primary" }, b)
    )))), /* @__PURE__ */ React22.createElement("section", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:156:11" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:157:13", className: "flex items-center gap-2 mb-4" }, /* @__PURE__ */ React22.createElement(BookOpen2, { className: "size-4 text-accent" }), /* @__PURE__ */ React22.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:159:15", className: "text-base font-semibold text-primary" }, "What to Expect")), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:163:13", className: "grid grid-cols-1 md:grid-cols-2 gap-2" }, WHAT_TO_EXPECT.map((item) => /* @__PURE__ */ React22.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:165:17",
        key: item,
        className: "flex items-start gap-2 bg-raised border border-border rounded-lg px-4 py-3"
      },
      /* @__PURE__ */ React22.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:169:19", className: "mt-0.5 size-1.5 rounded-full bg-warning shrink-0" }),
      /* @__PURE__ */ React22.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:170:19", className: "text-sm text-primary" }, item)
    )))), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:177:11", className: "bg-raised border border-border rounded-lg p-6 flex flex-col items-center text-center gap-4" }, /* @__PURE__ */ React22.createElement(Feather, { className: "size-6 text-accent" }), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:179:13" }, /* @__PURE__ */ React22.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:180:15", className: "text-sm font-medium text-primary mb-1" }, "Ready to explore your journey?"), /* @__PURE__ */ React22.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:183:15", className: "text-sm text-secondary" }, "Use the reflection prompts to deepen your awareness and journal your experience.")), /* @__PURE__ */ React22.createElement(
      Button,
      {
        variant: "secondary",
        onClick: () => setScreen("reflections")
      },
      "Open Reflection Prompts"
    ))));
  }
  if (screen === "learn-more") {
    return /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:203:7", className: "min-h-dvh bg-background pb-24" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:204:9", className: "mx-auto max-w-[1200px] px-4 py-8 space-y-8" }, /* @__PURE__ */ React22.createElement("nav", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:206:11", className: "flex items-center gap-1 text-sm text-secondary" }, /* @__PURE__ */ React22.createElement(
      "button",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:207:13",
        className: "hover:text-primary cursor-pointer transition-colors duration-150",
        onClick: () => setScreen("overview")
      },
      "Spiritual Awakening"
    ), /* @__PURE__ */ React22.createElement(ChevronRight7, { className: "size-3.5" }), /* @__PURE__ */ React22.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:214:13", className: "text-primary" }, "Learn More")), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:217:11", className: "flex items-center gap-3" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:218:13", className: "inline-flex rounded-full bg-warning-weak p-3" }, /* @__PURE__ */ React22.createElement(Sunrise2, { className: "size-6 text-warning" })), /* @__PURE__ */ React22.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:221:13", className: "text-2xl font-semibold tracking-tight text-primary" }, "Spiritual Awakening")), /* @__PURE__ */ React22.createElement(Tabs, { defaultValue: "awakening" }, /* @__PURE__ */ React22.createElement(TabsList, { className: "w-full md:w-auto" }, /* @__PURE__ */ React22.createElement(TabsTrigger, { value: "awakening" }, "The Journey"), /* @__PURE__ */ React22.createElement(TabsTrigger, { value: "medium" }, "Overview"), /* @__PURE__ */ React22.createElement(TabsTrigger, { value: "faq" }, "FAQ")), /* @__PURE__ */ React22.createElement(TabsContent, { value: "awakening", className: "space-y-6 mt-6" }, [
      {
        heading: null,
        body: `We are powerful beings, and this human life is just an illusion designed to help us learn lessons. The hardships you've gone through happened so your soul could evolve. As humans, we get attached to our physical lives and forget the bigger picture. Things were meant to be much simpler, but we complicated them.

The truth is, all the answers are within us. Yet the world teaches us to search outside of ourselves, to rely on others to "save" us. In reality, we already hold all the power within. You only need to connect with your soul. Listen to the silence\u2014that's where the answers lie.

But society teaches us to run from silence and to fear boredom. Why? To stop us from discovering our true power.

Becoming aware is already a huge step forward. Awakening helps you realize how special you truly are. But the journey isn't always smooth\u2014it will challenge you to face the deepest parts of yourself. The journey may be tough, but it is also the most fulfilling experience you can ever have.

Waking up is like stepping out of the dream we call life. You are always in the spirit world; you never truly left. Crazy how real it all feels? That's the whole point.

Life is like a movie, and you are the actor. Of course, we are going to feel the emotions of what is happening, but at the end of the day, we are just playing the role of this character. Who you really are is the "I am." You are the awareness. You are the one observing your thoughts, your life. Your thoughts are there to distract you, to stop you from living in the present moment.

Your soul chose to incarnate as a human, knowing you would forget your true essence. The purpose of life is to find your way back to yourself. It's like a game\u2014with ups, downs, and everything in between.

When awakened, life feels magical again. Emotions become more vivid, colors brighter, and joy more real\u2014like when you were a child, before the world imposed its opinions and negativity on you. Make sense now?

But awakening feels even better because now you understand who you truly are.`
      },
      {
        heading: "We Are One",
        body: `We are one. There is no separation. Separation is one of the biggest illusions there is. We are all the same source (God) experiencing itself in different forms.

The world likes to keep us distracted and stuck in this cycle that makes us rely on the system, when really, we are one with nature, and nature provides us with everything we need to live.

Yet somehow, they have convinced us that it's natural and normal to go to school, work our whole lives, pay bills and taxes, and just accept that this is what life is. And if you question the system, now you're the crazy one.

Now you have people telling you to just live in the "real world" and continue to live a life of misery and disconnection because that's just "what life is."

Those people are so far stuck in the system, in the "matrix," that they close their minds. They listen and don't stop to think for a second or question a thing.

That's exactly what they want.

The matrix wants you to just oblige and follow along. Everything they do is to disconnect you. They embed things into your subconscious through music, movies, ads\u2014everything around you.

They don't want us to listen to our own soul, so they keep us constantly distracted and in fear.

Fear is one of the lowest frequencies you can be on. So they put things on the news that will make us afraid. They get people debating and turning against each other. They want us in conflict with each other, to keep us distracted from the fact that we are all one.

There is nothing to fear but fear itself. If you don't give into the fear the world is trying to place on you, if you stay in allignment and true to yourself then you are vibrating on a frequency where fear can't even reach you.

No one else's opinions have anything to do with you, good or bad.

Stop caring about what other people think of you or how they view you, or you are going to trap yourself in a cycle of trying to please everyone around you\u2014which is impossible anyway.

Learn that it's okay to be misunderstood. Accept that, because that's what will free you the most.

We all misunderstand each other because we are living life through our own lens. You misunderstand people every day, not on purpose, but it's just something you can't escape. Everyone sees the world through their own experiences, beliefs, and perceptions.

So stop trying to prove yourself to others.

Your view of yourself is the only one that truly matters.

You have to put yourself first, no matter what. People are always going to have opinions about your life, so who cares? Choose to live a life that makes you happy.

No one else needs to understand.

You don't owe anybody anything.`
      },
      {
        heading: "Everything You Were Taught",
        body: `Pretty much everything you were taught is a lie. Everything you were taught is actually the opposite of what was instilled in us.

We literally have all of the answers inside of us. All of us.

The way you access it is by sitting with yourself, truly connecting with yourself and with nature. The answers are all in the present moment, always.

Life is a mirror, your inner world is being relefected back to you. You can't expect the person in the mirror to smile if you don't smile first.

Time is an illusion, the past and future don't exist, only the present does. It can be hard for our human minds to comprehend but everything is happening all at once. Everything from the "past" every "future" possibility is all happening in the now. there is no seperation, time is a construct that we made up.

The most powerful tool is awareness and presence.

Being truly present means living in the moment and not staying attached to the past. Our thoughts aren't us. They are there to distract us from the present moment.

If you are fully present and aware in the now moment, life would feel incredible. You would be seeing the magic and beauty of everything. You would be looking at everything through a fresh lens.

Being present means not being attached to the past. It means allowing everything to be a new experience without giving it meaning based on what we have previously experienced.

There is nothing to worry about

The life that is meant for you will find you, if you take alligned action, following your joy and curiosity then you wil naturally attract your desires. Focus on the present moment and follow your inspiration. Worrying about the future doesn't help anything. When the future comes it's no longer the fututre it will be the present moment. So keep your attention on the now. Worring in general never helps anything, our worries are made up in our heads, they are almost always about the past, which no longer exists and doesn't benefit us to ruminate on, or they are about the future or made up scenerios that are our minds trying to get us to stay stuck and create us to feel negative emotions. Stay present and there is nothing to worry about.`
      },
      {
        heading: "Meditation and Stillness",
        body: "Meditation is such a useful tool. It trains us to sit with ourselves, sit in the stillness, and really feel our true essence, which is found in the silence because we are the silence.\n\nYou are your soul.\n\nYou are energy.\n\nThis is just a human vessel that you are in to experience this life and learn the lessons you need to learn."
      },
      {
        heading: "Detachment",
        body: "Detachment is one of the most important things. Being able to detach from your character and know that you are much grander than you once thought.\n\nThis allows us to live a more fulfilling life.\n\nWhen you can stay detached, it doesn't mean not feeling things or just being numb to life. Detachment means detaching from your ego and living through who you truly are, which is God, which is love.\n\nEvery action you take is through love.\n\nYou are still living this human experience, of course. When scenarios play out, you are still going to feel emotions. You are still going to feel sad and angry.\n\nBut when you are detached, it means you let your human feel that, and then you don't cling onto it. You let it naturally flow past and go on to the next emotion.\n\nIf you truly face yourself and feel all emotions as they come up, instead of running and hiding from them, then they will naturally flow.\n\nIf you try to hide from yourself and run from discomfort rather than face it and sit with it, that can get stored in your body and show up one way or another.\n\nOur physical symptoms can be a signal that something needs our attention. They can show us where we may be out of alignment and invite us to look deeper within ourselves."
      },
      {
        heading: "Everything Starts Within",
        body: "The only way you can make a change is by going within.\n\nLoving yourself is what heals.\n\nLoving and accepting all parts of yourself.\n\nChange always starts from within. You can't expect to change things in the outer world and make a big difference if you aren't willing to change within yourself first.\n\nIt's all within, because you are everything.\n\nAlways listen to yourself above all, you know your truth, no one else.\n\nWhen awakening your knowledge and understanding is always expanding, so there is so many more deep layers that I could go into on this topic, but I just wanted to cover some of the basics to help guide people or help people awakening feel less alone. Awakening is such a personal  journey and a lot of the time we don't have anyone else in our lives understanding what we are going through or experiecing, which can feel tough. To see through the veil and have the world label you as crazy only for seeing the truth of it all. But you aren't crazy you are just awakened."
      }
    ].map((section, i) => /* @__PURE__ */ React22.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:261:17",
        key: i,
        className: "bg-raised border border-border rounded-lg p-6 space-y-3"
      },
      section.heading && /* @__PURE__ */ React22.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:266:21", className: "text-base font-semibold text-primary" }, section.heading),
      section.body.split("\n\n").map((para, j) => /* @__PURE__ */ React22.createElement(
        "p",
        {
          "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:271:21",
          key: j,
          className: "text-sm text-secondary leading-relaxed"
        },
        para
      ))
    )), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:281:15", className: "flex justify-center pt-2" }, /* @__PURE__ */ React22.createElement(
      Button,
      {
        variant: "primary",
        onClick: () => setScreen("reflections"),
        className: "gap-2"
      },
      /* @__PURE__ */ React22.createElement(Feather, { className: "size-4" }),
      " Open Reflection Prompts"
    ))), /* @__PURE__ */ React22.createElement(TabsContent, { value: "medium", className: "mt-6" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:294:15", className: "bg-raised border border-border rounded-lg p-6 space-y-4" }, /* @__PURE__ */ React22.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:295:17", className: "text-sm text-secondary leading-relaxed" }, "Spiritual awakening is the journey of becoming aware of your true essence \u2014 the part of you that exists beyond the human story, the ego, and the conditioning of the world. It's the process of remembering that you are a powerful soul having a human experience, and that everything you need is already within you."), /* @__PURE__ */ React22.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:303:17", className: "text-sm text-secondary leading-relaxed" }, "Awakening helps you see life through a clearer lens. You begin to understand your emotions, detach from fear, question old beliefs, and reconnect with presence, intuition, and inner peace. It can be challenging at times, but it is also one of the most fulfilling and transformative experiences you can have."))), /* @__PURE__ */ React22.createElement(TabsContent, { value: "faq", className: "mt-6" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:316:15", className: "bg-raised border border-border rounded-lg px-4 divide-y divide-border-weak" }, FAQS2.map((faq) => /* @__PURE__ */ React22.createElement(FAQItem, { key: faq.q, q: faq.q, a: faq.a })))))));
  }
  return /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:330:5", className: "min-h-dvh bg-background pb-24" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:331:7", className: "mx-auto max-w-[1200px] px-4 py-8 space-y-6" }, /* @__PURE__ */ React22.createElement("nav", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:333:9", className: "flex items-center gap-1 text-sm text-secondary" }, /* @__PURE__ */ React22.createElement(
    "button",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:334:11",
      className: "hover:text-primary cursor-pointer transition-colors duration-150",
      onClick: () => setScreen("overview")
    },
    "Spiritual Awakening"
  ), /* @__PURE__ */ React22.createElement(ChevronRight7, { className: "size-3.5" }), /* @__PURE__ */ React22.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:341:11", className: "text-primary" }, "Reflection Prompts")), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:344:9", className: "flex items-center gap-3" }, /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:345:11", className: "inline-flex rounded-full bg-warning-weak p-3" }, /* @__PURE__ */ React22.createElement(Feather, { className: "size-6 text-warning" })), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:348:11" }, /* @__PURE__ */ React22.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:349:13", className: "text-2xl font-semibold tracking-tight text-primary" }, "Reflection Prompts"), /* @__PURE__ */ React22.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:352:13", className: "text-sm text-secondary mt-0.5" }, "Choose a prompt and write freely \u2014 no right or wrong answers."))), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:358:9", className: "space-y-3" }, PROMPTS.map((prompt, idx) => /* @__PURE__ */ React22.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:360:13",
      key: idx,
      className: "bg-raised border border-border rounded-lg overflow-hidden"
    },
    /* @__PURE__ */ React22.createElement(
      "button",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:364:15",
        className: "w-full flex items-center justify-between px-4 py-4 text-left cursor-pointer",
        onClick: () => setActivePrompt(activePrompt === idx ? null : idx),
        "aria-expanded": activePrompt === idx
      },
      /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:371:17", className: "flex items-start gap-3 min-w-0" }, /* @__PURE__ */ React22.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:372:19", className: "mt-0.5 text-xs font-semibold text-accent shrink-0 w-5 text-right" }, idx + 1), /* @__PURE__ */ React22.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:375:19", className: "text-sm font-medium text-primary leading-snug" }, prompt)),
      /* @__PURE__ */ React22.createElement(
        ChevronDown2,
        {
          className: `size-4 text-secondary shrink-0 ml-3 transition-transform duration-150 ${activePrompt === idx ? "rotate-180" : ""}`
        }
      )
    ),
    activePrompt === idx && /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:387:17", className: "px-4 pb-4 space-y-3 border-t border-border-weak pt-4" }, /* @__PURE__ */ React22.createElement(
      Textarea,
      {
        placeholder: "Write your thoughts here...",
        value: journals[idx] ?? "",
        onChange: (e) => setJournals((prev) => ({
          ...prev,
          [idx]: e.target.value
        })),
        rows: 5
      }
    ), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:399:19", className: "flex justify-end" }, /* @__PURE__ */ React22.createElement(
      Button,
      {
        variant: "primary",
        size: "sm",
        onClick: () => handleSaveJournal(idx),
        disabled: !journals[idx]?.trim()
      },
      "Save reflection"
    )))
  ))), /* @__PURE__ */ React22.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/SpiritualAwakening.tsx:415:9", className: "flex justify-center pt-2" }, /* @__PURE__ */ React22.createElement(
    Button,
    {
      variant: "tertiary",
      onClick: () => setScreen("learn-more"),
      className: "gap-2"
    },
    /* @__PURE__ */ React22.createElement(BookOpen2, { className: "size-4" }),
    " Back to Learn More"
  ))));
}

