
import { HSocialLogo } from "./HSocialLogo";

export const Logo = () => (
  <div className="hidden md:flex justify-center my-6">
    <div className="relative p-3 bg-gradient-to-br from-primary via-primary to-primary/80 rounded-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-3 shadow-lg hover:shadow-xl group">
      <HSocialLogo size="sm" />
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-2xl blur-lg -z-10 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl" />
    </div>
  </div>
);
