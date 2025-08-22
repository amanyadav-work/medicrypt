"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowRight, Users, Clock } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="my-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Ready to Secure Your
            <span className="bg-gradient-to-r 
                 from-green-500 via-emerald-500 to-teal-500 
                 dark:from-lime-400 dark:via-green-400 dark:to-emerald-300
                 bg-clip-text text-transparent font-bold drop-shadow-sm">
                {" "}Health Data?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join thousands of patients and healthcare providers who trust HealthLock 
            for secure medical record sharing
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 
                 dark:from-green-300 dark:via-emerald-300 dark:to-teal-300
                 text-white hover:opacity-90 shadow-md shadow-emerald-400/20 font-medium"
            >
            Start Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="border-2">
              Schedule Demo
            </Button>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center p-6 hover:shadow-card transition-all duration-300">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">10,000+</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Patients using HealthLock daily</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-card transition-all duration-300">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">99.9%</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Security uptime guaranteed</CardDescription>
            </CardContent>
          </Card>
          
          <Card className="text-center p-6 hover:shadow-card transition-all duration-300">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">&lt; 30s</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Average sharing time</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
