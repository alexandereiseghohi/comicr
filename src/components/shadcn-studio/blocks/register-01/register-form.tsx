"use client";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      {/* Username */}
      <div className="space-y-1">
        <Label className="leading-5" htmlFor="username">
          Username*
        </Label>
        <Input id="username" placeholder="Enter your username" type="text" />
      </div>

      {/* Email */}
      <div className="space-y-1">
        <Label className="leading-5" htmlFor="userEmail">
          Email address*
        </Label>
        <Input id="userEmail" placeholder="Enter your email address" type="email" />
      </div>

      {/* Password */}
      <div className="w-full space-y-1">
        <Label className="leading-5" htmlFor="password">
          Password*
        </Label>
        <div className="relative">
          <Input
            className="pe-9"
            id="password"
            placeholder="••••••••••••••••"
            type={isPasswordVisible ? "text" : "password"}
          />
          <Button
            className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 end-0 rounded-s-none hover:bg-transparent"
            onClick={() => setIsPasswordVisible((prevState) => !prevState)}
            size="icon"
            variant="ghost"
          >
            {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className="sr-only">{isPasswordVisible ? "Hide password" : "Show password"}</span>
          </Button>
        </div>
      </div>

      {/* Confirm Password */}
      <div className="w-full space-y-1">
        <Label className="leading-5" htmlFor="confirmPassword">
          Confirm Password*
        </Label>
        <div className="relative">
          <Input
            className="pe-9"
            id="confirmPassword"
            placeholder="••••••••••••••••"
            type={isConfirmPasswordVisible ? "text" : "password"}
          />
          <Button
            className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 end-0 rounded-s-none hover:bg-transparent"
            onClick={() => setIsConfirmPasswordVisible((prevState) => !prevState)}
            size="icon"
            variant="ghost"
          >
            {isConfirmPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            <span className="sr-only">{isConfirmPasswordVisible ? "Hide password" : "Show password"}</span>
          </Button>
        </div>
      </div>

      {/* Privacy policy */}
      <div className="flex items-center gap-3">
        <Checkbox className="size-6" id="rememberMe" />
        <Label htmlFor="rememberMe">
          <span className="text-muted-foreground">I agree to</span> <a href="#">privacy policy & terms</a>
        </Label>
      </div>

      <Button className="w-full" type="submit">
        Sign Up to Shadcn Studio
      </Button>
    </form>
  );
};

export default RegisterForm;
