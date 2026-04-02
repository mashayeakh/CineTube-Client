"use client";


import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Sparkles,
  Film,
  Heart,
  ListTodo,
  Tv,
  Filter,
  Award,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface JoinSectionProps {
  className?: string;
  variant?: 'default' | 'compact' | 'hero';
}

export default function JoinSection({ className, variant = 'default' }: JoinSectionProps) {
  const benefits = [
    {
      text: "Enjoy TMDb ad free",
      icon: <Sparkles className="size-5" />,
      highlight: true
    },
    {
      text: "Maintain a personal watchlist",
      icon: <Heart className="size-5" />
    },
    {
      text: "Filter by your subscribed streaming services and find something to watch",
      icon: <Filter className="size-5" />
    },
    {
      text: "Log the movies and TV shows you've seen",
      icon: <Film className="size-5" />
    },
    {
      text: "Build custom lists",
      icon: <ListTodo className="size-5" />
    },
    {
      text: "Contribute to and improve our database",
      icon: <Award className="size-5" />
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <section className={cn(
      "py-20 relative overflow-hidden",
      variant === 'hero' ? "min-h-screen flex items-center" : "",
      className
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0 border-4 bg-linear-to-br from-primary/5 via-background to-background" />

      {/* Animated Background Circles */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
      />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-grid-primary/5 mask-[radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className={cn(
            "grid gap-12 items-center",
            variant === 'compact' ? "lg:grid-cols-2" : "lg:grid-cols-2"
          )}>
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
              >
                <Sparkles className="size-4 text-primary" />
                <span className="text-sm font-medium text-primary">Join Our Community</span>
              </motion.div>

              {/* Heading */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-linear-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Join Today
                </span>
              </h2>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Get access to maintain your own custom personal lists, track what you have seen and search and filter for what to watch next—regardless if it is in theatres or on TV.
              </p>

              {/* Benefits List */}
              {/* <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex items-start gap-3 group"
                  >
                    <div className={cn(
                      "mt-1 p-1 rounded-full transition-all duration-300",
                      benefit.highlight
                        ? "text-primary group-hover:text-primary/80"
                        : "text-muted-foreground group-hover:text-primary"
                    )}>
                      {benefit.icon}
                    </div>
                    <span className={cn(
                      "text-base",
                      benefit.highlight ? "font-medium text-foreground" : "text-muted-foreground"
                    )}>
                      {benefit.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div> */}

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link
                  href="/signup"
                  className="group inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-primary to-primary/80 px-8 text-base font-medium text-primary-foreground shadow-lg transition-all duration-300 hover:from-primary/90 hover:to-primary hover:shadow-xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Sign Up
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>

                <Link href="/learn-more">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group border-2 hover:bg-primary/5 transition-all duration-300 text-base px-8"
                  >
                    <span>Learn More</span>
                  </Button>
                </Link>
              </motion.div>

              {/* Social Proof */}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-6 pt-6"
              >
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary border-2 border-background"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">10,000+</span> movie lovers joined
                </p>
              </motion.div> */}
            </motion.div>

            {/* Right Column - Visual/Stats */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative hidden lg:block"
            >

            </motion.div>
          </div>

          {/* Bottom Wave/Decoration */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </p>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
}

// Stat Card Component
const StatCard = ({ icon, label, value, trend }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="flex items-center gap-4 p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300"
  >
    <div className="p-3 bg-primary/10 rounded-xl text-primary">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-green-500">{trend}</span>
      </div>
    </div>
  </motion.div>
);

// Compact Version for smaller spaces
export const CompactJoinSection = () => (
  <JoinSection variant="compact" />
);

// Hero Version for landing pages
export const HeroJoinSection = () => (
  <JoinSection variant="hero" />
);