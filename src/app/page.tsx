import { Features } from "@/components/sections/Features";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      <Features />
    </div>
  );
}
