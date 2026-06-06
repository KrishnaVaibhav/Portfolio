import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Center, Text } from "@react-three/drei";
import * as THREE from "three";
import { Card } from "@/components/ui/card";



export const Education = () => {
  const education = [
    {
      degree: "Master of Applied Computer Science",
      university: "Dalhousie University",
      period: "2023 - 2025",
      gpa: "3.9/4.0",
      letter: "DU",
      color: "#fdf91cff"
    },
    {
      degree: "Bachelor of Engineering in Computer Science (Honours in Information Security)",
      university: "Chandigarh University",
      period: "2018 - 2022",
      gpa: "3.6/4.0",
      letter: "CU",
      color: "#da1111ff"
    }
  ];

  return (
    <section id="education" className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
          Education
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {education.map((edu, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-foreground mb-2">{edu.degree}</h3>
              <p className="text-primary font-semibold mb-2">{edu.university}</p>
              <div className="flex justify-between text-muted-foreground text-sm">
                <span>{edu.period}</span>
                <span className="font-semibold">GPA: {edu.gpa}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
