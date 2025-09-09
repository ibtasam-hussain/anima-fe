import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { SocialLoginButtons } from "./SocialLoginButtons";
import biomeLogoImage from "@/assets/biome-logo.png";

export const SignupForm = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Branding */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={biomeLogoImage} 
              alt="The Biome Learning Center Logo" 
              className="h-16 w-16"
            />
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            The Biome Learning Center
          </h1>
        </div>

        {/* Main Heading */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-foreground">
            Signup to Your Account
          </h2>
          <p className="text-muted-foreground">
            Vorem ipsum dolor sit amet, consectetur adipiscing elit. Vorem ipsum dolor 
            sit amet, consectetur adipiscing elit.
          </p>
        </div>

        {/* Signup Form */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="sr-only">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="First Name"
                type="text"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="sr-only">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Last name"
                type="text"
                className="h-12"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">
                Email Address
              </Label>
              <Input
                id="email"
                placeholder="Email Address"
                type="email"
                className="h-12"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                placeholder="Password"
                type="password"
                className="h-12"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            Signup to Your Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        {/* Social Login */}
        <SocialLoginButtons />

        {/* Footer Links */}
        <div className="text-center space-x-4 text-sm text-muted-foreground">
          <a 
            href="#" 
            className="hover:text-foreground transition-colors"
          >
            Terms and conditions
          </a>
          <span>•</span>
          <a 
            href="#" 
            className="hover:text-foreground transition-colors"
          >
            Privacy policy
          </a>
        </div>
      </div>
    </div>
  );
};