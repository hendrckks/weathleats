import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription here
    console.log("Subscribing email:", email);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-primary p-6 sm:p-8 rounded-lg w-full max-w-[94%] sm:max-w-md md:max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-3 top-3 sm:right-4 sm:top-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X className="h-6 w-6 text-background" />
            </button>
            <h2 className="text-xl sm:text-2xl flex items-center font-medium text-background mb-4">
              {/* <img
                src="/weathleats.png"
                alt="weathleats logo"
                className="h-20"
              /> */}
              <span className="">Weathleats</span>
            </h2>
            <div className="space-y-4">
              <p className="text-xl sm:text-2xl text-background font-medium">
                Nutritional tips and healthy recipes straight to your inbox.{" "}
                <span className="text-gray-300">Every week.</span>
              </p>
              <div className="bg-[#637257] p-4 sm:p-6 text-background rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">
                    Get all newly added recipes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">
                    Get notified on all newly added recipes
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm sm:text-base">
                    Receive nutritional tips and informative articles
                  </span>
                </div>
              </div>
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="border border-gray-300 bg-white text-textBlack w-full rounded-md flex">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 bg-transparent py-2 rounded-md placeholder:text-textBlack/80 focus:outline-0 focus:outline-transparent"
                  />
                  <button
                    type="submit"
                    disabled={true}
                    className="md:w-1/2 w-1/3 cursor-not-allowed text-sm bg-textBlack text-background py-2 px-4 rounded-md transition-colors"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
