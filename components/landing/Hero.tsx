"use client";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-40 pb-24 px-6">
      {/* Ambient glow background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1">
            Next-Gen AI Architecture Engine
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]"
        >
          Describe it.{" "}
          <span className="bg-gradient-to-r from-primary via-fuchsia-400 to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[gradient_4s_linear_infinite]">
            Architect it.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Turn system descriptions into production-ready architecture diagrams, microservice maps, and UML specs in seconds — with AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 flex items-center justify-center gap-4"
        >
          <Link
            href="/workspace"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow transition-all hover:bg-primary/90"
          >
            Generate Architecture Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </Link>
          <Link
            href="/workspace/templates"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-3 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Explore Templates
          </Link>
        </motion.div>
      </div>
    </section>
  );
}