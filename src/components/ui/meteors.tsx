import { cn } from "@/lib/utils";

interface MeteorsProps {
  number?: number;
  className?: string;
  glowColor?: string;
  speedVariance?: boolean;
}

export const Meteors = ({ number = 20, className, glowColor = "white", speedVariance = true }: MeteorsProps) => {
  const meteors = new Array(number).fill(true);
  const stars = new Array(Math.floor(number * 0.3)).fill(true); // 30% stars
  
  return (
    <>
      {/* Meteors */}
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-0.5 w-0.5 rounded-[9999px] rotate-[215deg]",
            glowColor === "white" 
              ? "bg-white/70 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              : "bg-slate-500 shadow-[0_0_0_1px_#ffffff10]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px]",
            glowColor === "white"
              ? "before:bg-gradient-to-r before:from-white/50 before:to-transparent"
              : "before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: speedVariance 
              ? Math.floor(Math.random() * (12 - 6) + 6) + "s"
              : Math.floor(Math.random() * (10 - 2) + 2) + "s",
          }}
        ></span>
      ))}
      
      {/* Stars */}
      {stars.map((el, idx) => (
        <span
          key={"star" + idx}
          className={cn(
            "absolute w-1 h-1 rounded-full animate-pulse",
            glowColor === "white" 
              ? "bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              : "bg-slate-400/60",
            className
          )}
          style={{
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            animationDelay: Math.random() * 2 + "s",
            animationDuration: (Math.random() * 2 + 2) + "s",
          }}
        ></span>
      ))}
    </>
  );
};