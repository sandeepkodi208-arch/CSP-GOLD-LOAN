import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Coins,
  Gem,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { Btn } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shree Gold Finance | Gold Loans Made Simple" },
      {
        name: "description",
        content:
          "Professional gold loan solutions with transparent valuations, fast approvals, and secure EMI management.",
      },
      { property: "og:title", content: "Shree Gold Finance" },
      {
        property: "og:description",
        content: "Gold-backed financing that helps families and businesses unlock value from their jewellery and ornaments.",
      },
    ],
  }),
  component: HomePage,
});

const advantages = [
  "Transparent gold valuation",
  "Fast branch approval",
  "Flexible EMI options",
  "Secure data handling",
];

const services = [
  {
    icon: Gem,
    title: "Gold Loan Against Jewellery",
    text: "Unlock the value of your ornaments with easy-to-understand rates and simple documentation.",
  },
  {
    icon: Coins,
    title: "Purity-Based Appraisal",
    text: "Precise valuation based on 18K, 20K, 22K and 24K purity with live market benchmark rates.",
  },
  {
    icon: Wallet,
    title: "EMI & Repayment Support",
    text: "Manage repayments with clear due schedules, collection tracking, and overdue alerts.",
  },
];

const steps = [
  { title: "Submit Details", text: "Share the ornament details and customer profile." },
  { title: "Appraise Gold", text: "Our team evaluates purity, weight, and current market value." },
  { title: "Sanction Loan", text: "Get a competitive loan amount with transparent terms." },
  { title: "Disburse & Track", text: "Receive funds quickly and monitor EMIs in one place." },
];

const stats = [
  { label: "Happy customers", value: "12.5k+" },
  { label: "Loans sanctioned", value: "₹1.2B+" },
  { label: "Average approval", value: "24 hrs" },
  { label: "Repeat borrowers", value: "92%" },
];

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-gold text-gold-foreground shadow-sm">
              <Gem className="size-5" />
            </span>
            <div>
              <p className="font-display text-lg leading-none">Shree Gold Finance</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Gold Loan Experts</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#services" className="hover:text-foreground">Services</a>
            <a href="#process" className="hover:text-foreground">Process</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-medium text-foreground md:inline-flex">
              Admin Login
            </Link>
            <Link to="/login">
              <Btn className="px-4 py-2">Apply Now</Btn>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(210,168,86,0.18),_transparent_38%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="size-3.5 text-gold" />
                Trusted by 12,500+ families
              </span>
              <h1 className="max-w-xl font-display text-4xl leading-tight text-foreground md:text-5xl lg:text-6xl">
                Gold loans designed for speed, trust, and growth.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Unlock liquidity from your gold with transparent pricing, fast sanctions, and secure
                loan management for personal and business needs.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/login">
                  <Btn className="gap-2 px-5 py-3 text-base">
                    Get Started <ArrowRight className="size-4" />
                  </Btn>
                </Link>
                <a href="#contact">
                  <Btn variant="outline" className="px-5 py-3 text-base">
                    Talk to Advisor
                  </Btn>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {advantages.map((point) => (
                  <div key={point} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
                    <BadgeCheck className="size-4 text-success" />
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[2rem] border border-border bg-card p-4 shadow-panel">
                <div className="rounded-[1.5rem] bg-primary p-6 text-primary-foreground">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-primary-foreground/75">Live gold rate</p>
                      <p className="mt-2 font-display text-3xl">₹7,420 / g</p>
                    </div>
                    <div className="rounded-full bg-white/10 p-3">
                      <TrendingUp className="size-6" />
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase text-primary-foreground/75">Loan to value</p>
                      <p className="mt-2 text-2xl font-semibold">75%</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-xs uppercase text-primary-foreground/75">Processing</p>
                      <p className="mt-2 text-2xl font-semibold">24 hrs</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border bg-muted p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Eligible amount</p>
                    <p className="mt-2 font-display text-3xl">₹3.5L</p>
                  </div>
                  <div className="rounded-2xl border border-border bg-muted p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Monthly EMI</p>
                    <p className="mt-2 font-display text-3xl">₹18.2K</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-background p-5 text-center">
                <p className="font-display text-3xl text-foreground">{stat.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-panel">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">About us</p>
              <h2 className="mt-4 font-display text-4xl">Built on trust, clarity, and customer-first lending.</h2>
              <p className="mt-5 text-muted-foreground">
                We help individuals and businesses unlock the value of gold without disturbing their long-term plans.
                Our team combines finance discipline with simple, transparent processes so every customer knows what to expect.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Transparent valuation and fair pricing",
                  "Dedicated support from application to closure",
                  "Strong branch-level compliance and privacy standards",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 text-success" />
                    <span className="text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
                <Building2 className="size-10 text-gold" />
                <h3 className="mt-5 font-display text-2xl">Branch-backed support</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  From documentation to disbursement, our branch teams guide each customer with clarity.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
                <Users className="size-10 text-gold" />
                <h3 className="mt-5 font-display text-2xl">Customer-first approach</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  We combine financial expertise with a respectful, personal service model.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-panel sm:col-span-2">
                <Clock3 className="size-10 text-gold" />
                <h3 className="mt-5 font-display text-2xl">Fast turnaround</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quick appraisal, quick decisioning, and faster access to funds when you need them most.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="bg-muted/40 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Our services</p>
              <h2 className="mt-4 font-display text-4xl">Finance solutions built around your gold assets.</h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {services.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-border bg-card p-6 shadow-panel">
                  <span className="grid size-12 place-items-center rounded-xl bg-gold-soft text-gold-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl">{title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
            <h2 className="mt-4 font-display text-4xl">A simple four-step journey.</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-6 shadow-panel">
                <div className="mb-5 inline-flex size-10 items-center justify-center rounded-full bg-gold text-sm font-semibold text-gold-foreground">
                  {index + 1}
                </div>
                <h3 className="font-display text-2xl">{step.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8 lg:py-20">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground/75">Why choose us</p>
              <h2 className="mt-4 font-display text-4xl">Smart funding backed by gold value and clear terms.</h2>
            </div>
            <div className="flex items-center">
              <Link to="/login">
                <Btn variant="gold" className="px-6 py-3 text-base text-primary-foreground">
                  Start Your Application
                </Btn>
              </Link>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-panel">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Contact</p>
              <h2 className="mt-4 font-display text-4xl">Let’s help you unlock the value of gold.</h2>
              <div className="mt-8 space-y-5 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Branch office</p>
                  <p>45, Market Road, Chennai, Tamil Nadu</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Call us</p>
                  <p>+91 98765 43210</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <p>support@shreegoldfinance.in</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-card p-8 shadow-panel">
              <form className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Full name</label>
                    <input className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Phone</label>
                    <input className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" placeholder="Mobile number" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email</label>
                  <input type="email" className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Loan requirement</label>
                  <textarea className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30" placeholder="Tell us about your loan requirement" />
                </div>
                <Btn type="button" className="w-full sm:w-auto">Submit Enquiry</Btn>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-gold text-gold-foreground">
              <Gem className="size-4" />
            </span>
            <span>© 2026 Shree Gold Finance</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="#about" className="hover:text-foreground">About</a>
            <a href="#services" className="hover:text-foreground">Services</a>
            <a href="#contact" className="hover:text-foreground">Contact</a>
            <Link to="/login" className="hover:text-foreground">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
