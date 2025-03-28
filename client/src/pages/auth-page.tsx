import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { registerSchema, loginSchema, InsertUser } from "@shared/schema";
import { Redirect } from "wouter";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewType = "login" | "register";

const AuthPage = () => {
  const [view, setView] = useState<ViewType>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  
  const isLogin = view === "login";
  
  // Form definition for login
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Form definition for registration
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      phone: "",
      location: "",
      userType: "farmer", // default to farmer
    },
  });
  
  // Handle login submission
  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };
  
  // Handle registration submission
  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    // Remove confirmPassword as it's not in the InsertUser type
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData as InsertUser);
  };
  
  // Redirect if already logged in
  if (user) {
    return <Redirect to={user.userType === "farmer" ? "/farmer-dashboard" : "/buyer-dashboard"} />;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100">
      <div className="container grid lg:grid-cols-2 gap-6 px-4 max-w-6xl">
        {/* Left column - Form */}
        <Card className="w-full shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <h1 className="font-bold text-3xl text-primary flex items-center justify-center">
                <Sprout className="mr-2" /> AgriConnect
              </h1>
              <p className="text-neutral-600 mt-2">
                {isLogin ? "Sign in to your account" : "Create your account"}
              </p>
            </div>
            
            {isLogin ? (
              // Login Form
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mb-6">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              // Registration Form
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <FormField
                    control={registerForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="name@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+91 9876543210" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={registerForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, State" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Choose a username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={registerForm.control}
                    name="userType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>I am signing up as:</FormLabel>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div 
                            className={cn(
                              "border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors text-center",
                              field.value === "farmer" ? "border-primary bg-primary/5" : "border-neutral-300"
                            )}
                            onClick={() => registerForm.setValue("userType", "farmer")}
                          >
                            <input 
                              type="radio" 
                              id="user-type-farmer" 
                              name="userType" 
                              value="farmer" 
                              className="sr-only" 
                              checked={field.value === "farmer"} 
                              onChange={() => registerForm.setValue("userType", "farmer")}
                            />
                            <Sprout className="mx-auto text-xl text-primary h-6 w-6" />
                            <p className="font-medium mt-1">Farmer</p>
                          </div>
                          
                          <div 
                            className={cn(
                              "border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors text-center",
                              field.value === "buyer" ? "border-primary bg-primary/5" : "border-neutral-300"
                            )}
                            onClick={() => registerForm.setValue("userType", "buyer")}
                          >
                            <input 
                              type="radio" 
                              id="user-type-buyer" 
                              name="userType" 
                              value="buyer" 
                              className="sr-only" 
                              checked={field.value === "buyer"} 
                              onChange={() => registerForm.setValue("userType", "buyer")}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto text-xl text-primary h-6 w-6" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                            <p className="font-medium mt-1">Buyer</p>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="mb-6">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
            
            <div className="text-center mt-6">
              {isLogin ? (
                <p className="text-neutral-600">
                  Don't have an account?{" "}
                  <Button 
                    variant="link" 
                    className="text-primary font-semibold p-0" 
                    onClick={() => setView("register")}
                  >
                    Sign Up
                  </Button>
                </p>
              ) : (
                <p className="text-neutral-600">
                  Already have an account?{" "}
                  <Button 
                    variant="link" 
                    className="text-primary font-semibold p-0" 
                    onClick={() => setView("login")}
                  >
                    Sign In
                  </Button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Right column - Hero section */}
        <div className="hidden lg:block bg-primary rounded-lg shadow-lg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70"></div>
          <div className="relative p-8 flex flex-col h-full justify-center">
            <h2 className="text-white text-3xl font-bold mb-6">
              Welcome to AgriConnect
            </h2>
            <p className="text-white/90 text-lg mb-8">
              The complete marketplace connecting farmers directly with buyers.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12a5 5 0 0 0 5 5 8 8 0 0 1 5 2 8 8 0 0 1 5-2 5 5 0 0 0 5-5V7H2Z"/><path d="M6 11V8h12v3"/></svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Market Trend Analysis</h3>
                  <p className="text-white/80">Stay informed with current and predicted crop prices</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Planting Calendar</h3>
                  <p className="text-white/80">Know the best time to plant and harvest your crops</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" x2="12" y1="22" y2="12"/></svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">Verified Connections</h3>
                  <p className="text-white/80">Connect directly with verified farmers and buyers</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2Z"/><path d="M21.18 8.02A10 10 0 1 0 8.02 21.18L21.18 8.02Z"/></svg>
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">AI Assistant</h3>
                  <p className="text-white/80">Get help with farming questions and market information</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
