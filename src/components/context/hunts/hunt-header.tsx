"use client";

import { ArrowLeft, Bookmark, BookmarkCheck, Edit, Share2 } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Hunt } from "@/interfaces/hunt";
import { cn } from "@/lib/utils";
import { HuntStatusBadge } from "./hunt-status-badge";

interface HuntHeaderProps {
  hunt: Hunt;
  isCreator: boolean;
  isBookmarked: boolean;
  setIsBookmarked: (value: boolean) => void;
  onShare: () => void;
  onDelete: () => void;
}

export function HuntHeader({
  hunt,
  isCreator,
  isBookmarked,
  setIsBookmarked,
  onShare,
}: HuntHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHeaderVisible(false);
      } else {
        setHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <div
        ref={headerRef}
        className={cn(
          "sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b transition-all duration-300 ease-in-out",
          headerVisible ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="container py-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
              <Link href="/dashboard/hunts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h2 className="font-medium truncate max-w-[200px] sm:max-w-xs">
              {hunt.title}
            </h2>
            <HuntStatusBadge status={hunt.status} />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast.success(
                  isBookmarked ? "Retiré des favoris" : "Ajouté aux favoris",
                );
              }}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onShare}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            {isCreator && (
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href={`/dashboard/hunts/${hunt.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
