import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, QrCode, Users, FileText, Clock, Eye } from "lucide-react";

const FeaturesSection = () => {
    const features = [
        {
            icon: <Shield className="h-10 w-10" />,
            title: "End-to-End Encryption",
            description: "Military-grade encryption ensures your medical data remains completely private and secure during storage and transmission.",
            gradient: "from-green-500 via-emerald-500 to-teal-500 dark:from-lime-400 dark:via-green-400 dark:to-emerald-300"
        }
        ,
        {
            icon: <QrCode className="h-10 w-10" />,
            title: "QR Code Sharing",
            description: "Generate secure, temporary QR codes for instant access. No more physical documents or insecure email attachments.",
            gradient: "from-green-500 via-emerald-500 to-teal-500 dark:from-lime-400 dark:via-green-400 dark:to-emerald-300"
        },
        {
            icon: <Users className="h-10 w-10" />,
            title: "Role-Based Access Control",
            description: "Grant different access levels - full access for doctors, partial for pharmacists, read-only for diagnostics.",
            gradient: "from-green-500 via-emerald-500 to-teal-500 dark:from-lime-400 dark:via-green-400 dark:to-emerald-300"
        },
        {
            icon: <Clock className="h-10 w-10 " />,
            title: "Temporary Access",
            description: "Set expiration times for shared records. Access automatically revokes after the specified duration.",
            gradient: "from-green-500 via-emerald-500 to-teal-500 dark:from-lime-400 dark:via-green-400 dark:to-emerald-300"
        },
        {
            icon: <Eye className="h-10 w-10" />,
            title: "Complete Audit Trail",
            description: "Track every access with timestamps, user identity, and actions taken. Full transparency and accountability.",
            gradient: "from-green-500 via-emerald-500 to-teal-500 dark:from-lime-400 dark:via-green-400 dark:to-emerald-300"
        },
        {
            icon: <FileText className="h-10 w-10" />,
            title: "Multiple File Types",
            description: "Upload PDFs, medical images, lab reports, and more. Organize all your health data in one secure location.",
            gradient: "from-green-500 via-emerald-500 to-teal-500 dark:from-lime-400 dark:via-green-400 dark:to-emerald-300"
        }
    ];

    return (
        <section id="features" className="py-10 bg-muted/30">
            <div className="my-container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
                        Built for Healthcare
                        <span className="bg-gradient-to-r 
                 from-green-500 via-emerald-500 to-teal-500 
                 dark:from-lime-400 dark:via-green-400 dark:to-emerald-300
                 bg-clip-text text-transparent font-bold drop-shadow-sm">
                            {" "}Security
                        </span>

                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Every feature designed with privacy, security, and healthcare compliance in mind
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="group hover:shadow-card transition-all duration-300 border-border/50 hover:border-primary/20"
                        >
                            <CardHeader>
                                <div
                                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:animate-glow`}
                                >
                                    {feature.icon}
                                </div>
                                <CardTitle className="text-xl text-foreground">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;
