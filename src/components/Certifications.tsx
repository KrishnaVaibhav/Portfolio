import { Award, Shield, CheckCircle2 } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { on } from "events";

const certifications = [
  {
    title: "Microsoft Certified: Azure Developer Associate",
    issuer: "Microsoft",
    code: "AZ-204",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
    description: "Expert in developing cloud solutions on Microsoft Azure platform",
    CredentialURL: "https://learn.microsoft.com/api/credentials/share/en-us/KrishnaVaibhav/D4B8C34A386E99D6?sharingId=E00486C99D01BA6",
  },
  {
    title: "AWS Certified Developer - Associate",
    issuer: "Amazon Web Services",
    code: "DVA-C02",
    icon: Award,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    borderColor: "border-secondary/30",
    description: "Proficient in developing and deploying applications on AWS",
    CredentialURL: "https://cp.certmetrics.com/amazon/en/public/verify/credential/392466d9b23b457e8a7cf0fc0d992be8",
  },
  {
    title: "ServiceNow Certified Administrator",
    issuer: "ServiceNow",
    code: "CSA",
    icon: CheckCircle2,
    color: "text-accent",
    bgColor: "bg-accent/10",
    borderColor: "border-accent/30",
    description: "Skilled in ServiceNow platform administration and configuration",
    CredentialURL: "https://www.servicenow.com/products/certification.html",
  },
];

const achievements = [
  "Zero-downtime deployments with Docker + CI/CD at Cognizant",
  "Delivered SDLC workshops for undergraduate students",
  "Guided students in secure, cloud-ready application development",
  "Achieved 99.5% SLA uptime across distributed workloads",
];

export const Certifications = () => {
  return (
    <section id="certifications" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Certifications & Achievements
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Industry-recognized credentials and professional accomplishments
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {certifications.map((cert, idx) => {
            const Icon = cert.icon;
            return (
              <Card
                key={idx}
                className={`group p-6 bg-card/80 backdrop-blur-sm border-2 ${cert.borderColor} hover:border-opacity-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fade-in`}
                onClick={() => window.open(cert.CredentialURL, "_blank")} style={{ cursor: 'pointer' }}
              >
                <div className={`w-16 h-16 ${cert.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 ${cert.color}`} />
                </div>
                
                <Badge
                  className={`mb-3 ${cert.bgColor} ${cert.color} border-0`}
                >
                  {cert.code}
                </Badge>
                
                <h3 className="text-lg font-bold text-foreground mb-2 leading-tight">
                  {cert.title}
                </h3>
                
                <p className="text-sm text-primary font-semibold mb-3">
                  {cert.issuer}
                </p>
                
                <p className="text-sm text-muted-foreground">
                  {cert.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Achievements Section */}
        <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              Key Achievements
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{achievement}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};
