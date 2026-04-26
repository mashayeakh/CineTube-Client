/* eslint-disable react-hooks/purity */
"use client";

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  CheckCircle2,
  Sparkles,
  Film,
  Heart,
  ListTodo,
  Tv,
  Filter,
  Award,
  ArrowRight,
  Star,
  Users,
  TrendingUp,
  Clock,
  PlayCircle,
  PlusCircle,
  Eye,
  Bookmark,
  ThumbsUp,
  Share2,
  Zap,
  Crown,
  Gift,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface JoinSectionProps {
  className?: string;
  variant?: 'default' | 'compact' | 'hero' | 'premium';
}

export default function JoinSection({ className, variant = 'default' }: JoinSectionProps) {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const benefits = [
    {
      text: "Enjoy TMDb ad free",
      icon: <Sparkles className="size-5" />,
      highlight: true,
      color: "from-purple-500 to-pink-500"
    },
    {
      text: "Maintain a personal watchlist",
      icon: <Heart className="size-5" />,
      color: "from-red-500 to-rose-500"
    },
    {
      text: "Filter by your subscribed streaming services",
      icon: <Filter className="size-5" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      text: "Log the movies and TV shows you've seen",
      icon: <Film className="size-5" />,
      color: "from-emerald-500 to-teal-500"
    },
    {
      text: "Build custom lists",
      icon: <ListTodo className="size-5" />,
      color: "from-orange-500 to-amber-500"
    },
    {
      text: "Contribute to and improve our database",
      icon: <Award className="size-5" />,
      color: "from-indigo-500 to-purple-500"
    }
  ];

  const premiumFeatures = [
    { text: "Unlimited ad-free streaming", icon: <Crown />, popular: true },
    { text: "4K Ultra HD quality", icon: <Tv /> },
    { text: "Watch on 5 devices simultaneously", icon: <Users /> },
    { text: "Early access to new releases", icon: <Rocket /> },
    { text: "Exclusive behind-the-scenes content", icon: <Eye /> },
    { text: "Priority customer support", icon: <ThumbsUp /> }
  ];

  const stats = [
    { label: "Active Users", value: "10M+", trend: "+25%", icon: <Users className="size-5" /> },
    { label: "Movies & Shows", value: "500K+", trend: "+15%", icon: <Film className="size-5" /> },
    { label: "Daily Reviews", value: "50K+", trend: "+40%", icon: <Star className="size-5" /> },
    { label: "Watchlists Created", value: "2M+", trend: "+60%", icon: <Bookmark className="size-5" /> }
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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const particleProps = [
    { left: "6%", top: "18%", x: [0, 18, 0], y: [0, -22, 0], duration: 4.3, delay: 0.4 },
    { left: "12%", top: "26%", x: [0, -16, 0], y: [0, -18, 0], duration: 4.8, delay: 1.2 },
    { left: "22%", top: "12%", x: [0, 12, 0], y: [0, -16, 0], duration: 4.1, delay: 0.9 },
    { left: "28%", top: "42%", x: [0, -20, 0], y: [0, -24, 0], duration: 5.0, delay: 0.2 },
    { left: "35%", top: "8%", x: [0, 15, 0], y: [0, -20, 0], duration: 4.5, delay: 1.4 },
    { left: "42%", top: "36%", x: [0, -18, 0], y: [0, -22, 0], duration: 4.7, delay: 0.7 },
    { left: "50%", top: "22%", x: [0, 21, 0], y: [0, -19, 0], duration: 4.2, delay: 1.0 },
    { left: "58%", top: "10%", x: [0, -14, 0], y: [0, -17, 0], duration: 4.6, delay: 0.3 },
    { left: "64%", top: "32%", x: [0, 17, 0], y: [0, -21, 0], duration: 4.9, delay: 0.8 },
    { left: "70%", top: "18%", x: [0, -13, 0], y: [0, -15, 0], duration: 4.4, delay: 1.3 },
    { left: "76%", top: "40%", x: [0, 20, 0], y: [0, -23, 0], duration: 4.1, delay: 0.6 },
    { left: "82%", top: "16%", x: [0, -19, 0], y: [0, -20, 0], duration: 4.8, delay: 0.9 },
    { left: "88%", top: "26%", x: [0, 14, 0], y: [0, -18, 0], duration: 4.5, delay: 1.1 },
    { left: "18%", top: "58%", x: [0, -17, 0], y: [0, -22, 0], duration: 4.7, delay: 0.5 },
    { left: "30%", top: "60%", x: [0, 16, 0], y: [0, -19, 0], duration: 4.3, delay: 0.8 },
    { left: "44%", top: "54%", x: [0, -15, 0], y: [0, -20, 0], duration: 4.9, delay: 1.2 },
    { left: "52%", top: "62%", x: [0, 18, 0], y: [0, -21, 0], duration: 4.2, delay: 0.9 },
    { left: "60%", top: "58%", x: [0, -12, 0], y: [0, -16, 0], duration: 4.6, delay: 0.4 },
    { left: "68%", top: "52%", x: [0, 19, 0], y: [0, -23, 0], duration: 5.0, delay: 1.0 },
    { left: "78%", top: "56%", x: [0, -14, 0], y: [0, -18, 0], duration: 4.4, delay: 0.7 }
  ];

  if (variant === 'premium') {
    return (
      <section className={cn("py-24 relative overflow-hidden", className)}>
        {/* Premium Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-amber-300/30 to-orange-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-red-300/20 to-pink-300/20 rounded-full blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
              className="text-center mb-16"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full mb-6">
                <Crown className="size-4 text-amber-600" />
                <span className="text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Premium Experience</span>
              </motion.div>

              <motion.h2 variants={itemVariants} className="text-5xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Upgrade to Premium
                </span>
              </motion.h2>

              <motion.p variants={itemVariants} className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Unlock the ultimate movie experience with exclusive features and content
              </motion.p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Free</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="size-5 text-green-500" />
                      Basic streaming quality
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="size-5 text-green-500" />
                      Watch on 1 device
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="size-5 text-green-500" />
                      Includes ads
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full rounded-xl">
                    Current Plan
                  </Button>
                </div>
              </motion.div>

              {/* Premium Plan - Highlighted */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -10 }}
                className="relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl shadow-2xl overflow-hidden transform scale-105"
              >
                <div className="absolute top-6 right-6">
                  <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                    POPULAR
                  </div>
                </div>
                <div className="p-8 text-white">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">$12.99</span>
                    <span className="opacity-90">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {premiumFeatures.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="size-5" />
                        {feature.text}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-white text-amber-600 hover:bg-gray-100 rounded-xl font-semibold">
                    Get Premium
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </div>
              </motion.div>

              {/* Family Plan */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden"
              >
                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-2">Family</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$19.99</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="size-5 text-green-500" />
                      Everything in Premium
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="size-5 text-green-500" />
                      Up to 6 accounts
                    </li>
                    <li className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="size-5 text-green-500" />
                      Parental controls
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full rounded-xl">
                    Choose Family
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn(
      "py-20 relative overflow-hidden",
      variant === 'hero' ? "min-h-screen flex items-center" : "",
      className
    )}>
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

      {/* Animated gradient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity }}
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 0]
        }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl"
      />

      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particleProps.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            animate={{
              y: particle.y,
              x: particle.x,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay
            }}
            style={{
              left: particle.left,
              top: particle.top
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className={cn(
            "grid gap-12 items-center",
            variant === 'compact' ? "lg:grid-cols-2" : "lg:grid-cols-2"
          )}>
            {/* Left Column - Content */}
            <motion.div
              ref={null}
              style={{ opacity, scale }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Enhanced Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full backdrop-blur-sm"
              >
                <Sparkles className="size-4 text-primary animate-pulse" />
                <span className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Join Our Community
                </span>
              </motion.div>

              {/* Enhanced Heading */}
              <motion.div variants={itemVariants}>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent animate-gradient">
                    Join Today
                  </span>
                  <br />
                  <span className="text-foreground">Start Your Journey</span>
                </h2>
              </motion.div>

              {/* Enhanced Description */}
              <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Get access to maintain your own custom personal lists, track what you have seen and search and filter for what to watch next—regardless if it is in theatres or on TV.
              </motion.p>

              {/* Benefits Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 gap-3"
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                      benefit.highlight
                        ? "bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20"
                        : "bg-secondary/50 hover:bg-secondary"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg bg-gradient-to-br text-white",
                      benefit.color
                    )}>
                      {benefit.icon}
                    </div>
                    <span className="text-sm font-medium">{benefit.text}</span>
                    {benefit.highlight && (
                      <Sparkles className="size-3 text-primary ml-auto" />
                    )}
                  </motion.div>
                ))}
              </motion.div>

              {/* Enhanced CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl text-base px-8 rounded-full"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Sign Up Free
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Button>
                </Link>

                <Link href="/learn-more">
                  <Button
                    size="lg"
                    variant="outline"
                    className="group border-2 hover:bg-primary/5 transition-all duration-300 text-base px-8 rounded-full"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex items-center gap-6 pt-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-background" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Join 10M+ users</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  <Star className="size-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm text-muted-foreground ml-2">4.9/5 rating</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Enhanced Stats Dashboard */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl rounded-3xl p-6 border border-border/50 shadow-2xl">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Platform Statistics
                  </h3>
                  <p className="text-sm text-muted-foreground">Real-time analytics</p>
                </div>

                <div className="grid gap-4">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300"
                    >
                      <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                        <div className="text-primary">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                        <div className="flex items-end justify-between mt-1">
                          <span className="text-2xl font-bold">{stat.value}</span>
                          <span className="text-xs text-green-500 flex items-center gap-1">
                            <TrendingUp className="size-3" />
                            {stat.trend}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Animated Progress Bar */}
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Community Growth</span>
                    <span className="text-primary font-semibold">+158%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "68%" }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Zap className="size-4" />
                  Limited Offer
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </section>
  );
}

// Compact Version
export const CompactJoinSection = () => (
  <JoinSection variant="compact" />
);

// Hero Version
export const HeroJoinSection = () => (
  <JoinSection variant="hero" />
);

// Premium Version
export const PremiumJoinSection = () => (
  <JoinSection variant="premium" />
);