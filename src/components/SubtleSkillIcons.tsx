import { Code2, Cloud, Database, Server, Smartphone, Coffee, Box, Layers, Cpu, Globe } from "lucide-react";

const skillIcons = [
  { Icon: Code2, position: "top-[10%] left-[5%]", delay: "0s", color: "text-primary/20" },
  { Icon: Smartphone, position: "top-[25%] right-[8%]", delay: "0.5s", color: "text-accent/20" },
  { Icon: Cloud, position: "top-[40%] left-[10%]", delay: "1s", color: "text-secondary/20" },
  { Icon: Database, position: "top-[55%] right-[12%]", delay: "1.5s", color: "text-primary/20" },
  { Icon: Server, position: "top-[70%] left-[7%]", delay: "2s", color: "text-accent/20" },
  { Icon: Coffee, position: "top-[15%] right-[15%]", delay: "2.5s", color: "text-secondary/20" },
  { Icon: Box, position: "top-[85%] right-[5%]", delay: "3s", color: "text-primary/20" },
  { Icon: Layers, position: "top-[32%] left-[15%]", delay: "0.8s", color: "text-accent/20" },
  { Icon: Cpu, position: "top-[62%] right-[18%]", delay: "1.2s", color: "text-secondary/20" },
  { Icon: Globe, position: "top-[78%] left-[12%]", delay: "1.8s", color: "text-primary/20" },
];

export const SubtleSkillIcons = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {skillIcons.map((skill, idx) => {
        const Icon = skill.Icon;
        return (
          <div
            key={idx}
            className={`absolute ${skill.position} ${skill.color} opacity-0 animate-fade-in`}
            style={{
              animationDelay: skill.delay,
              animationFillMode: "forwards",
            }}
          >
            <Icon className="w-8 h-8 md:w-12 md:h-12 animate-float-slow" />
          </div>
        );
      })}
    </div>
  );
};
