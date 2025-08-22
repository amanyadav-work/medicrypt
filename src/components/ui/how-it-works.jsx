"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, QrCode, Scan, Shield, Bell } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <Upload className="h-8 w-8 text-primary-background" />,
      step: "01",
      title: "Upload Records",
      description:
        "Securely upload your medical documents, lab results, and imaging files with automatic encryption.",
    },
    {
      icon: <QrCode className="h-8 w-8 text-primary-background" />,
      step: "02",
      title: "Generate QR Code",
      description:
        "Create a time-limited QR code with specific access permissions for your healthcare provider.",
    },
    {
      icon: <Scan className="h-8 w-8 text-primary-background" />,
      step: "03",
      title: "Provider Scans",
      description:
        "Doctor scans the QR code to instantly access your records during consultation or treatment.",
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-background" />,
      step: "04",
      title: "Secure Access",
      description:
        "Records are decrypted and displayed securely, with all actions logged for your audit trail.",
    },
    {
      icon: <Bell className="h-8 w-8 text-primary-background" />,
      step: "05",
      title: "Get Notified",
      description:
        "Receive instant notifications when your records are accessed, including timestamp and provider details.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="my-container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            How HealthLock
            <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 
              dark:from-lime-400 dark:via-green-400 dark:to-emerald-300 
              bg-clip-text text-transparent">
              {" "}Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Simple, secure sharing in 5 easy steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
  {steps.map((step, index) => (
    <Card
      key={index}
      className="text-center relative group transition-all duration-300
                 rounded-2xl border bg-card
                 hover:shadow-lg hover:shadow-green-500/30"
    >
      <CardHeader className="pb-4">
        <div
          className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 
                     dark:from-lime-400 dark:via-green-400 dark:to-emerald-300 
                     w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4
                     transition-transform duration-300 group-hover:scale-105"
        >
          {step.icon}
        </div>
        <div className="text-sm font-mono text-primary font-bold mb-2">
          {step.step}
        </div>
        <CardTitle className="text-lg text-foreground">{step.title}</CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription className="text-muted-foreground text-sm leading-relaxed">
          {step.description}
        </CardDescription>
      </CardContent>

      {/* Connector line */}
      {index < steps.length - 1 && (
        <div className="hidden xl:block absolute top-1/2 -right-3 w-6 h-0.5 
                        bg-gradient-to-r from-green-400/50 to-transparent
                        transform -translate-y-1/2 z-10"></div>
      )}
    </Card>
  ))}
        </div>
      </div>
    </section>
  );
}
