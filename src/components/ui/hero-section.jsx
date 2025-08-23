import { Button } from "@/components/ui/button";
import { Shield, QrCode, Clock, Users, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Badge } from "./badge";
import Link from "next/link";

const HeroSection = () => {
    return (
        <section className="relative pt-30 overflow-hidden bg-gradient-to-br from-background via-muted/30 to-secondary/20 pb-16">
            <div className="my-container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-fade-up">
                        <Badge variant="outline">
                            ✨ Check Out Our Newest Feature
                            <ArrowUpRight className="ml-2 size-4" />
                        </Badge>
                        <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                            Secure Patient Record with
                            <span className="bg-gradient-to-r 
                 from-green-500 via-emerald-500 to-teal-500 
                 dark:from-lime-400 dark:via-green-400 dark:to-emerald-300
                 bg-clip-text text-transparent font-bold drop-shadow-sm">
                                {" "}MediCrypt Easily
                            </span>
                        </h1>
                        <p className="text-md text-muted-foreground mb-8 leading-relaxed">
                            Share medical records securely with healthcare providers using
                            temporary QR codes and end-to-end encryption. Complete control
                            over who accesses your health data.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mb-12">
                            <Link href="/login"><Button
                                size="lg"
                                className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500
                                dark:from-green-400 dark:via-emerald-400 dark:to-teal-400
                                hover:opacity-90 shadow-md shadow-emerald-300/20 font-medium"
                            >
                                Start Sharing Securely
                            </Button>
                            </Link>

                            <Link href="/login">
                                <Button variant="outline" size="lg" className="border-2">
                                    Watch Demo
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                            <div className="text-center">
                                <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
                                <div className="text-sm font-medium text-foreground">End-to-End</div>
                                <div className="text-xs text-muted-foreground">Encryption</div>
                            </div>
                            <div className="text-center">
                                <QrCode className="h-8 w-8 text-primary mx-auto mb-2" />
                                <div className="text-sm font-medium text-foreground">QR Code</div>
                                <div className="text-xs text-muted-foreground">Access</div>
                            </div>
                            <div className="text-center">
                                <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                                <div className="text-sm font-medium text-foreground">Temporary</div>
                                <div className="text-xs text-muted-foreground">Sharing</div>
                            </div>
                            <div className="text-center">
                                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                                <div className="text-sm font-medium text-foreground">Role-Based</div>
                                <div className="text-xs text-muted-foreground">Access</div>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full h-[500px]">
                        <Image
                            src="/images/hero2.jpg"
                            alt="Secure medical record sharing interface"
                            fill
                            className="rounded-2xl shadow-card object-cover"
                        />
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HeroSection;
