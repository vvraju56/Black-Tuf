import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { Hero } from "@/components/home/hero";
import { HomeSections } from "@/components/home/home-sections";
import { BackToTop } from "@/components/home/back-to-top";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <HomeSections />
      </main>
      <SiteFooter />
      <BackToTop />
    </>
  );
}
