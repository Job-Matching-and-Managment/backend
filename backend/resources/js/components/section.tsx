"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import type { SectionProps } from "../types"
import { Link, usePage } from "@inertiajs/react";
import { dashboard, login, register } from "@/routes";
// import { register } from "module";

export default function Section({ id, title, subtitle, content, isActive, showButton, buttonText, canRegister }: SectionProps) {
  const { auth } = usePage().props;

  return (
    <section id={id} className="relative h-screen w-full snap-start flex flex-col justify-center p-8 md:p-16 lg:p-24">
      {subtitle && (
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          {subtitle}
        </motion.div>
      )}
      <motion.h2
        className="text-4xl md:text-6xl lg:text-[5rem] xl:text-[6rem] font-bold leading-[1.1] tracking-tight max-w-4xl text-white"
        initial={{ opacity: 0, y: 50 }}
        animate={isActive ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>
      {content && (
        <motion.p
          className="text-lg md:text-xl lg:text-2xl max-w-2xl mt-6 text-neutral-400"
          initial={{ opacity: 0, y: 50 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {content}
        </motion.p>
      )}
      {showButton && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          {auth.user ? (
              <Link
                  href={dashboard()}
                  className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm text-[#1b1b18] dark:text-[#EDEDEC]"
              >
                  Dashboard
              </Link>
          ) : (
              <>
                  <Link
                      href={login()}
                      className="inline-block rounded-sm border border-gray-500 px-5 py-1.5 text-sm text-gray-300 hover:border-gray-300"
                  >
                      Log in
                  </Link>

                  {canRegister && (
                      <Link
                          href={register()}
                          className="inline-block rounded-sm bg-white text-black px-5 py-1.5 text-sm font-medium ml-4 hover:bg-gray-200"
                      >
                          Register
                      </Link>
                  )}
              </>
          )}
          {/* <Button
            variant="outline"
            size="lg"
            className="text-[#FF4D00] bg-transparent border-[#FF4D00] hover:bg-[#FF4D00] hover:text-black transition-colors"
          >
            {buttonText}
          </Button> */}
        </motion.div>
      )}
    </section>
  )
}
