import { HeroGeometric } from "./components/ui/shape-landing-hero";

export default function Landing() {

  return (
    <div className="w-full h-full">
      <HeroGeometric
        badge="mintbill"
        title1="Rapid Invoices for Any Purpose."
        title2="Fresh. Simple. Invoices."
      />
    </div>
  );
}
