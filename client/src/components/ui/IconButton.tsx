"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface IconButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  active?: boolean;
}

export function IconButton({
  children,
  variant = "ghost",
  size = "md",
  className = "",
  active = false,
  ...props
}: IconButtonProps) {
  const baseStyles =
    "inline-flex cursor-pointer items-center justify-center rounded-full transition-colors ";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 ",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 ",
    ghost: active 
      ? "bg-blue-50 text-blue-600 hover:bg-blue-100 "
      : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
  };

  const sizes = {
    sm: "p-1.5 text-sm",
    md: "p-2 text-base",
    lg: "p-3 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
