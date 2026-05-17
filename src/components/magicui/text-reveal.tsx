"use client"

import { type FC, type ComponentPropsWithoutRef } from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string
}

export const TextReveal: FC<TextRevealProps> = ({ children, className }) => {
  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string")
  }

  const words = children.split(" ")

  return (
    <h1 className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
          className="mr-[0.3em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  )
}
