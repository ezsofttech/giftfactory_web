import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="relative bg-gray-50 bg-[url(https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=1479&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] bg-no-repeat bg-cover text-white overflow-hidden">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="container mx-auto px-2 md:px-4 py-12 md:py-0 h-full">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-12 items-center h-full">
          {/* Text content - maintains same layout structure */}
          <div className="z-10 h-full flex flex-col justify-center">
            <div className=" lg:max-w-lg mx-auto md:mx-0">
              <span className="inline-block bg-dusty-rose bg-opacity-30 text-xs py-1 rounded-full mb-4 backdrop-blur-sm">
                Limited Edition
              </span>
              <h1 className="text-xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                {"Indulge in"} <br />
                <span className="text-dusty-rose">{"Luxurious Comfort"}</span>
              </h1>
              <p className="text-xs sm:text-lg md:text-xl mb-6 md:mb-8 opacity-90">
                Discover our exclusive collection of premium lingerie and
                loungewear designed for confidence and comfort.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary rounded-full px-4 sm:px-6 md:px-8 shadow-lg shadow-primary/20 text-xs
                   sm:text-base font-bold md:font-normal w-full"
                >
                  Shop
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-dusty-rose hover:bg-dusty-rose hover:bg-opacity-20 hover:text-white rounded-full px-4 sm:px-6 md:px-8 bg-transparent text-xs font-bold md:font-normal sm:text-base w-full"
                >
                  Lookbook
                </Button>
              </div>
            </div>
          </div>

          {/* Image content - maintains same aspect ratio */}
          <div className="relative h-full flex items-center justify-center">
            <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg md:aspect-[2/3] aspect-square">
              <Image
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=800&fit=crop&crop=center"
                alt="Luxurious lingerie model"
                fill
                className="object-contain"
                priority
              />
              {/* Decorative elements */}
              <div className="absolute -bottom-4 -left-4 w-24 h-24 sm:w-32 sm:h-32 bg-dusty-rose rounded-full opacity-30 blur-xl"></div>
              <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-primary rounded-full opacity-30 blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
