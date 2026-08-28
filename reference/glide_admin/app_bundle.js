
// virtual:apps/spiritual-healing/client/_glide-root.tsx
import React25 from "react";
import { createRoot } from "react-dom/client";
import { mountGlideApp } from "@g3/runtime";

// virtual:apps/spiritual-healing/client/App.tsx
import React24 from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// virtual:apps/spiritual-healing/client/components/Toast.tsx
import React, { useEffect, useState } from "react";
import { Toaster as Sonner, toast } from "sonner";
import { cn } from "@glide/cn";
function Toaster({ className, ...props }) {
  const [theme, setTheme] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  useEffect(() => {
    if (typeof document === "undefined") return;
    const observer = new MutationObserver(() => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    return () => observer.disconnect();
  }, []);
  return /* @__PURE__ */ React.createElement(
    Sonner,
    {
      "data-slot": "toaster",
      theme,
      position: "bottom-center",
      visibleToasts: 3,
      className: cn("toaster group", className),
      style: {
        // Sonner styles toasts via CSS custom properties — overriding
        // them here is the documented way to re-theme. Default/variant
        // bg + text are inverted so toasts stand out on any surface.
        "--normal-bg": "var(--color-primary)",
        "--normal-text": "var(--color-background)",
        "--normal-border": "transparent",
        "--success-bg": "var(--color-success)",
        "--success-text": "var(--color-background)",
        "--success-border": "transparent",
        "--error-bg": "var(--color-error)",
        "--error-text": "var(--color-background)",
        "--error-border": "transparent",
        "--warning-bg": "var(--color-warning)",
        "--warning-text": "var(--color-background)",
        "--warning-border": "transparent",
        "--info-bg": "var(--color-info)",
        "--info-text": "var(--color-background)",
        "--info-border": "transparent"
      },
      toastOptions: {
        classNames: {
          description: "group-[.toast]:text-background/70",
          actionButton: "group-[.toast]:bg-background group-[.toast]:text-primary",
          cancelButton: "group-[.toast]:bg-background/20 group-[.toast]:text-background"
        }
      },
      ...props
    }
  );
}
Toaster.displayName = "Toaster";

// virtual:apps/spiritual-healing/client/pages/Home.tsx
import React3 from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";

// virtual:apps/spiritual-healing/client/components/Button.tsx
import React2, { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn as cn2 } from "@glide/cn";
var buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all data-[disabled]:pointer-events-none data-[disabled]:opacity-50 outline-none focus-visible:border-focus-ring focus-visible:ring-focus-ring/50 focus-visible:ring-[3px] aria-invalid:ring-error/20 aria-invalid:border-error shrink-0 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:m-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:bg-accent-hover",
        "primary-neutral": "bg-primary text-background hover:bg-primary/90",
        "primary-destructive": "bg-error text-white hover:bg-error/90 focus-visible:ring-error/20",
        secondary: "bg-inset text-primary hover:bg-border",
        "secondary-destructive": "bg-error/10 text-error hover:bg-error/20",
        tertiary: "border border-border bg-background hover:bg-inset",
        ghost: "hover:bg-inset",
        "ghost-destructive": "text-error hover:bg-error/10"
      },
      size: {
        xs: "h-6 gap-1 px-2 has-[>svg:not(.animate-spin)]:px-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1.5 px-3 has-[>svg:not(.animate-spin)]:px-2.5",
        md: "h-9 gap-2 px-4 has-[>svg:not(.animate-spin)]:px-3",
        lg: "h-10 gap-2 px-5 has-[>svg:not(.animate-spin)]:px-4",
        xl: "h-11 gap-2 px-6 has-[>svg:not(.animate-spin)]:px-5",
        "2xl": "h-12 gap-2.5 px-8 has-[>svg:not(.animate-spin)]:px-6",
        icon: "size-9"
      }
    },
    defaultVariants: { variant: "primary", size: "md" }
  }
);
var Button = forwardRef(
  ({
    className,
    variant,
    size,
    asChild = false,
    isLoading,
    disabled,
    type,
    children,
    onClick,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || isLoading;
    const showLoadingUI = isLoading && !asChild;
    const buttonType = asChild ? void 0 : type ?? "button";
    const handleClick = isDisabled ? (event) => {
      event.preventDefault();
      event.stopPropagation();
    } : onClick;
    return /* @__PURE__ */ React2.createElement(
      Comp,
      {
        ref,
        "data-slot": "button",
        type: buttonType,
        className: cn2(
          buttonVariants({ variant, size, className }),
          showLoadingUI && "relative"
        ),
        disabled: asChild ? void 0 : isDisabled,
        "data-disabled": isDisabled || void 0,
        "aria-disabled": isDisabled || void 0,
        "aria-busy": isLoading || void 0,
        onClick: handleClick,
        ...props
      },
      showLoadingUI ? /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/components/Button.tsx:117:13", className: "invisible inline-flex items-center gap-2" }, children), /* @__PURE__ */ React2.createElement(Loader2, { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" }), /* @__PURE__ */ React2.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/components/Button.tsx:121:13", className: "sr-only" }, "Loading...")) : children
    );
  }
);
Button.displayName = "Button";

// virtual:apps/spiritual-healing/client/pages/Home.tsx
import {
  Moon,
  Zap,
  Heart,
  Clock,
  ChevronRight,
  Sparkles,
  Star,
  Wand2,
  BookHeart,
  Wind,
  Smartphone,
  Monitor,
  Share2,
  PlusSquare,
  CalendarClock,
  Sunrise
} from "lucide-react";
var CATEGORY_META = {
  meditation: {
    label: "Meditations",
    icon: /* @__PURE__ */ React3.createElement(Moon, { className: "size-6" }),
    color: "bg-info-weak text-info",
    href: "/library/meditation"
  },
  shadow_work: {
    label: "Shadow Work",
    icon: /* @__PURE__ */ React3.createElement(Zap, { className: "size-6" }),
    color: "bg-warning-weak text-warning",
    href: "/library/shadow_work"
  },
  chakra_healing: {
    label: "Chakra Healing",
    icon: /* @__PURE__ */ React3.createElement(Heart, { className: "size-6" }),
    color: "bg-success-weak text-success",
    href: "/chakras"
  },
  reiki: {
    label: "Reiki",
    icon: /* @__PURE__ */ React3.createElement(Star, { className: "size-6" }),
    color: "bg-warning-weak text-warning",
    href: "/library/reiki"
  },
  manifestation: {
    label: "Manifestation",
    icon: /* @__PURE__ */ React3.createElement(Wand2, { className: "size-6" }),
    color: "bg-info-weak text-info",
    href: "/manifestation"
  },
  affirmations: {
    label: "Affirmations",
    icon: /* @__PURE__ */ React3.createElement(BookHeart, { className: "size-6" }),
    color: "bg-accent/10 text-accent",
    href: "/affirmations"
  },
  breathing: {
    label: "Breathing",
    icon: /* @__PURE__ */ React3.createElement(Wind, { className: "size-6" }),
    color: "bg-info-weak text-info",
    href: "/breathing"
  },
  spiritual_awakening: {
    label: "Spiritual Awakening",
    icon: /* @__PURE__ */ React3.createElement(Sunrise, { className: "size-6" }),
    color: "bg-warning-weak text-warning",
    href: "/spiritual-awakening"
  }
};
function Home() {
  const { data: previews = [] } = useQuery({
    queryKey: ["content", "preview"],
    queryFn: () => fetch("/app-api/content/preview").then((r) => r.json())
  });
  const { data: subStatus } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => fetch("/app-api/subscription/status").then((r) => r.json())
  });
  const isSubscribed = subStatus?.subscribed;
  return /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:92:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React3.createElement("section", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:94:7", className: "px-4 pt-16 pb-12 text-center mx-auto max-w-[1200px]" }, /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:95:9", className: "inline-flex items-center gap-2 rounded-full bg-inset px-3 py-1 text-xs text-secondary mb-6" }, /* @__PURE__ */ React3.createElement(Sparkles, { className: "size-3 text-accent" }), "Guided healing for your inner journey"), /* @__PURE__ */ React3.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:99:9", className: "text-4xl md:text-5xl font-semibold tracking-tight text-primary mb-4 leading-tight" }, "Heal. Grow. Awaken."), /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:102:9", className: "text-base text-secondary max-w-lg mx-auto mb-8" }, "Guided meditations, shadow work sessions, chakra healing and Reiki \u2014 all in one place. Begin your transformation today."), isSubscribed ? /* @__PURE__ */ React3.createElement(Button, { asChild: true }, /* @__PURE__ */ React3.createElement(Link, { to: "/library" }, "Go to My Library")) : /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:111:11", className: "flex flex-col sm:flex-row gap-3 justify-center" }, /* @__PURE__ */ React3.createElement(Button, { asChild: true }, /* @__PURE__ */ React3.createElement(Link, { to: "/library" }, "Explore Free Content")), /* @__PURE__ */ React3.createElement(Button, { variant: "secondary", asChild: true }, /* @__PURE__ */ React3.createElement(Link, { to: "/profile" }, "Subscribe Now"))), /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:120:9", className: "flex flex-col sm:flex-row gap-3 justify-center mt-3" }, /* @__PURE__ */ React3.createElement(Button, { variant: "secondary", asChild: true }, /* @__PURE__ */ React3.createElement(Link, { to: "/booking", className: "inline-flex items-center gap-2" }, /* @__PURE__ */ React3.createElement(CalendarClock, { className: "size-4" }), " Booking")))), /* @__PURE__ */ React3.createElement("section", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:130:7", className: "mx-auto max-w-[1200px] px-4 pb-12" }, /* @__PURE__ */ React3.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:131:9", className: "text-xl font-semibold text-primary mb-6 text-center" }, "What's included"), /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:134:9", className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, Object.entries(CATEGORY_META).map(([key, meta]) => /* @__PURE__ */ React3.createElement(
    Link,
    {
      key,
      to: meta.href,
      className: "rounded-lg border border-border bg-raised p-6 hover:bg-inset transition-colors cursor-pointer"
    },
    /* @__PURE__ */ React3.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:141:15",
        className: `inline-flex rounded-full p-3 mb-4 ${meta.color}`
      },
      meta.icon
    ),
    /* @__PURE__ */ React3.createElement("h3", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:146:15", className: "text-base font-semibold text-primary mb-1" }, meta.label),
    /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:149:15", className: "text-sm text-secondary" }, key === "meditation" && "Cultivate stillness, clarity, and presence through guided breath and awareness practices.", key === "shadow_work" && "A guided journey \u2014 learn what shadow work is, listen to a meditation, then reflect with journaling prompts.", key === "chakra_healing" && "Balance and awaken your energy centres for greater vitality and flow.", key === "reiki" && "Channel universal life force energy for deep healing, relaxation, and restoration.", key === "manifestation" && "A guided journey \u2014 understand how manifestation works, explore the inner work, and complete a personal exercise.", key === "affirmations" && "20 healing affirmations to speak aloud, save your favourites, and draw a daily affirmation.", key === "breathing" && "7 breathwork techniques for grounding, calm, energy, and nervous system reset.", key === "spiritual_awakening" && "Explore the signs, stages, and gifts of spiritual awakening \u2014 with guided reflections and journaling prompts."),
    /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:167:15", className: "flex items-center gap-1 mt-4 text-sm text-accent font-medium" }, "Explore ", /* @__PURE__ */ React3.createElement(ChevronRight, { className: "size-4" }))
  )))), previews.length > 0 && /* @__PURE__ */ React3.createElement("section", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:177:9", className: "mx-auto max-w-[1200px] px-4 pb-16" }, /* @__PURE__ */ React3.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:178:11", className: "text-xl font-semibold text-primary mb-2" }, "Free preview sessions"), /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:181:11", className: "text-sm text-secondary mb-6" }, "Try these sessions before you subscribe."), /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:184:11", className: "space-y-3" }, previews.map((item) => {
    const meta = CATEGORY_META[item.category];
    return /* @__PURE__ */ React3.createElement(
      Link,
      {
        key: item.id,
        to: item.category === "shadow_work" ? `/shadow-work/${item.id}` : item.category === "reiki" ? `/reiki/${item.id}` : `/content/${item.id}`,
        className: "flex items-center gap-4 rounded-lg border border-border bg-raised p-4 hover:bg-inset transition-colors cursor-pointer"
      },
      /* @__PURE__ */ React3.createElement(
        "div",
        {
          "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:199:19",
          className: `flex-shrink-0 inline-flex rounded-full p-2 ${meta?.color}`
        },
        meta?.icon
      ),
      /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:204:19", className: "flex-1 min-w-0" }, /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:205:21", className: "text-sm font-medium text-primary truncate" }, item.title), /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:208:21", className: "text-xs text-secondary truncate" }, item.description)),
      /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:212:19", className: "flex items-center gap-1 text-xs text-secondary flex-shrink-0" }, /* @__PURE__ */ React3.createElement(Clock, { className: "size-3" }), " ", item.duration_minutes, " min"),
      /* @__PURE__ */ React3.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:215:19", className: "flex-shrink-0 inline-flex items-center rounded-full bg-success-weak px-2 py-0.5 text-xs font-medium text-success" }, "Free")
    );
  }))), /* @__PURE__ */ React3.createElement("section", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:226:7", className: "mx-auto max-w-[1200px] px-4 pb-16" }, /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:227:9", className: "rounded-lg border border-border bg-raised p-6 md:p-8" }, /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:228:11", className: "flex items-center gap-2 mb-2" }, /* @__PURE__ */ React3.createElement(Smartphone, { className: "size-5 text-accent" }), /* @__PURE__ */ React3.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:230:13", className: "text-lg font-semibold text-primary" }, "Add to your home screen")), /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:234:11", className: "text-sm text-secondary mb-6" }, "For the best experience, add this app to your home screen \u2014 it opens fullscreen like a real app, no browser bar."), /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:238:11", className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:239:13", className: "rounded-md border border-border bg-inset p-4" }, /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:240:15", className: "flex items-center gap-2 mb-3" }, /* @__PURE__ */ React3.createElement(Share2, { className: "size-4 text-info" }), /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:242:17", className: "text-sm font-semibold text-primary" }, "iPhone")), /* @__PURE__ */ React3.createElement("ol", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:244:15", className: "space-y-2 text-xs text-secondary" }, /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:245:17" }, "1. Open this link in", " ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:247:19", className: "text-primary" }, "Safari")), /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:249:17" }, "2. Tap the ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:250:30", className: "text-primary" }, "Share"), " ", "button at the bottom"), /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:253:17" }, "3. Tap", " ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:255:19", className: "text-primary" }, "Add to Home Screen")), /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:257:17" }, "4. Tap ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:258:26", className: "text-primary" }, "Add")))), /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:262:13", className: "rounded-md border border-border bg-inset p-4" }, /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:263:15", className: "flex items-center gap-2 mb-3" }, /* @__PURE__ */ React3.createElement(PlusSquare, { className: "size-4 text-success" }), /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:265:17", className: "text-sm font-semibold text-primary" }, "Android (Samsung)")), /* @__PURE__ */ React3.createElement("ol", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:269:15", className: "space-y-2 text-xs text-secondary" }, /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:270:17" }, "1. Open this link in", " ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:272:19", className: "text-primary" }, "Samsung Internet")), /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:274:17" }, "2. Tap the", " ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:276:19", className: "text-primary" }, "menu (three lines)"), " ", "at the bottom"), /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:279:17" }, "3. Tap ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:280:26", className: "text-primary" }, "Add page to")), /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:282:17" }, "4. Tap ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:283:26", className: "text-primary" }, "Home screen")))), /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:287:13", className: "rounded-md border border-border bg-inset p-4" }, /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:288:15", className: "flex items-center gap-2 mb-3" }, /* @__PURE__ */ React3.createElement(Monitor, { className: "size-4 text-secondary" }), /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:290:17", className: "text-sm font-semibold text-primary" }, "Computer")), /* @__PURE__ */ React3.createElement("ol", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:292:15", className: "space-y-2 text-xs text-secondary" }, /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:293:17" }, "1. Open this link in", " ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:295:19", className: "text-primary" }, "Chrome")), /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:297:17" }, "2. Click the", " ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:299:19", className: "text-primary" }, "install icon"), " in the address bar"), /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:302:17" }, "3. Click ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:303:28", className: "text-primary" }, "Install")), /* @__PURE__ */ React3.createElement("li", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:305:17" }, "4. Or simply bookmark the page")))), /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:309:11", className: "text-xs text-secondary mt-5 text-center" }, "When you receive your login email, open the link in the", " ", /* @__PURE__ */ React3.createElement("strong", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:311:13", className: "text-primary" }, "same browser"), " you used to sign in \u2014 this keeps you logged in."))), !isSubscribed && /* @__PURE__ */ React3.createElement("section", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:319:9", className: "mx-auto max-w-[1200px] px-4 pb-16" }, /* @__PURE__ */ React3.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:320:11", className: "rounded-lg border border-border bg-raised p-8 text-center" }, /* @__PURE__ */ React3.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:321:13", className: "text-2xl font-semibold text-primary mb-3" }, "Unlock the full library"), /* @__PURE__ */ React3.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Home.tsx:324:13", className: "text-sm text-secondary max-w-md mx-auto mb-6" }, "Get unlimited access to all meditations, shadow work sessions, chakra healing and Reiki guides. New content added regularly."), /* @__PURE__ */ React3.createElement(Button, { asChild: true }, /* @__PURE__ */ React3.createElement(Link, { to: "/profile" }, "Subscribe \u2014 Stripe coming soon")))));
}

// virtual:apps/spiritual-healing/client/pages/Library.tsx
import React5 from "react";
import { useQuery as useQuery2 } from "@tanstack/react-query";
import { Link as Link2, useParams } from "react-router-dom";

// virtual:apps/spiritual-healing/client/components/Tabs.tsx
import React4, { forwardRef as forwardRef2, useEffect as useEffect2, useRef } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn as cn3 } from "@glide/cn";
var Tabs = forwardRef2(({ className, ...props }, ref) => /* @__PURE__ */ React4.createElement(
  TabsPrimitive.Root,
  {
    ref,
    "data-slot": "tabs",
    className: cn3(
      "data-[orientation=vertical]:flex data-[orientation=vertical]:gap-4",
      className
    ),
    ...props
  }
));
Tabs.displayName = TabsPrimitive.Root.displayName;
var TabsList = forwardRef2(({ className, children, ...props }, ref) => {
  const scrollerRef = useRef(null);
  useEffect2(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const atStart = el.scrollLeft <= 0 && e.deltaY < 0;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1 && e.deltaY > 0;
      if (atStart || atEnd) return;
      e.preventDefault();
      el.scrollLeft += e.deltaMode ? e.deltaY * 24 : e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);
  return /* @__PURE__ */ React4.createElement(
    TabsPrimitive.List,
    {
      ref,
      "data-slot": "tabs-list",
      className: cn3(
        "group/tabs-list flex w-fit max-w-full max-h-full rounded-lg bg-inset",
        "data-[orientation=vertical]:h-fit",
        className
      ),
      ...props
    },
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/components/Tabs.tsx:69:7",
        ref: scrollerRef,
        className: cn3(
          "flex min-w-0 min-h-0 items-center justify-start gap-1 overflow-auto scrollbar-none rounded-lg p-1",
          "group-data-[orientation=vertical]/tabs-list:flex-col group-data-[orientation=vertical]/tabs-list:items-stretch"
        )
      },
      children
    )
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;
var TabsTrigger = forwardRef2(({ className, ...props }, ref) => /* @__PURE__ */ React4.createElement(
  TabsPrimitive.Trigger,
  {
    ref,
    "data-slot": "tabs-trigger",
    className: cn3(
      "cursor-pointer inline-flex h-7 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
      "transition-colors",
      "disabled:pointer-events-none disabled:opacity-50",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
      "text-secondary hover:text-primary",
      "data-[state=active]:bg-raised data-[state=active]:text-primary data-[state=active]:shadow-sm",
      "outline-none focus-visible:border-focus-ring",
      "focus-visible:ring-focus-ring/50 focus-visible:ring-[3px]",
      "data-[orientation=vertical]:justify-start",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
var TabsContent = forwardRef2(({ className, ...props }, ref) => /* @__PURE__ */ React4.createElement(
  TabsPrimitive.Content,
  {
    ref,
    "data-slot": "tabs-content",
    className: cn3("outline-none data-[orientation=vertical]:flex-1", className),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

// virtual:apps/spiritual-healing/client/pages/Library.tsx
import {
  Moon as Moon2,
  Zap as Zap2,
  Heart as Heart2,
  Clock as Clock2,
  Lock,
  CheckCircle2,
  Sparkles as Sparkles2
} from "lucide-react";
var CATEGORIES = [
  { key: "all", label: "All" },
  {
    key: "meditation",
    label: "Meditations",
    icon: /* @__PURE__ */ React5.createElement(Moon2, { className: "size-4" })
  },
  {
    key: "shadow_work",
    label: "Shadow Work",
    icon: /* @__PURE__ */ React5.createElement(Zap2, { className: "size-4" })
  },
  {
    key: "chakra_healing",
    label: "Chakra Healing",
    icon: /* @__PURE__ */ React5.createElement(Heart2, { className: "size-4" })
  },
  {
    key: "reiki",
    label: "Reiki",
    icon: /* @__PURE__ */ React5.createElement(Sparkles2, { className: "size-4" })
  }
];
var CATEGORY_META2 = {
  meditation: {
    color: "bg-info-weak text-info",
    icon: /* @__PURE__ */ React5.createElement(Moon2, { className: "size-4" })
  },
  shadow_work: {
    color: "bg-warning-weak text-warning",
    icon: /* @__PURE__ */ React5.createElement(Zap2, { className: "size-4" })
  },
  chakra_healing: {
    color: "bg-success-weak text-success",
    icon: /* @__PURE__ */ React5.createElement(Heart2, { className: "size-4" })
  },
  reiki: {
    color: "bg-warning-weak text-warning",
    icon: /* @__PURE__ */ React5.createElement(Sparkles2, { className: "size-4" })
  }
};
function ContentCard({
  item,
  isSubscribed
}) {
  const meta = CATEGORY_META2[item.category];
  const locked = !item.is_preview && !isSubscribed && item.category !== "shadow_work" && item.category !== "reiki";
  const href = item.category === "shadow_work" ? `/shadow-work/${item.id}` : item.category === "reiki" ? `/reiki/${item.id}` : item.category === "chakra_healing" ? `/chakras` : `/content/${item.id}`;
  return /* @__PURE__ */ React5.createElement(
    Link2,
    {
      to: href,
      className: "flex items-start gap-4 rounded-lg border border-border bg-raised p-4 hover:bg-inset transition-colors cursor-pointer"
    },
    /* @__PURE__ */ React5.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:88:7",
        className: `flex-shrink-0 inline-flex rounded-full p-2 mt-0.5 ${meta?.color}`
      },
      meta?.icon
    ),
    /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:93:7", className: "flex-1 min-w-0" }, /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:94:9", className: "flex items-center gap-2 mb-1" }, /* @__PURE__ */ React5.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:95:11", className: "text-sm font-medium text-primary truncate" }, item.title), item.completed && /* @__PURE__ */ React5.createElement(CheckCircle2, { className: "size-4 text-success flex-shrink-0" }), locked && /* @__PURE__ */ React5.createElement(Lock, { className: "size-4 text-secondary flex-shrink-0" })), /* @__PURE__ */ React5.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:103:9", className: "text-xs text-secondary line-clamp-2" }, item.description), /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:106:9", className: "flex items-center gap-3 mt-2" }, item.category === "shadow_work" && /* @__PURE__ */ React5.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:108:13", className: "inline-flex items-center rounded-full bg-warning-weak px-2 py-0.5 text-xs font-medium text-warning" }, "Full journey"), item.category === "reiki" && /* @__PURE__ */ React5.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:113:13", className: "inline-flex items-center rounded-full bg-warning-weak px-2 py-0.5 text-xs font-medium text-warning" }, "Full journey"), item.duration_minutes && /* @__PURE__ */ React5.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:118:13", className: "flex items-center gap-1 text-xs text-secondary" }, /* @__PURE__ */ React5.createElement(Clock2, { className: "size-3" }), " ", item.duration_minutes, " min"), item.is_preview && /* @__PURE__ */ React5.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:123:13", className: "inline-flex items-center rounded-full bg-success-weak px-2 py-0.5 text-xs font-medium text-success" }, "Free")))
  );
}
function CategoryTab({
  category,
  isSubscribed
}) {
  const { data: items = [], isLoading } = useQuery2({
    queryKey: ["content", category],
    queryFn: () => {
      const url = category === "all" ? "/app-api/content" : `/app-api/content?category=${category}`;
      return fetch(url).then((r) => r.json());
    }
  });
  if (isLoading) {
    return /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:153:7", className: "space-y-3 py-4" }, [1, 2, 3].map((i) => /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:155:11", key: i, className: "h-20 rounded-lg bg-inset animate-pulse" })));
  }
  if (items.length === 0) {
    return /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:163:7", className: "py-12 text-center text-secondary text-sm" }, "No content here yet \u2014 check back soon.");
  }
  return /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:170:5", className: "space-y-3 py-4" }, items.map((item) => /* @__PURE__ */ React5.createElement(ContentCard, { key: item.id, item, isSubscribed })));
}
function Library() {
  const { category } = useParams();
  const defaultTab = category || "all";
  const { data: subStatus } = useQuery2({
    queryKey: ["subscription"],
    queryFn: () => fetch("/app-api/subscription/status").then((r) => r.json())
  });
  const isSubscribed = subStatus?.subscribed ?? false;
  return /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:190:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:191:7", className: "mx-auto max-w-[1200px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React5.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:192:9", className: "text-2xl font-semibold tracking-tight text-primary mb-2" }, "Library"), !isSubscribed && /* @__PURE__ */ React5.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Library.tsx:196:11", className: "rounded-md border border-info bg-info-weak p-3 text-sm text-info mb-6" }, "You're viewing free preview content.", " ", /* @__PURE__ */ React5.createElement(
    Link2,
    {
      to: "/profile",
      className: "font-medium underline underline-offset-4"
    },
    "Subscribe"
  ), " ", "to unlock everything."), /* @__PURE__ */ React5.createElement(Tabs, { defaultValue: defaultTab }, /* @__PURE__ */ React5.createElement(TabsList, null, CATEGORIES.map((cat) => /* @__PURE__ */ React5.createElement(TabsTrigger, { key: cat.key, value: cat.key }, cat.label))), CATEGORIES.map((cat) => /* @__PURE__ */ React5.createElement(TabsContent, { key: cat.key, value: cat.key }, /* @__PURE__ */ React5.createElement(CategoryTab, { category: cat.key, isSubscribed }))))));
}

// virtual:apps/spiritual-healing/client/pages/ContentDetail.tsx
import React6 from "react";
import { useParams as useParams2, Link as Link3, useNavigate } from "react-router-dom";
import { useQuery as useQuery3, useQueryClient } from "@tanstack/react-query";
import {
  Moon as Moon3,
  Zap as Zap3,
  Heart as Heart3,
  Clock as Clock3,
  Lock as Lock2,
  ChevronLeft,
  CheckCircle2 as CheckCircle22,
  Sparkles as Sparkles3
} from "lucide-react";
var CATEGORY_META3 = {
  meditation: {
    label: "Meditation",
    color: "bg-info-weak text-info",
    icon: /* @__PURE__ */ React6.createElement(Moon3, { className: "size-5" })
  },
  shadow_work: {
    label: "Shadow Work",
    color: "bg-warning-weak text-warning",
    icon: /* @__PURE__ */ React6.createElement(Zap3, { className: "size-5" })
  },
  chakra_healing: {
    label: "Chakra Healing",
    color: "bg-success-weak text-success",
    icon: /* @__PURE__ */ React6.createElement(Heart3, { className: "size-5" })
  },
  reiki: {
    label: "Reiki",
    color: "bg-warning-weak text-warning",
    icon: /* @__PURE__ */ React6.createElement(Sparkles3, { className: "size-5" })
  }
};
function ContentDetail() {
  const { id } = useParams2();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [marking, setMarking] = React6.useState(false);
  const {
    data: item,
    isLoading,
    error
  } = useQuery3({
    queryKey: ["content-item", id],
    queryFn: () => fetch(`/app-api/content/${id}`).then((r) => r.json()),
    enabled: !!id
  });
  const { data: subStatus } = useQuery3({
    queryKey: ["subscription"],
    queryFn: () => fetch("/app-api/subscription/status").then((r) => r.json())
  });
  const isSubscribed = subStatus?.subscribed ?? false;
  async function markComplete() {
    setMarking(true);
    try {
      await fetch(`/app-api/content/${id}/complete`, { method: "POST" });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      queryClient.invalidateQueries({ queryKey: ["content-item", id] });
      toast.success("Marked as complete");
    } catch {
      toast.error("Could not save progress");
    } finally {
      setMarking(false);
    }
  }
  if (isLoading) {
    return /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:82:7", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:83:9", className: "mx-auto max-w-[1200px] px-4 pt-8" }, /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:84:11", className: "h-8 w-48 rounded bg-inset animate-pulse mb-6" }), /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:85:11", className: "h-64 rounded-lg bg-inset animate-pulse" })));
  }
  if (error || !item) {
    return /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:93:7", className: "min-h-dvh bg-background flex items-center justify-center" }, /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:94:9", className: "text-center" }, /* @__PURE__ */ React6.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:95:11", className: "text-secondary text-sm mb-4" }, "Content not found."), /* @__PURE__ */ React6.createElement(Button, { variant: "secondary", onClick: () => navigate(-1) }, "Go back")));
  }
  const meta = CATEGORY_META3[item.category];
  return /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:107:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:108:7", className: "mx-auto max-w-[1200px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React6.createElement("nav", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:110:9", className: "flex items-center gap-1 text-sm text-secondary mb-6" }, /* @__PURE__ */ React6.createElement(Link3, { to: "/library", className: "hover:text-primary transition-colors" }, "Library"), /* @__PURE__ */ React6.createElement(ChevronLeft, { className: "size-3.5 rotate-180" }), /* @__PURE__ */ React6.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:115:11", className: "text-primary" }, item.title)), /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:119:9", className: "flex items-start gap-4 mb-8" }, /* @__PURE__ */ React6.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:120:11",
      className: `flex-shrink-0 inline-flex rounded-full p-3 ${meta?.color}`
    },
    meta?.icon
  ), /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:125:11", className: "flex-1 min-w-0" }, /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:126:13", className: "flex items-center gap-2 flex-wrap mb-1" }, /* @__PURE__ */ React6.createElement(
    "span",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:127:15",
      className: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${meta?.color}`
    },
    meta?.label
  ), item.is_preview && /* @__PURE__ */ React6.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:133:17", className: "inline-flex items-center rounded-full bg-success-weak px-2 py-0.5 text-xs font-medium text-success" }, "Free preview"), item.completed && /* @__PURE__ */ React6.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:138:17", className: "inline-flex items-center gap-1 rounded-full bg-success-weak px-2 py-0.5 text-xs font-medium text-success" }, /* @__PURE__ */ React6.createElement(CheckCircle22, { className: "size-3" }), " Completed")), /* @__PURE__ */ React6.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:143:13", className: "text-2xl font-semibold tracking-tight text-primary" }, item.title), item.duration_minutes && /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:147:15", className: "flex items-center gap-1 text-sm text-secondary mt-1" }, /* @__PURE__ */ React6.createElement(Clock3, { className: "size-4" }), " ", item.duration_minutes, " minutes"))), item.description && /* @__PURE__ */ React6.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:156:11", className: "text-base text-secondary mb-8 max-w-2xl" }, item.description), item.locked ? /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:163:11", className: "rounded-lg border border-border bg-raised p-8 text-center" }, /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:164:13", className: "inline-flex rounded-full bg-inset p-4 mb-4" }, /* @__PURE__ */ React6.createElement(Lock2, { className: "size-6 text-secondary" })), /* @__PURE__ */ React6.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:167:13", className: "text-lg font-semibold text-primary mb-2" }, "Subscribe to access this session"), /* @__PURE__ */ React6.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:170:13", className: "text-sm text-secondary max-w-sm mx-auto mb-6" }, "This session is part of the full library. Subscribe to unlock all meditations, shadow work, and chakra healing content."), /* @__PURE__ */ React6.createElement(Button, { asChild: true }, /* @__PURE__ */ React6.createElement(Link3, { to: "/profile" }, "Subscribe \u2014 Stripe coming soon"))) : /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:179:11", className: "space-y-6" }, /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:181:13", className: "rounded-lg border border-border bg-raised p-6" }, /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:182:15", className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React6.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:183:17",
      className: `flex-shrink-0 inline-flex rounded-full p-2 ${meta?.color}`
    },
    meta?.icon
  ), /* @__PURE__ */ React6.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:188:17", className: "text-sm font-medium text-primary" }, item.title)), item.content_body && item.content_body.startsWith("audio/") ? /* @__PURE__ */ React6.createElement(
    "audio",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:191:17",
      controls: true,
      className: "w-full",
      src: `/app-api/audio/${item.content_body}`
    },
    "Your browser does not support the audio element."
  ) : /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:199:17", className: "text-center py-4" }, /* @__PURE__ */ React6.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:200:19", className: "text-sm text-secondary mb-1" }, "No audio uploaded yet"), /* @__PURE__ */ React6.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:203:19", className: "text-xs text-secondary" }, "Upload your recording in the Admin panel."))), item.content_body && !item.content_body.startsWith("audio/") && /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:212:15", className: "rounded-lg border border-border bg-raised p-6" }, /* @__PURE__ */ React6.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:213:17", className: "text-base font-semibold text-primary mb-4" }, "Session guide"), /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:216:17", className: "text-sm text-secondary whitespace-pre-wrap leading-relaxed" }, item.content_body)), !item.completed && isSubscribed && /* @__PURE__ */ React6.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ContentDetail.tsx:224:15", className: "flex justify-end" }, /* @__PURE__ */ React6.createElement(
    Button,
    {
      variant: "secondary",
      onClick: markComplete,
      isLoading: marking
    },
    /* @__PURE__ */ React6.createElement(CheckCircle22, { className: "size-4" }),
    " Mark as complete"
  )))));
}

// virtual:apps/spiritual-healing/client/pages/Profile.tsx
import React7 from "react";
import { useQuery as useQuery4 } from "@tanstack/react-query";

// virtual:apps/spiritual-healing/auth.ts
var session = {
  async get() {
    if (typeof window === "undefined") {
      throw new Error(
        "session.get() is client-side only \u2014 on the server use auth(c).user()."
      );
    }
    try {
      const res = await fetch("/__g3/session", {
        headers: { accept: "application/json" }
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data || data.authenticated !== true || !data.userId || !data.email) {
        return null;
      }
      return data.name ? { id: data.userId, email: data.email, name: data.name } : { id: data.userId, email: data.email };
    } catch {
      return null;
    }
  }
};
function signOut() {
  if (typeof window === "undefined") {
    throw new Error(
      "signOut() is client-side only \u2014 it navigates the browser to the sign-out endpoint."
    );
  }
  window.location.href = "/__g3/logout";
}

// virtual:apps/spiritual-healing/client/pages/Profile.tsx
import { CheckCircle2 as CheckCircle23, Clock as Clock4, User } from "lucide-react";
function Profile() {
  const { data: user } = useQuery4({
    queryKey: ["session"],
    queryFn: () => session.get()
  });
  const { data: subStatus, isLoading: subLoading } = useQuery4({
    queryKey: ["subscription"],
    queryFn: () => fetch("/app-api/subscription/status").then((r) => r.json())
  });
  const isSubscribed = subStatus?.subscribed;
  const statusLabel = subStatus?.status;
  return /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:22:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:23:7", className: "mx-auto max-w-[1200px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React7.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:24:9", className: "text-2xl font-semibold tracking-tight text-primary mb-8" }, "Profile"), /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:29:9", className: "rounded-lg border border-border bg-raised p-6 mb-6" }, /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:30:11", className: "flex items-center gap-4 mb-4" }, /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:31:13", className: "flex-shrink-0 inline-flex rounded-full bg-inset p-3" }, /* @__PURE__ */ React7.createElement(User, { className: "size-6 text-secondary" })), /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:34:13", className: "min-w-0" }, /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:35:15", className: "text-base font-semibold text-primary truncate" }, user?.name ?? "Your account"), /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:38:15", className: "text-sm text-secondary truncate" }, user?.email ?? "Loading..."))), /* @__PURE__ */ React7.createElement(Button, { variant: "secondary", size: "sm", onClick: () => signOut() }, "Sign out")), /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:49:9", className: "rounded-lg border border-border bg-raised p-6 mb-6" }, /* @__PURE__ */ React7.createElement("h2", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:50:11", className: "text-base font-semibold text-primary mb-4" }, "Subscription"), subLoading ? /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:54:13", className: "h-8 w-40 rounded bg-inset animate-pulse" }) : isSubscribed ? /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:56:13", className: "space-y-3" }, /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:57:15", className: "flex items-center gap-2" }, /* @__PURE__ */ React7.createElement(CheckCircle23, { className: "size-5 text-success" }), /* @__PURE__ */ React7.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:59:17", className: "text-sm font-medium text-success capitalize" }, statusLabel === "trialing" ? "Free trial active" : "Active subscriber")), subStatus?.plan_name && /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:66:17", className: "text-sm text-secondary" }, "Plan: ", subStatus.plan_name), subStatus?.current_period_end && /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:71:17", className: "flex items-center gap-1 text-sm text-secondary" }, /* @__PURE__ */ React7.createElement(Clock4, { className: "size-4" }), "Renews", " ", new Date(subStatus.current_period_end).toLocaleDateString(
    "en-AU",
    { day: "numeric", month: "long", year: "numeric" }
  )), /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:80:15", className: "text-xs text-secondary mt-2" }, "To manage or cancel your subscription, contact us.")) : /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:85:13", className: "space-y-4" }, /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:86:15", className: "text-sm text-secondary" }, "You don't have an active subscription yet."), /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:90:15", className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" }, /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:92:17", className: "rounded-lg border-2 border-accent bg-raised p-5" }, /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:93:19", className: "text-xs text-accent font-semibold uppercase tracking-wide mb-2" }, "Monthly"), /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:96:19", className: "text-3xl font-semibold text-primary mb-1" }, "$19", /* @__PURE__ */ React7.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:98:21", className: "text-base font-normal text-secondary" }, "/mo")), /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:102:19", className: "text-sm text-secondary mb-4" }, "Full access to all content. Cancel any time."), /* @__PURE__ */ React7.createElement(Button, { className: "w-full", size: "sm", disabled: true }, "Coming soon \u2014 Stripe setup pending")), /* @__PURE__ */ React7.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:110:17", className: "rounded-lg border border-border bg-raised p-5" }, /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:111:19", className: "text-xs text-secondary font-semibold uppercase tracking-wide mb-2" }, "Annual"), /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:114:19", className: "text-3xl font-semibold text-primary mb-1" }, "$149", /* @__PURE__ */ React7.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:116:21", className: "text-base font-normal text-secondary" }, "/yr")), /* @__PURE__ */ React7.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Profile.tsx:120:19", className: "text-sm text-secondary mb-4" }, "Save 35% compared to monthly. Full access."), /* @__PURE__ */ React7.createElement(
    Button,
    {
      variant: "secondary",
      className: "w-full",
      size: "sm",
      disabled: true
    },
    "Coming soon \u2014 Stripe setup pending"
  )))))));
}

// virtual:apps/spiritual-healing/client/pages/Admin.tsx
import React14, { useState as useState4, useRef as useRef2 } from "react";
import { useQuery as useQuery5, useQueryClient as useQueryClient2 } from "@tanstack/react-query";

// virtual:apps/spiritual-healing/client/components/Dialog.tsx
import React8, {
  createContext,
  forwardRef as forwardRef3,
  useContext,
  useEffect as useEffect3,
  useState as useState2
} from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Drawer as VaulDrawer } from "vaul";
import { X } from "lucide-react";
import { cn as cn4 } from "@glide/cn";
var DESKTOP_QUERY = "(min-width: 768px)";
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState2(
    () => typeof window !== "undefined" ? window.matchMedia(DESKTOP_QUERY).matches : true
  );
  useEffect3(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
}
var MobileSheetContext = createContext(false);
function Dialog(props) {
  const isDesktop = useIsDesktop();
  if (isDesktop) return /* @__PURE__ */ React8.createElement(DialogPrimitive.Root, { ...props });
  return /* @__PURE__ */ React8.createElement(MobileSheetContext.Provider, { value: true }, /* @__PURE__ */ React8.createElement(VaulDrawer.Root, { ...props }));
}
var DialogTrigger = forwardRef3((props, ref) => {
  const isMobile = useContext(MobileSheetContext);
  return isMobile ? /* @__PURE__ */ React8.createElement(VaulDrawer.Trigger, { ref, ...props }) : /* @__PURE__ */ React8.createElement(DialogPrimitive.Trigger, { ref, ...props });
});
DialogTrigger.displayName = "DialogTrigger";
var DialogPortal = ({
  children,
  ...props
}) => {
  const isMobile = useContext(MobileSheetContext);
  return isMobile ? /* @__PURE__ */ React8.createElement(VaulDrawer.Portal, { ...props }, children) : /* @__PURE__ */ React8.createElement(DialogPrimitive.Portal, { ...props }, children);
};
DialogPortal.displayName = "DialogPortal";
var DialogClose = forwardRef3((props, ref) => {
  const isMobile = useContext(MobileSheetContext);
  return isMobile ? /* @__PURE__ */ React8.createElement(VaulDrawer.Close, { ref, ...props }) : /* @__PURE__ */ React8.createElement(DialogPrimitive.Close, { ref, ...props });
});
DialogClose.displayName = "DialogClose";
var DialogOverlay = forwardRef3(({ className, ...props }, ref) => {
  const isMobile = useContext(MobileSheetContext);
  const Cmp = isMobile ? VaulDrawer.Overlay : DialogPrimitive.Overlay;
  return /* @__PURE__ */ React8.createElement(
    Cmp,
    {
      ref,
      "data-slot": "dialog-overlay",
      className: cn4(
        "fixed inset-0 z-50 bg-black/60",
        "data-[state=open]:animate-overlay-in data-[state=closed]:animate-overlay-out",
        className
      ),
      ...props
    }
  );
});
DialogOverlay.displayName = "DialogOverlay";
var DialogContent = forwardRef3(({ className, children, hideCloseButton, ...props }, ref) => {
  const isMobile = useContext(MobileSheetContext);
  if (!isMobile) {
    return /* @__PURE__ */ React8.createElement(DialogPortal, null, /* @__PURE__ */ React8.createElement(DialogOverlay, null), /* @__PURE__ */ React8.createElement(
      DialogPrimitive.Content,
      {
        ref,
        "data-slot": "dialog-content",
        className: cn4(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
          "gap-4 border bg-raised p-6 shadow-lg sm:rounded-lg",
          "data-[state=open]:animate-dialog-in data-[state=closed]:animate-dialog-out",
          className
        ),
        ...props
      },
      children,
      !hideCloseButton && /* @__PURE__ */ React8.createElement(
        DialogPrimitive.Close,
        {
          "data-slot": "dialog-close",
          className: cn4(
            "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity",
            "hover:opacity-100",
            "outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
            "disabled:pointer-events-none",
            "data-[state=open]:bg-inset data-[state=open]:text-secondary"
          )
        },
        /* @__PURE__ */ React8.createElement(X, { className: "h-4 w-4" }),
        /* @__PURE__ */ React8.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/components/Dialog.tsx:163:15", className: "sr-only" }, "Close")
      )
    ));
  }
  return /* @__PURE__ */ React8.createElement(DialogPortal, null, /* @__PURE__ */ React8.createElement(DialogOverlay, null), /* @__PURE__ */ React8.createElement(
    VaulDrawer.Content,
    {
      ref,
      "data-slot": "dialog-content",
      className: cn4(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[90vh] flex-col",
        "rounded-t-2xl border-t border-border-weak bg-raised shadow-lg",
        "outline-none",
        className
      ),
      ...props
    },
    /* @__PURE__ */ React8.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/components/Dialog.tsx:187:9",
        "aria-hidden": true,
        className: "mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-border-strong"
      }
    ),
    /* @__PURE__ */ React8.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/components/Dialog.tsx:191:9",
        className: "flex flex-col gap-4 px-6 pt-4 pb-6",
        style: { paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }
      },
      children,
      !hideCloseButton && /* @__PURE__ */ React8.createElement(
        VaulDrawer.Close,
        {
          "data-slot": "dialog-close",
          className: cn4(
            "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity",
            "hover:opacity-100",
            "outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
            "disabled:pointer-events-none"
          )
        },
        /* @__PURE__ */ React8.createElement(X, { className: "h-4 w-4" }),
        /* @__PURE__ */ React8.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/components/Dialog.tsx:207:15", className: "sr-only" }, "Close")
      )
    )
  ));
});
DialogContent.displayName = "DialogContent";
var DialogHeader = ({
  className,
  ...props
}) => /* @__PURE__ */ React8.createElement(
  "div",
  {
    "data-glide-source": "apps/spiritual-healing/client/components/Dialog.tsx:221:3",
    "data-slot": "dialog-header",
    className: cn4(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    ),
    ...props
  }
);
DialogHeader.displayName = "DialogHeader";
var DialogFooter = ({
  className,
  ...props
}) => /* @__PURE__ */ React8.createElement(
  "div",
  {
    "data-glide-source": "apps/spiritual-healing/client/components/Dialog.tsx:236:3",
    "data-slot": "dialog-footer",
    className: cn4(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    ),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
var DialogTitle = forwardRef3(({ className, ...props }, ref) => {
  const isMobile = useContext(MobileSheetContext);
  const Cmp = isMobile ? VaulDrawer.Title : DialogPrimitive.Title;
  return /* @__PURE__ */ React8.createElement(
    Cmp,
    {
      ref,
      "data-slot": "dialog-title",
      className: cn4(
        "text-base font-semibold leading-none tracking-tight",
        className
      ),
      ...props
    }
  );
});
DialogTitle.displayName = "DialogTitle";
var DialogDescription = forwardRef3(({ className, ...props }, ref) => {
  const isMobile = useContext(MobileSheetContext);
  const Cmp = isMobile ? VaulDrawer.Description : DialogPrimitive.Description;
  return /* @__PURE__ */ React8.createElement(
    Cmp,
    {
      ref,
      "data-slot": "dialog-description",
      className: cn4("text-sm text-secondary", className),
      ...props
    }
  );
});
DialogDescription.displayName = "DialogDescription";

// virtual:apps/spiritual-healing/client/components/Form.tsx
import React10, { createContext as createContext2, forwardRef as forwardRef5, useContext as useContext2, useId } from "react";
import { Slot as Slot2 } from "@radix-ui/react-slot";

// virtual:apps/spiritual-healing/client/components/Label.tsx
import React9, { forwardRef as forwardRef4 } from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn as cn5 } from "@glide/cn";
var labelClasses = "flex items-center gap-2 text-sm font-medium leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50";
var Label = forwardRef4(({ className, ...props }, ref) => /* @__PURE__ */ React9.createElement(
  LabelPrimitive.Root,
  {
    ref,
    "data-slot": "label",
    className: cn5(labelClasses, className),
    ...props
  }
));
Label.displayName = LabelPrimitive.Root.displayName;

// virtual:apps/spiritual-healing/client/components/Form.tsx
import { cn as cn6 } from "@glide/cn";
var FormItemContext = createContext2(null);
function useFormItem(component) {
  const ctx = useContext2(FormItemContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside a <FormItem>.`);
  }
  return ctx;
}
var FormItem = forwardRef5(
  ({ className, error, ...props }, ref) => {
    const reactId = useId();
    const value = {
      id: reactId,
      descriptionId: `${reactId}-description`,
      messageId: `${reactId}-message`,
      error
    };
    return /* @__PURE__ */ React10.createElement(FormItemContext.Provider, { value }, /* @__PURE__ */ React10.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/components/Form.tsx:65:9",
        ref,
        "data-slot": "form-item",
        className: cn6("space-y-2", className),
        ...props
      }
    ));
  }
);
FormItem.displayName = "FormItem";
var FormLabel = forwardRef5(({ className, ...props }, ref) => {
  const { id } = useFormItem("FormLabel");
  return /* @__PURE__ */ React10.createElement(
    Label,
    {
      ref,
      "data-slot": "form-label",
      htmlFor: id,
      className,
      ...props
    }
  );
});
FormLabel.displayName = "FormLabel";
var FormControl = forwardRef5(({ ...props }, ref) => {
  const { id, descriptionId, messageId, error } = useFormItem("FormControl");
  return /* @__PURE__ */ React10.createElement(
    Slot2,
    {
      ref,
      id,
      "aria-describedby": `${descriptionId} ${messageId}`,
      "aria-invalid": error ? true : void 0,
      ...props
    }
  );
});
FormControl.displayName = "FormControl";
var FormDescription = forwardRef5(({ className, ...props }, ref) => {
  const { descriptionId } = useFormItem("FormDescription");
  return /* @__PURE__ */ React10.createElement(
    "p",
    {
      "data-glide-source": "apps/spiritual-healing/client/components/Form.tsx:117:5",
      ref,
      "data-slot": "form-description",
      id: descriptionId,
      className: cn6("text-xs text-secondary", className),
      ...props
    }
  );
});
FormDescription.displayName = "FormDescription";
var FormMessage = forwardRef5(({ className, children, ...props }, ref) => {
  const { messageId, error } = useFormItem("FormMessage");
  const body = children ?? error;
  if (!body) return null;
  return /* @__PURE__ */ React10.createElement(
    "p",
    {
      "data-glide-source": "apps/spiritual-healing/client/components/Form.tsx:138:5",
      ref,
      "data-slot": "form-message",
      id: messageId,
      className: cn6("text-xs font-medium text-error", className),
      ...props
    },
    body
  );
});
FormMessage.displayName = "FormMessage";

// virtual:apps/spiritual-healing/client/components/Input.tsx
import React11, { forwardRef as forwardRef6 } from "react";
import { cn as cn7 } from "@glide/cn";
var Input = forwardRef6(
  ({ className, type, size = "default", ...props }, ref) => /* @__PURE__ */ React11.createElement(
    "input",
    {
      "data-glide-source": "apps/spiritual-healing/client/components/Input.tsx:22:5",
      type,
      ref,
      "data-slot": "input",
      "data-size": size,
      className: cn7(
        "flex w-full rounded-md border border-transparent bg-inset px-3 py-2 text-sm",
        "data-[size=default]:h-9 data-[size=sm]:h-8",
        "file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-primary",
        "placeholder:text-tertiary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-error aria-invalid:ring-error/20",
        className
      ),
      ...props
    }
  )
);
Input.displayName = "Input";

// virtual:apps/spiritual-healing/client/components/Textarea.tsx
import React12, { forwardRef as forwardRef7 } from "react";
import { cn as cn8 } from "@glide/cn";
var Textarea = forwardRef7(
  ({ className, ...props }, ref) => /* @__PURE__ */ React12.createElement(
    "textarea",
    {
      "data-glide-source": "apps/spiritual-healing/client/components/Textarea.tsx:14:5",
      ref,
      "data-slot": "textarea",
      className: cn8(
        "flex min-h-[80px] w-full resize-y rounded-md border border-transparent bg-inset px-3 py-2 text-sm",
        "placeholder:text-tertiary",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-error aria-invalid:ring-error/20",
        className
      ),
      ...props
    }
  )
);
Textarea.displayName = "Textarea";

// virtual:apps/spiritual-healing/client/components/Select.tsx
import React13, { forwardRef as forwardRef8, useEffect as useEffect4, useState as useState3 } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn as cn9 } from "@glide/cn";
var FINE_POINTER_QUERY = "(any-hover: hover) and (any-pointer: fine)";
function useCanHover() {
  const [canHover, setCanHover] = useState3(
    () => typeof window !== "undefined" ? window.matchMedia(FINE_POINTER_QUERY).matches : true
  );
  useEffect4(() => {
    const mq = window.matchMedia(FINE_POINTER_QUERY);
    const onChange = () => setCanHover(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return canHover;
}
var SelectValue = SelectPrimitive.Value;
var SelectTrigger = forwardRef8(({ className, children, size = "default", ...props }, ref) => /* @__PURE__ */ React13.createElement(
  SelectPrimitive.Trigger,
  {
    ref,
    "data-slot": "select-trigger",
    "data-size": size,
    className: cn9(
      "cursor-pointer flex w-full items-center justify-between rounded-md border border-transparent bg-inset",
      "px-3 py-2 text-sm",
      "data-[size=default]:h-9 data-[size=sm]:h-8",
      "[&>span[data-placeholder]]:text-tertiary",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "aria-invalid:border-error aria-invalid:ring-error/20",
      "[&>span]:line-clamp-1",
      className
    ),
    ...props
  },
  children,
  /* @__PURE__ */ React13.createElement(SelectPrimitive.Icon, { asChild: true }, /* @__PURE__ */ React13.createElement(ChevronDown, { className: "h-4 w-4 opacity-50" }))
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
var SelectScrollUpButton = forwardRef8(({ className, ...props }, ref) => /* @__PURE__ */ React13.createElement(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    "data-slot": "select-scroll-up-button",
    className: cn9(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props
  },
  /* @__PURE__ */ React13.createElement(ChevronUp, { className: "h-4 w-4" })
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
var SelectScrollDownButton = forwardRef8(({ className, ...props }, ref) => /* @__PURE__ */ React13.createElement(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    "data-slot": "select-scroll-down-button",
    className: cn9(
      "flex cursor-default items-center justify-center py-1",
      className
    ),
    ...props
  },
  /* @__PURE__ */ React13.createElement(ChevronDown, { className: "h-4 w-4" })
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
var SelectContent = forwardRef8(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ React13.createElement(SelectPrimitive.Portal, null, /* @__PURE__ */ React13.createElement(
  SelectPrimitive.Content,
  {
    ref,
    "data-slot": "select-content",
    className: cn9(
      "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border",
      "bg-raised text-primary shadow-md",
      "data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props
  },
  /* @__PURE__ */ React13.createElement(SelectScrollUpButton, null),
  /* @__PURE__ */ React13.createElement(
    SelectPrimitive.Viewport,
    {
      className: cn9(
        "p-1",
        position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
      )
    },
    children
  ),
  /* @__PURE__ */ React13.createElement(SelectScrollDownButton, null)
)));
SelectContent.displayName = SelectPrimitive.Content.displayName;
var SelectLabel = forwardRef8(({ className, ...props }, ref) => /* @__PURE__ */ React13.createElement(
  SelectPrimitive.Label,
  {
    ref,
    "data-slot": "select-label",
    className: cn9("px-2 py-1.5 text-xs font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
var EMPTY_VALUE = " ";
function encodeValue(v) {
  return v === "" ? EMPTY_VALUE : v;
}
function decodeValue(v) {
  return v === EMPTY_VALUE ? "" : v;
}
var SelectItem = forwardRef8(({ className, children, ...props }, ref) => /* @__PURE__ */ React13.createElement(
  SelectPrimitive.Item,
  {
    ref,
    "data-slot": "select-item",
    className: cn9(
      "relative flex w-full cursor-pointer select-none items-center rounded-sm",
      "py-1.5 pl-8 pr-2 text-sm outline-none",
      "focus:bg-inset focus:text-primary",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    value: encodeValue(props.value)
  },
  /* @__PURE__ */ React13.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/components/Select.tsx:197:5", className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center" }, /* @__PURE__ */ React13.createElement(SelectPrimitive.ItemIndicator, null, /* @__PURE__ */ React13.createElement(Check, { className: "h-4 w-4" }))),
  /* @__PURE__ */ React13.createElement(SelectPrimitive.ItemText, null, children)
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
var SelectSeparator = forwardRef8(({ className, ...props }, ref) => /* @__PURE__ */ React13.createElement(
  SelectPrimitive.Separator,
  {
    ref,
    "data-slot": "select-separator",
    className: cn9("-mx-1 my-1 h-px bg-border", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
function textOf(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React13.isValidElement(node)) {
    return textOf(node.props.children);
  }
  return "";
}
function parseSelectChildren(node) {
  let placeholder;
  let size = "default";
  const items = [];
  function visit(n) {
    React13.Children.forEach(n, (child) => {
      if (!React13.isValidElement(child)) return;
      const props = child.props;
      if (child.type === SelectTrigger) {
        if (props.size) size = props.size;
      } else if (child.type === SelectValue) {
        if (typeof props.placeholder === "string")
          placeholder = props.placeholder;
        return;
      } else if (child.type === SelectItem) {
        items.push({
          value: props.value ?? "",
          label: textOf(props.children),
          disabled: props.disabled
        });
        return;
      }
      if (props.children !== void 0) visit(props.children);
    });
  }
  visit(node);
  return { placeholder, size, items };
}
function MobileNativeSelect({
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  required,
  children
}) {
  const { placeholder, size, items } = parseSelectChildren(children);
  const isControlled = value !== void 0;
  const [internal, setInternal] = useState3(defaultValue ?? "");
  const v = isControlled ? value ?? "" : internal;
  return /* @__PURE__ */ React13.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/components/Select.tsx:298:5", className: "relative w-full" }, /* @__PURE__ */ React13.createElement(
    "select",
    {
      "data-glide-source": "apps/spiritual-healing/client/components/Select.tsx:299:7",
      value: v,
      onChange: (e) => {
        if (!isControlled) setInternal(e.target.value);
        onValueChange?.(e.target.value);
      },
      disabled,
      name,
      required,
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn9(
        // Match Radix trigger geometry so layouts don't shift between
        // breakpoints. `appearance-none` strips the browser default
        // caret so our chevron is the only one shown.
        "flex w-full appearance-none items-center justify-between rounded-md border border-transparent bg-inset",
        "px-3 pr-9 py-2 text-sm",
        size === "default" ? "h-9" : "h-8",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-error aria-invalid:ring-error/20"
      )
    },
    placeholder !== void 0 && /* @__PURE__ */ React13.createElement("option", { "data-glide-source": "apps/spiritual-healing/client/components/Select.tsx:323:11", value: "", disabled: true, hidden: true }, placeholder),
    items.map((i) => /* @__PURE__ */ React13.createElement("option", { "data-glide-source": "apps/spiritual-healing/client/components/Select.tsx:328:11", key: i.value, value: i.value, disabled: i.disabled }, i.label))
  ), /* @__PURE__ */ React13.createElement(
    ChevronDown,
    {
      "aria-hidden": true,
      className: "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
    }
  ));
}
function Select(props) {
  const canHover = useCanHover();
  if (canHover) {
    return /* @__PURE__ */ React13.createElement(
      SelectPrimitive.Root,
      {
        ...props,
        onValueChange: props.onValueChange ? (v) => props.onValueChange(decodeValue(v)) : void 0
      }
    );
  }
  return /* @__PURE__ */ React13.createElement(MobileNativeSelect, { ...props });
}

// virtual:apps/spiritual-healing/client/pages/Admin.tsx
import {
  Plus,
  Pencil,
  Trash2,
  Moon as Moon4,
  Zap as Zap4,
  Heart as Heart4,
  Users,
  Sparkles as Sparkles4,
  Upload,
  Music
} from "lucide-react";
var CATEGORY_ICONS = {
  meditation: /* @__PURE__ */ React14.createElement(Moon4, { className: "size-4" }),
  shadow_work: /* @__PURE__ */ React14.createElement(Zap4, { className: "size-4" }),
  chakra_healing: /* @__PURE__ */ React14.createElement(Heart4, { className: "size-4" }),
  reiki: /* @__PURE__ */ React14.createElement(Sparkles4, { className: "size-4" })
};
var EMPTY_FORM = {
  category: "meditation",
  title: "",
  description: "",
  duration_minutes: "",
  is_preview: false,
  sort_order: "0"
};
function ContentFormFields({
  initial,
  onSave,
  onCancel,
  saving
}) {
  const [form, setForm] = useState4(initial);
  const [audioFile, setAudioFile] = useState4(null);
  const audioInputRef = useRef2(null);
  function update(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  return /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:74:5", className: "space-y-4" }, /* @__PURE__ */ React14.createElement(FormItem, null, /* @__PURE__ */ React14.createElement(FormLabel, null, "Category"), /* @__PURE__ */ React14.createElement(FormControl, null, /* @__PURE__ */ React14.createElement(
    Select,
    {
      value: form.category,
      onValueChange: (v) => update("category", v)
    },
    /* @__PURE__ */ React14.createElement(SelectTrigger, null, /* @__PURE__ */ React14.createElement(SelectValue, null)),
    /* @__PURE__ */ React14.createElement(SelectContent, null, /* @__PURE__ */ React14.createElement(SelectItem, { value: "meditation" }, "Meditation"), /* @__PURE__ */ React14.createElement(SelectItem, { value: "shadow_work" }, "Shadow Work"), /* @__PURE__ */ React14.createElement(SelectItem, { value: "chakra_healing" }, "Chakra Healing"), /* @__PURE__ */ React14.createElement(SelectItem, { value: "reiki" }, "Reiki"))
  ))), /* @__PURE__ */ React14.createElement(FormItem, null, /* @__PURE__ */ React14.createElement(FormLabel, null, "Title"), /* @__PURE__ */ React14.createElement(FormControl, null, /* @__PURE__ */ React14.createElement(
    Input,
    {
      value: form.title,
      onChange: (e) => update("title", e.target.value),
      placeholder: "e.g. Anxiety Release"
    }
  ))), /* @__PURE__ */ React14.createElement(FormItem, null, /* @__PURE__ */ React14.createElement(FormLabel, null, "Description"), /* @__PURE__ */ React14.createElement(FormControl, null, /* @__PURE__ */ React14.createElement(
    Textarea,
    {
      value: form.description,
      onChange: (e) => update("description", e.target.value),
      placeholder: "A short sentence shown in the library \u2014 what does this session help with?"
    }
  ))), /* @__PURE__ */ React14.createElement(FormItem, null, /* @__PURE__ */ React14.createElement(FormLabel, null, "Duration (minutes)"), /* @__PURE__ */ React14.createElement(FormControl, null, /* @__PURE__ */ React14.createElement(
    Input,
    {
      type: "number",
      value: form.duration_minutes,
      onChange: (e) => update("duration_minutes", e.target.value),
      placeholder: "e.g. 20"
    }
  ))), /* @__PURE__ */ React14.createElement(FormItem, null, /* @__PURE__ */ React14.createElement(FormLabel, null, "Audio file (MP3)"), /* @__PURE__ */ React14.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:132:9",
      className: "rounded-md border border-border bg-inset p-4 text-center cursor-pointer hover:bg-raised transition-colors",
      onClick: () => audioInputRef.current?.click()
    },
    audioFile ? /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:137:13", className: "flex items-center justify-center gap-2" }, /* @__PURE__ */ React14.createElement(Music, { className: "size-4 text-success" }), /* @__PURE__ */ React14.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:139:15", className: "text-sm text-primary font-medium truncate max-w-[240px]" }, audioFile.name), /* @__PURE__ */ React14.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:142:15", className: "text-xs text-secondary" }, "(", (audioFile.size / 1024 / 1024).toFixed(1), " MB)")) : /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:147:13", className: "flex flex-col items-center gap-1" }, /* @__PURE__ */ React14.createElement(Upload, { className: "size-5 text-secondary" }), /* @__PURE__ */ React14.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:149:15", className: "text-sm text-secondary" }, "Click to choose your audio file"), /* @__PURE__ */ React14.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:152:15", className: "text-xs text-secondary" }, "MP3, WAV, M4A \u2014 up to 100 MB"))
  ), /* @__PURE__ */ React14.createElement(
    "input",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:158:9",
      ref: audioInputRef,
      type: "file",
      accept: "audio/*",
      className: "hidden",
      onChange: (e) => {
        const file = e.target.files?.[0] ?? null;
        setAudioFile(file);
        if (file && !form.title) {
          const name = file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ").replace(/\bfinal\b/gi, "").trim();
          update(
            "title",
            name.replace(/\b\w/g, (c) => c.toUpperCase())
          );
        }
        e.target.value = "";
      }
    }
  )), /* @__PURE__ */ React14.createElement(FormItem, null, /* @__PURE__ */ React14.createElement(FormLabel, null, "Sort order"), /* @__PURE__ */ React14.createElement(FormControl, null, /* @__PURE__ */ React14.createElement(
    Input,
    {
      type: "number",
      value: form.sort_order,
      onChange: (e) => update("sort_order", e.target.value),
      placeholder: "1"
    }
  ))), /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:195:7", className: "flex items-center gap-2" }, /* @__PURE__ */ React14.createElement(
    "input",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:196:9",
      type: "checkbox",
      id: "is_preview",
      checked: form.is_preview,
      onChange: (e) => update("is_preview", e.target.checked),
      className: "size-4 cursor-pointer"
    }
  ), /* @__PURE__ */ React14.createElement(
    "label",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:203:9",
      htmlFor: "is_preview",
      className: "text-sm text-primary cursor-pointer"
    },
    "Free preview \u2014 visible without a subscription"
  )), /* @__PURE__ */ React14.createElement(DialogFooter, null, /* @__PURE__ */ React14.createElement(Button, { variant: "secondary", onClick: onCancel }, "Cancel"), /* @__PURE__ */ React14.createElement(
    Button,
    {
      onClick: () => onSave(form, audioFile),
      isLoading: saving,
      disabled: !form.title.trim()
    },
    "Save session"
  )));
}
function ContentTab() {
  const queryClient = useQueryClient2();
  const [open, setOpen] = useState4(false);
  const [editing, setEditing] = useState4(null);
  const [saving, setSaving] = useState4(false);
  const [deleting, setDeleting] = useState4(null);
  const [uploading, setUploading] = useState4(null);
  const [uploadTargetId, setUploadTargetId] = useState4(null);
  const fileInputRef = useRef2(null);
  const { data: items = [], isLoading } = useQuery5({
    queryKey: ["admin-content"],
    queryFn: () => fetch("/app-api/admin/content").then((r) => r.json())
  });
  function openCreate() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(item) {
    setEditing(item);
    setOpen(true);
  }
  async function uploadAudio(id, file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/app-api/admin/upload-audio/${id}`, {
      method: "POST",
      body: fd
    });
    if (!res.ok) throw new Error("Audio upload failed");
  }
  async function handleSave(form, audioFile) {
    setSaving(true);
    try {
      const url = editing ? `/app-api/admin/content/${editing.id}` : "/app-api/admin/content";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: form.category,
          title: form.title,
          description: form.description,
          content_body: null,
          duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
          is_preview: form.is_preview,
          sort_order: Number(form.sort_order) || 0
        })
      });
      const saved = await res.json();
      if (audioFile) {
        const id = editing?.id ?? saved.id;
        await uploadAudio(id, audioFile);
      }
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success(editing ? "Session updated" : "Session added");
      setOpen(false);
    } catch {
      toast.error("Could not save session");
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(id) {
    setDeleting(id);
    try {
      await fetch(`/app-api/admin/content/${id}`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Session deleted");
    } catch {
      toast.error("Could not delete session");
    } finally {
      setDeleting(null);
    }
  }
  async function handleReplaceAudio(id, file) {
    setUploading(id);
    try {
      await uploadAudio(id, file);
      queryClient.invalidateQueries({ queryKey: ["admin-content"] });
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Audio replaced");
    } catch {
      toast.error("Could not upload audio");
    } finally {
      setUploading(null);
      setUploadTargetId(null);
    }
  }
  const initialForm = editing ? {
    category: editing.category,
    title: editing.title,
    description: editing.description ?? "",
    duration_minutes: editing.duration_minutes ? String(editing.duration_minutes) : "",
    is_preview: editing.is_preview,
    sort_order: String(editing.sort_order ?? 0)
  } : { ...EMPTY_FORM };
  return /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:345:5" }, /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:346:7", className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React14.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:347:9", className: "text-sm text-secondary" }, items.length, " sessions"), /* @__PURE__ */ React14.createElement(Button, { size: "sm", onClick: openCreate }, /* @__PURE__ */ React14.createElement(Plus, { className: "size-4" }), " Add session")), isLoading ? /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:354:9", className: "space-y-3" }, [1, 2, 3].map((i) => /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:356:13", key: i, className: "h-16 rounded-lg bg-inset animate-pulse" }))) : items.length === 0 ? /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:360:9", className: "py-12 text-center text-secondary text-sm" }, 'No sessions yet. Click "Add session" to get started.') : /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:364:9", className: "space-y-2" }, items.map((item) => {
    const hasAudio = item.content_body?.startsWith("audio/");
    return /* @__PURE__ */ React14.createElement(
      "div",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:368:15",
        key: item.id,
        className: "flex items-center gap-3 rounded-lg border border-border bg-raised p-3"
      },
      /* @__PURE__ */ React14.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:372:17", className: "text-secondary flex-shrink-0" }, CATEGORY_ICONS[item.category]),
      /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:375:17", className: "flex-1 min-w-0" }, /* @__PURE__ */ React14.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:376:19", className: "text-sm font-medium text-primary truncate" }, item.title), /* @__PURE__ */ React14.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:379:19", className: "text-xs text-secondary capitalize" }, item.category.replace(/_/g, " "), item.is_preview && " \xB7 Free preview", item.duration_minutes && ` \xB7 ${item.duration_minutes} min`)),
      hasAudio ? /* @__PURE__ */ React14.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:386:19", className: "inline-flex items-center gap-1 rounded-full bg-success-weak px-2 py-0.5 text-xs font-medium text-success flex-shrink-0" }, /* @__PURE__ */ React14.createElement(Music, { className: "size-3" }), " Audio") : /* @__PURE__ */ React14.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:390:19", className: "inline-flex items-center rounded-full bg-inset px-2 py-0.5 text-xs text-secondary flex-shrink-0" }, "No audio"),
      /* @__PURE__ */ React14.createElement(
        Button,
        {
          size: "sm",
          variant: "ghost",
          isLoading: uploading === item.id,
          title: hasAudio ? "Replace audio" : "Upload audio",
          onClick: () => {
            setUploadTargetId(item.id);
            fileInputRef.current?.click();
          }
        },
        /* @__PURE__ */ React14.createElement(Upload, { className: "size-4" })
      ),
      /* @__PURE__ */ React14.createElement(
        Button,
        {
          size: "sm",
          variant: "ghost",
          onClick: () => openEdit(item)
        },
        /* @__PURE__ */ React14.createElement(Pencil, { className: "size-4" })
      ),
      /* @__PURE__ */ React14.createElement(
        Button,
        {
          size: "sm",
          variant: "ghost",
          isLoading: deleting === item.id,
          onClick: () => handleDelete(item.id)
        },
        /* @__PURE__ */ React14.createElement(Trash2, { className: "size-4" })
      )
    );
  })), /* @__PURE__ */ React14.createElement(
    "input",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:428:7",
      ref: fileInputRef,
      type: "file",
      accept: "audio/*",
      className: "hidden",
      onChange: (e) => {
        const file = e.target.files?.[0];
        if (file && uploadTargetId !== null)
          handleReplaceAudio(uploadTargetId, file);
        e.target.value = "";
      }
    }
  ), /* @__PURE__ */ React14.createElement(Dialog, { open, onOpenChange: setOpen }, /* @__PURE__ */ React14.createElement(DialogContent, { className: "sm:max-w-xl" }, /* @__PURE__ */ React14.createElement(DialogHeader, null, /* @__PURE__ */ React14.createElement(DialogTitle, null, editing ? "Edit session" : "Add new session")), /* @__PURE__ */ React14.createElement(
    ContentFormFields,
    {
      key: editing?.id ?? "new",
      initial: initialForm,
      onSave: handleSave,
      onCancel: () => setOpen(false),
      saving
    }
  ))));
}
function SubscribersTab() {
  const { data: subscribers = [], isLoading } = useQuery5({
    queryKey: ["admin-subscribers"],
    queryFn: () => fetch("/app-api/admin/subscribers").then((r) => r.json())
  });
  if (isLoading)
    return /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:468:12", className: "h-32 rounded-lg bg-inset animate-pulse mt-4" });
  return /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:471:5", className: "mt-4" }, /* @__PURE__ */ React14.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:472:7", className: "text-sm text-secondary mb-4" }, subscribers.length, " subscribers total"), subscribers.length === 0 ? /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:476:9", className: "py-12 text-center text-secondary text-sm" }, "No subscribers yet. Stripe integration coming soon.") : /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:480:9", className: "space-y-2" }, subscribers.map((sub) => /* @__PURE__ */ React14.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:482:13",
      key: sub.id,
      className: "flex items-center gap-3 rounded-lg border border-border bg-raised p-3"
    },
    /* @__PURE__ */ React14.createElement(Users, { className: "size-4 text-secondary flex-shrink-0" }),
    /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:487:15", className: "flex-1 min-w-0" }, /* @__PURE__ */ React14.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:488:17", className: "text-sm font-medium text-primary truncate" }, sub.user_email), /* @__PURE__ */ React14.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:491:17", className: "text-xs text-secondary" }, sub.plan_name ?? "No plan", " \xB7 Joined", " ", new Date(sub.created_at).toLocaleDateString("en-AU"))),
    /* @__PURE__ */ React14.createElement(
      "span",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:496:15",
        className: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sub.subscription_status === "active" ? "bg-success-weak text-success" : sub.subscription_status === "trialing" ? "bg-info-weak text-info" : "bg-inset text-secondary"}`
      },
      sub.subscription_status ?? "inactive"
    )
  ))));
}
function Admin() {
  return /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:517:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:518:7", className: "mx-auto max-w-[1200px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React14.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:519:9", className: "text-2xl font-semibold tracking-tight text-primary mb-2" }, "Admin"), /* @__PURE__ */ React14.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:522:9", className: "text-sm text-secondary mb-8" }, "Manage your content and subscribers."), /* @__PURE__ */ React14.createElement(Tabs, { defaultValue: "content" }, /* @__PURE__ */ React14.createElement(TabsList, null, /* @__PURE__ */ React14.createElement(TabsTrigger, { value: "content" }, "Content"), /* @__PURE__ */ React14.createElement(TabsTrigger, { value: "subscribers" }, "Subscribers")), /* @__PURE__ */ React14.createElement(TabsContent, { value: "content" }, /* @__PURE__ */ React14.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Admin.tsx:531:13", className: "pt-4" }, /* @__PURE__ */ React14.createElement(ContentTab, null))), /* @__PURE__ */ React14.createElement(TabsContent, { value: "subscribers" }, /* @__PURE__ */ React14.createElement(SubscribersTab, null)))));
}

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

// virtual:apps/spiritual-healing/client/pages/Affirmations.tsx
import React18, { useState as useState8 } from "react";
import { useQuery as useQuery7, useQueryClient as useQueryClient3 } from "@tanstack/react-query";
import { Heart as Heart5, Sparkles as Sparkles7, RefreshCw } from "lucide-react";
var AFFIRMATIONS = [
  "I am grounded, calm, and present.",
  "I release what no longer serves me.",
  "I trust the process of my healing.",
  "I am safe to feel and safe to grow.",
  "My inner world is becoming clearer every day.",
  "I honour my emotions without judgment.",
  "I am connected to my deepest truth.",
  "I allow peace to flow through my body and mind.",
  "I am worthy of rest, softness, and care.",
  "I choose thoughts that support my healing.",
  "I am open to receiving guidance and clarity.",
  "My energy is protected and grounded.",
  "I forgive myself for the moments I didn't know better.",
  "I am becoming the version of myself I am meant to be.",
  "I breathe in calm and exhale tension.",
  "I trust my intuition \u2014 it always leads me home.",
  "I am patient with my healing journey.",
  "I am loved, supported, and guided.",
  "I release fear and welcome inner peace.",
  "I am aligned with my purpose and truth."
];
function Affirmations() {
  const queryClient = useQueryClient3();
  const [dailyIndex, setDailyIndex] = useState8(
    () => Math.floor(Math.random() * AFFIRMATIONS.length)
  );
  const [togglingIndex, setTogglingIndex] = useState8(null);
  const [activeTab, setActiveTab] = useState8("all");
  const { data: favourites = [] } = useQuery7({
    queryKey: ["affirmation-favourites"],
    queryFn: () => fetch("/app-api/affirmations/favourites").then((r) => r.json())
  });
  const favouriteSet = new Set(favourites);
  async function toggleFavourite(index) {
    setTogglingIndex(index);
    try {
      if (favouriteSet.has(index)) {
        await fetch(`/app-api/affirmations/favourites/${index}`, {
          method: "DELETE"
        });
        toast("Removed from favourites");
      } else {
        await fetch("/app-api/affirmations/favourites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index })
        });
        toast.success("Added to favourites \u2661");
      }
      queryClient.invalidateQueries({ queryKey: ["affirmation-favourites"] });
    } catch {
      toast.error("Could not update favourites");
    } finally {
      setTogglingIndex(null);
    }
  }
  function newDailyAffirmation() {
    let next = Math.floor(Math.random() * AFFIRMATIONS.length);
    if (next === dailyIndex) next = (next + 1) % AFFIRMATIONS.length;
    setDailyIndex(next);
  }
  const displayedAffirmations = activeTab === "favourites" ? AFFIRMATIONS.map((a, i) => ({ text: a, index: i })).filter(
    ({ index }) => favouriteSet.has(index)
  ) : AFFIRMATIONS.map((a, i) => ({ text: a, index: i }));
  return /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:84:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:85:7", className: "mx-auto max-w-[700px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:87:9", className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:88:11", className: "inline-flex rounded-full bg-accent/10 p-3" }, /* @__PURE__ */ React18.createElement(Sparkles7, { className: "size-6 text-accent" })), /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:91:11" }, /* @__PURE__ */ React18.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:92:13", className: "text-2xl font-semibold tracking-tight text-primary" }, "Affirmations"), /* @__PURE__ */ React18.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:95:13", className: "text-xs text-secondary" }, "Gentle statements to guide you home"))), /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:102:9", className: "rounded-lg border border-border bg-raised p-5 mb-6" }, /* @__PURE__ */ React18.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:103:11", className: "text-sm text-secondary leading-relaxed" }, "Affirmations are gentle, intentional statements that help re-shape your inner dialogue and reconnect you with your inner strength. Use them daily \u2014 speak them aloud, repeat them during meditation, or hold them quietly in your heart. Each affirmation is designed to soften the mind, calm the nervous system, and guide you back to clarity, confidence, and emotional balance.")), /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:114:9", className: "rounded-lg border-2 border-accent bg-accent/5 p-6 mb-6 text-center" }, /* @__PURE__ */ React18.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:115:11", className: "text-xs text-accent uppercase tracking-wide font-semibold mb-3" }, "\u2728 Your Daily Affirmation"), /* @__PURE__ */ React18.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:118:11", className: "text-lg font-medium text-primary leading-relaxed mb-4" }, '"', AFFIRMATIONS[dailyIndex], '"'), /* @__PURE__ */ React18.createElement(Button, { variant: "secondary", size: "sm", onClick: newDailyAffirmation }, /* @__PURE__ */ React18.createElement(RefreshCw, { className: "size-4" }), " New affirmation")), /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:127:9", className: "flex gap-2 mb-4" }, /* @__PURE__ */ React18.createElement(
    "button",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:128:11",
      onClick: () => setActiveTab("all"),
      className: `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "all" ? "bg-accent text-accent-fg" : "bg-inset text-secondary hover:text-primary"}`
    },
    "All (",
    AFFIRMATIONS.length,
    ")"
  ), /* @__PURE__ */ React18.createElement(
    "button",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:138:11",
      onClick: () => setActiveTab("favourites"),
      className: `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === "favourites" ? "bg-accent text-accent-fg" : "bg-inset text-secondary hover:text-primary"}`
    },
    "\u2661 My Favourites (",
    favourites.length,
    ")"
  )), activeTab === "favourites" && favourites.length === 0 ? /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:152:11", className: "rounded-lg border border-border bg-raised p-8 text-center" }, /* @__PURE__ */ React18.createElement(Heart5, { className: "size-8 text-secondary mx-auto mb-3" }), /* @__PURE__ */ React18.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:154:13", className: "text-sm text-secondary" }, "No favourites yet."), /* @__PURE__ */ React18.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:155:13", className: "text-xs text-secondary mt-1" }, "Tap the heart next to any affirmation to save it here.")) : /* @__PURE__ */ React18.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:160:11", className: "space-y-2" }, displayedAffirmations.map(({ text, index }) => /* @__PURE__ */ React18.createElement(
    "div",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:162:15",
      key: index,
      className: "flex items-center gap-3 rounded-lg border border-border bg-raised p-4"
    },
    /* @__PURE__ */ React18.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:166:17", className: "flex-1 text-sm text-primary leading-relaxed" }, text),
    /* @__PURE__ */ React18.createElement(
      "button",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/Affirmations.tsx:169:17",
        onClick: () => toggleFavourite(index),
        disabled: togglingIndex === index,
        className: "flex-shrink-0 p-1.5 rounded-full hover:bg-inset transition-colors",
        title: favouriteSet.has(index) ? "Remove from favourites" : "Add to favourites"
      },
      /* @__PURE__ */ React18.createElement(
        Heart5,
        {
          className: `size-5 transition-colors ${favouriteSet.has(index) ? "fill-rose-400 text-rose-400" : "text-secondary"}`
        }
      )
    )
  )))));
}

// virtual:apps/spiritual-healing/client/pages/ChakraHealing.tsx
import React19, { useState as useState9 } from "react";
import { Heart as Heart6, ChevronRight as ChevronRight5 } from "lucide-react";
var CHAKRAS = [
  {
    name: "Root Chakra",
    sanskrit: "Muladhara",
    emoji: "\u{1F53B}",
    color: "bg-red-50 border-red-200",
    accent: "text-red-600",
    badge: "bg-red-100 text-red-700",
    description: "The Root Chakra is your foundation. It governs safety, stability, and your sense of belonging. When balanced, you feel grounded, supported, and connected to your body and the present moment.",
    affirmations: [
      "I am safe, supported, and grounded.",
      "I trust life and my place in it.",
      "I am rooted in strength and stability."
    ],
    practices: [
      "Walk barefoot on grass or earth",
      "Slow, deep belly breathing",
      "Decluttering your physical space",
      "Grounding visualisations (imagining roots growing from your feet)"
    ],
    imbalance: [
      "Feeling disconnected or unstable",
      "Difficulty relaxing",
      "Overwhelm or fear around basic needs"
    ]
  },
  {
    name: "Sacral Chakra",
    sanskrit: "Svadhisthana",
    emoji: "\u{1F7E0}",
    color: "bg-orange-50 border-orange-200",
    accent: "text-orange-600",
    badge: "bg-orange-100 text-orange-700",
    description: "The Sacral Chakra governs creativity, pleasure, emotional flow, and relationships. When balanced, you feel expressive, inspired, and open to joy.",
    affirmations: [
      "I honour my emotions and let them flow.",
      "I deserve pleasure, joy, and creativity.",
      "My energy moves with ease."
    ],
    practices: [
      "Creative expression (art, music, dance)",
      "Gentle hip-opening stretches",
      "Warm baths or water rituals",
      "Journaling emotional experiences"
    ],
    imbalance: [
      "Feeling creatively blocked",
      "Emotional numbness or overwhelm",
      "Difficulty connecting with pleasure"
    ]
  },
  {
    name: "Solar Plexus Chakra",
    sanskrit: "Manipura",
    emoji: "\u{1F7E1}",
    color: "bg-yellow-50 border-yellow-200",
    accent: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-800",
    description: "The Solar Plexus Chakra is your centre of confidence, personal power, and self-worth. When balanced, you feel capable, motivated, and aligned with your goals.",
    affirmations: [
      "I trust myself and my decisions.",
      "I am strong, confident, and empowered.",
      "I act with clarity and purpose."
    ],
    practices: [
      "Core-strengthening movements",
      "Setting small achievable goals",
      "Sunlight exposure",
      "Practising healthy boundaries"
    ],
    imbalance: [
      "Self-doubt or insecurity",
      "Difficulty taking action",
      "Feeling powerless or overly controlling"
    ]
  },
  {
    name: "Heart Chakra",
    sanskrit: "Anahata",
    emoji: "\u{1F49A}",
    color: "bg-green-50 border-green-200",
    accent: "text-green-700",
    badge: "bg-green-100 text-green-800",
    description: "The Heart Chakra governs love, compassion, forgiveness, and emotional openness. When balanced, you feel connected, empathetic, and able to give and receive love freely.",
    affirmations: [
      "I give and receive love with ease.",
      "My heart is open, safe, and supported.",
      "I choose compassion for myself and others."
    ],
    practices: [
      "Gratitude journaling",
      "Gentle chest-opening stretches",
      "Spending time with loved ones",
      "Acts of kindness"
    ],
    imbalance: [
      "Difficulty trusting or opening up",
      "Emotional heaviness",
      "Feeling disconnected from others"
    ]
  },
  {
    name: "Throat Chakra",
    sanskrit: "Vishuddha",
    emoji: "\u{1F535}",
    color: "bg-blue-50 border-blue-200",
    accent: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    description: "The Throat Chakra governs communication, truth, and self-expression. When balanced, you speak clearly, honestly, and confidently.",
    affirmations: [
      "I express myself with clarity and confidence.",
      "My voice matters.",
      "I speak my truth with love."
    ],
    practices: [
      "Singing or humming",
      "Honest conversations",
      "Drinking warm herbal teas",
      "Journaling your truth"
    ],
    imbalance: [
      "Difficulty expressing feelings",
      "Fear of speaking up",
      "Feeling unheard or misunderstood"
    ]
  },
  {
    name: "Third Eye Chakra",
    sanskrit: "Ajna",
    emoji: "\u{1F7E3}",
    color: "bg-purple-50 border-purple-200",
    accent: "text-purple-700",
    badge: "bg-purple-100 text-purple-800",
    description: "The Third Eye Chakra governs intuition, insight, and inner wisdom. When balanced, you see life clearly and trust your inner guidance.",
    affirmations: [
      "I trust my intuition.",
      "I see clearly with inner wisdom.",
      "My mind is calm, open, and aware."
    ],
    practices: [
      "Meditation",
      "Mindfulness and stillness",
      "Limiting overstimulation",
      "Visualisation exercises"
    ],
    imbalance: [
      "Difficulty making decisions",
      "Feeling mentally foggy",
      "Overthinking or confusion"
    ]
  },
  {
    name: "Crown Chakra",
    sanskrit: "Sahasrara",
    emoji: "\u{1F7EA}",
    color: "bg-violet-50 border-violet-200",
    accent: "text-violet-700",
    badge: "bg-violet-100 text-violet-800",
    description: "The Crown Chakra connects you to higher consciousness, purpose, and spiritual alignment. When balanced, you feel connected, peaceful, and guided.",
    affirmations: [
      "I am connected to something greater.",
      "I trust the wisdom of the universe.",
      "I am aligned with my highest self."
    ],
    practices: [
      "Quiet contemplation",
      "Prayer or spiritual reflection",
      "Spending time in nature",
      "Letting go of attachment to outcomes"
    ],
    imbalance: [
      "Feeling disconnected from purpose",
      "Lack of inspiration",
      "Feeling spiritually blocked"
    ]
  }
];
function ChakraCard({ chakra }) {
  const [open, setOpen] = useState9(false);
  return /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:193:5", className: `rounded-lg border ${chakra.color} overflow-hidden` }, /* @__PURE__ */ React19.createElement(
    "button",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:195:7",
      className: "w-full flex items-center gap-3 p-4 text-left",
      onClick: () => setOpen(!open)
    },
    /* @__PURE__ */ React19.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:199:9", className: "text-2xl flex-shrink-0" }, chakra.emoji),
    /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:200:9", className: "flex-1 min-w-0" }, /* @__PURE__ */ React19.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:201:11", className: `text-base font-semibold ${chakra.accent}` }, chakra.name), /* @__PURE__ */ React19.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:204:11", className: "text-xs text-secondary" }, chakra.sanskrit)),
    /* @__PURE__ */ React19.createElement(
      ChevronRight5,
      {
        className: `size-5 text-secondary flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`
      }
    )
  ), open && /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:212:9", className: "px-4 pb-5 space-y-4 border-t border-inherit" }, /* @__PURE__ */ React19.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:214:11", className: "text-sm text-secondary leading-relaxed pt-4" }, chakra.description), /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:219:11" }, /* @__PURE__ */ React19.createElement(
    "p",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:220:13",
      className: `text-xs font-semibold uppercase tracking-wide mb-2 ${chakra.accent}`
    },
    "Affirmations"
  ), /* @__PURE__ */ React19.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:225:13", className: "space-y-1.5" }, chakra.affirmations.map((a) => /* @__PURE__ */ React19.createElement(
    "li",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:227:17",
      key: a,
      className: "flex items-start gap-2 text-sm text-secondary"
    },
    /* @__PURE__ */ React19.createElement(
      Heart6,
      {
        className: `size-3.5 flex-shrink-0 mt-0.5 ${chakra.accent}`
      }
    ),
    a
  )))), /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:241:11" }, /* @__PURE__ */ React19.createElement(
    "p",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:242:13",
      className: `text-xs font-semibold uppercase tracking-wide mb-2 ${chakra.accent}`
    },
    "Healing Practices"
  ), /* @__PURE__ */ React19.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:247:13", className: "space-y-1.5" }, chakra.practices.map((p) => /* @__PURE__ */ React19.createElement(
    "li",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:249:17",
      key: p,
      className: "flex items-start gap-2 text-sm text-secondary"
    },
    /* @__PURE__ */ React19.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:253:19", className: `mt-0.5 flex-shrink-0 ${chakra.accent}` }, "\u2022"),
    p
  )))), /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:263:11" }, /* @__PURE__ */ React19.createElement(
    "p",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:264:13",
      className: `text-xs font-semibold uppercase tracking-wide mb-2 ${chakra.accent}`
    },
    "Signs of Imbalance"
  ), /* @__PURE__ */ React19.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:269:13", className: "space-y-1.5" }, chakra.imbalance.map((i) => /* @__PURE__ */ React19.createElement(
    "li",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:271:17",
      key: i,
      className: "flex items-start gap-2 text-sm text-secondary"
    },
    /* @__PURE__ */ React19.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:275:19", className: "mt-0.5 flex-shrink-0 text-secondary" }, "\u2022"),
    i
  ))))));
}
function ChakraHealing() {
  return /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:289:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:290:7", className: "mx-auto max-w-[700px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:292:9", className: "mb-6" }, /* @__PURE__ */ React19.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:293:11", className: "text-2xl font-semibold tracking-tight text-primary mb-1" }, "Chakra Healing"), /* @__PURE__ */ React19.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:296:11", className: "text-sm text-secondary" }, "Your body's subtle energy system")), /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:302:9", className: "rounded-lg border border-border bg-raised p-6 mb-6 space-y-3" }, /* @__PURE__ */ React19.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:303:11", className: "text-sm text-secondary leading-relaxed" }, "The chakra system is a map of the body's subtle energy. Each chakra represents a centre of emotional, physical, and spiritual influence, shaping how we feel, respond, and connect with the world."), /* @__PURE__ */ React19.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:308:11", className: "text-sm text-secondary leading-relaxed" }, "When our chakras are balanced, energy flows smoothly \u2014 we feel grounded, creative, confident, compassionate, expressive, intuitive, and connected."), /* @__PURE__ */ React19.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:313:11", className: "text-sm text-secondary leading-relaxed" }, "This section helps you explore each chakra, understand its purpose, and gently realign your energy through awareness, breath, and intention.")), /* @__PURE__ */ React19.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/ChakraHealing.tsx:321:9", className: "space-y-3" }, CHAKRAS.map((chakra) => /* @__PURE__ */ React19.createElement(ChakraCard, { key: chakra.name, chakra })))));
}

// virtual:apps/spiritual-healing/client/pages/Breathing.tsx
import React20, { useState as useState10 } from "react";
import { ChevronRight as ChevronRight6, Wind as Wind2 } from "lucide-react";
var TECHNIQUES = [
  {
    emoji: "\u{1F7E5}",
    name: "Box Breathing",
    subtitle: "4\u20134\u20134\u20134",
    color: "bg-red-50 border-red-200",
    accent: "text-red-700",
    description: "A simple, structured breathing pattern that calms the mind and stabilises the nervous system. Ideal for stress, overwhelm, or grounding.",
    steps: [
      "Inhale for 4 seconds",
      "Hold for 4 seconds",
      "Exhale for 4 seconds",
      "Hold for 4 seconds",
      "Repeat for 4\u20138 rounds."
    ],
    benefits: [
      "Reduces anxiety",
      "Improves focus",
      "Creates emotional steadiness"
    ]
  },
  {
    emoji: "\u{1F7E7}",
    name: "Wim Hof Breathing",
    subtitle: "Energising & activating",
    color: "bg-orange-50 border-orange-200",
    accent: "text-orange-700",
    description: "A powerful, energising breathwork method involving deep rhythmic breathing followed by breath retention. It activates the body, increases oxygen flow, and boosts mental clarity.",
    steps: [
      "Take 30\u201340 deep breaths (inhale fully, exhale naturally)",
      "After the final exhale, hold your breath until you feel the urge to breathe",
      "Inhale deeply and hold for 10\u201315 seconds",
      "Repeat 2\u20133 rounds."
    ],
    benefits: [
      "Increases energy",
      "Enhances focus",
      "Supports emotional release",
      "Strengthens mind\u2013body connection"
    ]
  },
  {
    emoji: "\u{1F7E8}",
    name: "Physiological Sigh",
    subtitle: "The Sigh",
    color: "bg-yellow-50 border-yellow-200",
    accent: "text-yellow-700",
    description: "A natural nervous-system reset used by the body to release tension. It's one of the fastest ways to reduce stress.",
    steps: [
      "Take one deep inhale",
      "Take a second, shorter inhale on top of it",
      "Exhale slowly and fully",
      "Repeat 3\u20135 times."
    ],
    benefits: [
      "Rapid stress reduction",
      "Calms the heart rate",
      "Releases emotional pressure"
    ]
  },
  {
    emoji: "\u{1F7E9}",
    name: "Coherent Breathing",
    subtitle: "5\u20135",
    color: "bg-green-50 border-green-200",
    accent: "text-green-700",
    description: "A smooth, even breathing pattern that synchronises heart and breath rhythms. Ideal for balance and emotional regulation.",
    steps: [
      "Inhale for 5 seconds",
      "Exhale for 5 seconds",
      "Continue for 2\u20135 minutes."
    ],
    benefits: [
      "Balances the nervous system",
      "Improves emotional clarity",
      "Supports long-term calm"
    ]
  },
  {
    emoji: "\u{1F7E6}",
    name: "Belly Breathing",
    subtitle: "Diaphragmatic",
    color: "bg-blue-50 border-blue-200",
    accent: "text-blue-700",
    description: "A grounding breath that activates the parasympathetic nervous system. Perfect for anxiety, overwhelm, or reconnecting with the body.",
    steps: [
      "Place a hand on your belly",
      "Inhale deeply into your lower abdomen",
      "Exhale slowly",
      "Repeat for 1\u20133 minutes."
    ],
    benefits: [
      "Reduces tension",
      "Grounds the body",
      "Supports emotional safety"
    ]
  },
  {
    emoji: "\u{1F7EA}",
    name: "Double Inhale + Long Exhale",
    subtitle: "Nervous System Reset",
    color: "bg-purple-50 border-purple-200",
    accent: "text-purple-700",
    description: "A quick reset breath that releases built-up stress and helps the body return to a calm baseline.",
    steps: [
      "Short inhale",
      "Second deeper inhale",
      "Long slow exhale",
      "Repeat 3\u20136 rounds."
    ],
    benefits: [
      "Clears emotional pressure",
      "Quickly calms the body",
      "Helps regulate overwhelm"
    ]
  },
  {
    emoji: "\u{1F7EB}",
    name: "4\u20137\u20138 Breathing",
    subtitle: "Deep relaxation",
    color: "bg-amber-50 border-amber-200",
    accent: "text-amber-800",
    description: "A soothing breath pattern that signals safety to the body and helps release tension.",
    steps: [
      "Inhale for 4 seconds",
      "Hold for 7 seconds",
      "Exhale for 8 seconds",
      "Repeat 4\u20136 rounds."
    ],
    benefits: ["Deep relaxation", "Supports sleep", "Reduces stress"]
  }
];
function TechniqueCard({ technique }) {
  const [open, setOpen] = useState10(false);
  return /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:148:5", className: `rounded-lg border ${technique.color} overflow-hidden` }, /* @__PURE__ */ React20.createElement(
    "button",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:149:7",
      className: "w-full flex items-center gap-3 p-4 text-left",
      onClick: () => setOpen(!open)
    },
    /* @__PURE__ */ React20.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:153:9", className: "text-2xl flex-shrink-0" }, technique.emoji),
    /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:154:9", className: "flex-1 min-w-0" }, /* @__PURE__ */ React20.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:155:11", className: `text-base font-semibold ${technique.accent}` }, technique.name), /* @__PURE__ */ React20.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:158:11", className: "text-xs text-secondary" }, technique.subtitle)),
    /* @__PURE__ */ React20.createElement(
      ChevronRight6,
      {
        className: `size-5 text-secondary flex-shrink-0 transition-transform ${open ? "rotate-90" : ""}`
      }
    )
  ), open && /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:166:9", className: "px-4 pb-5 space-y-4 border-t border-inherit" }, /* @__PURE__ */ React20.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:167:11", className: "text-sm text-secondary leading-relaxed pt-4" }, technique.description), /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:171:11" }, /* @__PURE__ */ React20.createElement(
    "p",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:172:13",
      className: `text-xs font-semibold uppercase tracking-wide mb-2 ${technique.accent}`
    },
    "How to Do It"
  ), /* @__PURE__ */ React20.createElement("ol", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:177:13", className: "space-y-1.5" }, technique.steps.map((step, i) => /* @__PURE__ */ React20.createElement(
    "li",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:179:17",
      key: i,
      className: "flex items-start gap-2 text-sm text-secondary"
    },
    /* @__PURE__ */ React20.createElement(
      "span",
      {
        "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:183:19",
        className: `font-semibold flex-shrink-0 ${technique.accent}`
      },
      i + 1,
      "."
    ),
    step
  )))), /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:194:11" }, /* @__PURE__ */ React20.createElement(
    "p",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:195:13",
      className: `text-xs font-semibold uppercase tracking-wide mb-2 ${technique.accent}`
    },
    "Benefits"
  ), /* @__PURE__ */ React20.createElement("ul", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:200:13", className: "space-y-1.5" }, technique.benefits.map((b) => /* @__PURE__ */ React20.createElement(
    "li",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:202:17",
      key: b,
      className: "flex items-start gap-2 text-sm text-secondary"
    },
    /* @__PURE__ */ React20.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:206:19", className: `flex-shrink-0 mt-0.5 ${technique.accent}` }, "\u2022"),
    b
  ))))));
}
function Breathing() {
  return /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:222:5", className: "min-h-dvh bg-background" }, /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:223:7", className: "mx-auto max-w-[700px] px-4 pt-8 pb-16" }, /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:225:9", className: "flex items-center gap-3 mb-4" }, /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:226:11", className: "inline-flex rounded-full bg-info-weak p-3" }, /* @__PURE__ */ React20.createElement(Wind2, { className: "size-6 text-info" })), /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:229:11" }, /* @__PURE__ */ React20.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:230:13", className: "text-2xl font-semibold tracking-tight text-primary" }, "Breathing"), /* @__PURE__ */ React20.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:233:13", className: "text-xs text-secondary" }, "Techniques for calm, clarity, and reset"))), /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:240:9", className: "rounded-lg border border-border bg-raised p-6 mb-6 space-y-3" }, /* @__PURE__ */ React20.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:241:11", className: "text-sm text-secondary leading-relaxed" }, "Breathwork is one of the fastest ways to calm the nervous system, release tension, and reconnect with your body."), /* @__PURE__ */ React20.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:245:11", className: "text-sm text-secondary leading-relaxed" }, "Each technique below offers a different effect \u2014 grounding, energising, balancing, or emotional release."), /* @__PURE__ */ React20.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:249:11", className: "text-sm text-secondary leading-relaxed" }, "Use these practices anytime you need clarity, calm, or a reset.")), /* @__PURE__ */ React20.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Breathing.tsx:255:9", className: "space-y-3" }, TECHNIQUES.map((t) => /* @__PURE__ */ React20.createElement(TechniqueCard, { key: t.name, technique: t })))));
}

// virtual:apps/spiritual-healing/client/pages/Booking.tsx
import React21 from "react";
import { CalendarClock as CalendarClock2, Video } from "lucide-react";
function Booking() {
  return /* @__PURE__ */ React21.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Booking.tsx:6:5", className: "min-h-dvh bg-background flex flex-col items-center justify-center px-4 text-center" }, /* @__PURE__ */ React21.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Booking.tsx:7:7", className: "inline-flex rounded-full bg-info-weak p-5 mb-6" }, /* @__PURE__ */ React21.createElement(CalendarClock2, { className: "size-10 text-info" })), /* @__PURE__ */ React21.createElement("h1", { "data-glide-source": "apps/spiritual-healing/client/pages/Booking.tsx:10:7", className: "text-3xl font-semibold text-primary mb-3" }, "Bookings"), /* @__PURE__ */ React21.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/pages/Booking.tsx:12:7", className: "inline-flex items-center gap-2 bg-accent/10 text-accent font-medium text-sm px-4 py-2 rounded-full mb-6" }, /* @__PURE__ */ React21.createElement(Video, { className: "size-4" }), "Zoom Sessions Only"), /* @__PURE__ */ React21.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Booking.tsx:17:7", className: "text-secondary max-w-sm mb-8" }, "All sessions are conducted via Zoom. Please book your session using the link below."), /* @__PURE__ */ React21.createElement(
    "a",
    {
      "data-glide-source": "apps/spiritual-healing/client/pages/Booking.tsx:22:7",
      href: "https://divine-healing-106774.square.site",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "inline-flex items-center gap-2 bg-accent text-white font-semibold px-8 py-4 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all text-base"
    },
    /* @__PURE__ */ React21.createElement(CalendarClock2, { className: "size-5" }),
    "Book a Zoom Session"
  ), /* @__PURE__ */ React21.createElement("p", { "data-glide-source": "apps/spiritual-healing/client/pages/Booking.tsx:32:7", className: "text-tertiary text-xs mt-6 max-w-xs" }, "You will be redirected to our secure booking page to choose your session type and preferred time."));
}

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

// virtual:apps/spiritual-healing/client/components/Nav.tsx
import React23, { useEffect as useEffect5, useState as useState12 } from "react";
import { Link as Link7, useLocation } from "react-router-dom";
import { cn as cn10 } from "@glide/cn";
function Nav({ items, layout = "top", className }) {
  const { pathname } = useLocation();
  const [faviconUrl, setFaviconUrl] = useState12(null);
  useEffect5(() => {
    const link = document.querySelector('link[rel="icon"]');
    setFaviconUrl(link?.href ?? null);
  }, []);
  if (items.length <= 1) return null;
  const title = document.title || null;
  const isActive = (href) => pathname === href || href !== "/" && pathname.startsWith(href + "/");
  const brand = /* @__PURE__ */ React23.createElement(
    Link7,
    {
      to: "/",
      className: "flex items-center gap-2 w-fit max-w-full outline-none focus-visible:ring-focus-ring/50 focus-visible:ring-[3px] rounded-md"
    },
    faviconUrl && /* @__PURE__ */ React23.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:60:9", className: "flex items-center justify-center overflow-hidden shrink-0 size-8 rounded-lg" }, /* @__PURE__ */ React23.createElement("img", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:61:11", src: faviconUrl, alt: "", className: "size-full object-cover" })),
    title && /* @__PURE__ */ React23.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:65:9", className: "text-base font-semibold text-primary truncate" }, title)
  );
  return /* @__PURE__ */ React23.createElement(React23.Fragment, null, layout === "top" ? (
    /* Desktop: sticky full-bleed top bar */
    /* @__PURE__ */ React23.createElement(
      "nav",
      {
        "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:76:9",
        "data-slot": "nav",
        className: cn10(
          "hidden md:block sticky top-0 z-50",
          "bg-raised/90 backdrop-blur supports-[backdrop-filter]:bg-raised/80",
          "shadow-sm",
          className
        )
      },
      /* @__PURE__ */ React23.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:85:11", className: "grid grid-cols-[minmax(14rem,1fr)_minmax(0,auto)_1fr] items-center gap-4 min-h-[4rem] px-4 mx-auto max-w-[1200px]" }, brand, /* @__PURE__ */ React23.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:87:13", className: "flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" }, items.map((item) => {
        const active = isActive(item.href);
        return /* @__PURE__ */ React23.createElement(
          Link7,
          {
            key: item.href,
            to: item.href,
            "aria-current": active ? "page" : void 0,
            className: cn10(
              "px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap",
              "transition-colors duration-150",
              "outline-none focus-visible:ring-focus-ring/50 focus-visible:ring-[3px]",
              active ? "bg-accent/10 text-accent" : "text-secondary hover:text-primary hover:bg-inset"
            )
          },
          item.label
        );
      })), /* @__PURE__ */ React23.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:109:13" }))
    )
  ) : (
    /* Desktop: fixed left sidebar — pages need md:pl-56 */
    /* @__PURE__ */ React23.createElement(
      "nav",
      {
        "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:114:9",
        "data-slot": "nav",
        className: cn10(
          "hidden md:flex flex-col fixed inset-y-0 left-0 z-50 w-56",
          "bg-raised border-r border-border",
          className
        )
      },
      /* @__PURE__ */ React23.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:122:11", className: "p-4" }, brand),
      /* @__PURE__ */ React23.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:123:11", className: "flex-1 overflow-y-auto px-3 pb-4" }, /* @__PURE__ */ React23.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:124:13", className: "flex flex-col gap-1" }, items.map((item) => {
        const active = isActive(item.href);
        return /* @__PURE__ */ React23.createElement(
          Link7,
          {
            key: item.href,
            to: item.href,
            "aria-current": active ? "page" : void 0,
            className: cn10(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
              "transition-colors duration-150",
              "outline-none focus-visible:ring-focus-ring/50 focus-visible:ring-[3px]",
              "[&_svg]:size-5 [&_svg]:shrink-0",
              active ? "bg-accent/10 text-accent" : "text-secondary hover:text-primary hover:bg-inset"
            )
          },
          item.icon,
          /* @__PURE__ */ React23.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:143:21", className: "truncate" }, item.label)
        );
      })))
    )
  ), /* @__PURE__ */ React23.createElement(
    "nav",
    {
      "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:153:7",
      "data-slot": "nav-mobile",
      className: cn10(
        // Sits 0.5rem up, or — where a safe-area inset exists (standalone
        // on home-indicator iPhones) — tucked to ~8px above the home
        // indicator (13px = its 5px bar + 8px below it), the geometry
        // native floating tab bars ship.
        "md:hidden fixed bottom-[max(0.5rem,env(safe-area-inset-bottom,0px)_-_13px)] left-1/2 -translate-x-1/2 z-50",
        "rounded-full bg-raised shadow-lg",
        "p-1 max-w-[calc(100%-16px)]"
      )
    },
    /* @__PURE__ */ React23.createElement("div", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:165:9", className: "flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" }, items.map((item) => {
      const active = isActive(item.href);
      return /* @__PURE__ */ React23.createElement(
        Link7,
        {
          key: item.href,
          to: item.href,
          "aria-current": active ? "page" : void 0,
          className: cn10(
            "flex flex-col items-center justify-center gap-0.5",
            "rounded-full px-3 py-1.5",
            "min-w-[64px] shrink-0",
            "text-[10px] font-medium",
            "transition-colors duration-150",
            "outline-none focus-visible:ring-focus-ring/50 focus-visible:ring-[3px]",
            "[&_svg]:size-6",
            active ? "bg-accent/10 text-accent" : "text-secondary hover:text-primary"
          )
        },
        item.icon,
        /* @__PURE__ */ React23.createElement("span", { "data-glide-source": "apps/spiritual-healing/client/components/Nav.tsx:187:17", className: "truncate" }, item.label)
      );
    }))
  ));
}
Nav.displayName = "Nav";

// virtual:apps/spiritual-healing/client/App.tsx
import {
  Home as HomeIcon,
  BookOpen as BookOpen3,
  User as User2,
  Shield
} from "lucide-react";
function App() {
  return /* @__PURE__ */ React24.createElement(BrowserRouter, null, /* @__PURE__ */ React24.createElement(
    Nav,
    {
      items: [
        { href: "/", label: "Home", icon: /* @__PURE__ */ React24.createElement(HomeIcon, null) },
        { href: "/library", label: "Library", icon: /* @__PURE__ */ React24.createElement(BookOpen3, null) },
        { href: "/profile", label: "Profile", icon: /* @__PURE__ */ React24.createElement(User2, null) },
        { href: "/admin", label: "Admin", icon: /* @__PURE__ */ React24.createElement(Shield, null) }
      ]
    }
  ), /* @__PURE__ */ React24.createElement(Toaster, null), /* @__PURE__ */ React24.createElement(Routes, null, /* @__PURE__ */ React24.createElement(Route, { path: "/", element: /* @__PURE__ */ React24.createElement(Home, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/library", element: /* @__PURE__ */ React24.createElement(Library, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/library/:category", element: /* @__PURE__ */ React24.createElement(Library, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/content/:id", element: /* @__PURE__ */ React24.createElement(ContentDetail, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/shadow-work/:id", element: /* @__PURE__ */ React24.createElement(ShadowWorkJourney, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/reiki/:id", element: /* @__PURE__ */ React24.createElement(ReikiJourney, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/manifestation", element: /* @__PURE__ */ React24.createElement(ManifestationJourney, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/affirmations", element: /* @__PURE__ */ React24.createElement(Affirmations, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/chakras", element: /* @__PURE__ */ React24.createElement(ChakraHealing, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/breathing", element: /* @__PURE__ */ React24.createElement(Breathing, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/profile", element: /* @__PURE__ */ React24.createElement(Profile, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/admin", element: /* @__PURE__ */ React24.createElement(Admin, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/booking", element: /* @__PURE__ */ React24.createElement(Booking, null) }), /* @__PURE__ */ React24.createElement(Route, { path: "/spiritual-awakening", element: /* @__PURE__ */ React24.createElement(SpiritualAwakening, null) })));
}

// virtual:apps/spiritual-healing/client/_glide-root.tsx
var rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Missing #root element");
}
createRoot(rootElement).render(mountGlideApp(/* @__PURE__ */ React25.createElement(App, null)));

  