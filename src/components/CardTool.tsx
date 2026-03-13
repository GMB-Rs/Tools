import { Button } from "./ui/button";
import { type ReactNode, useEffect, useState } from "react";

interface CardToolProps {
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  fullWidth?: boolean;
  rating?: number;
  uses?: number;
  tags?: string[];
  isNew?: boolean;
  isPopular?: boolean;
}

const sizeStyles = {
  sm: {
    container: "p-2 gap-2",
    image: "h-8 w-8",
    title: "text-sm font-medium",
    description: "text-[11px]",
    button: "h-auto px-1.5 py-0 text-xs",
  },
  md: {
    container: "p-3 gap-3",
    image: "h-10 w-10",
    title: "text-base font-semibold",
    description: "text-xs",
    button: "h-auto px-2 py-1 text-sm",
  },
  lg: {
    container: "p-4 gap-4",
    image: "h-12 w-12",
    title: "text-lg font-bold",
    description: "text-sm",
    button: "px-3 py-1.5 text-base",
  },
};

export function CardTool({
  title,
  description,
  imageSrc,
  imageAlt = "logo",
  buttonText = "Go",
  onButtonClick,
  icon,
  size = "md",
  href,
  className = "",
  isNew,
  isPopular,
}: CardToolProps) {
  const styles = sizeStyles[size];
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const showImage = icon || (imageSrc && !imageError);

  return (
    <>
      {/* CARD NORMAL */}
      <div
        className={`
          flex items-start border rounded-xl w-full 
          hover:shadow-md transition cursor-pointer
          ${styles.container} 
          ${className}
        `}
      >
        {showImage ? (
          <div
            className={`shrink-0 ${styles.image} flex items-center justify-center overflow-hidden rounded-md`}
          >
            {icon ? (
              icon
            ) : (
              <img
                src={imageSrc}
                alt={imageAlt}
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        ) : (
          <div
            className={`shrink-0 ${styles.image} flex items-center justify-center rounded-md`}
          >
            <span className="text-xs text-gray-400">📷</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={styles.title}>{title}</h3>

            {isNew && (
              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                NEW
              </span>
            )}

            {isPopular && (
              <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-medium">
                POP
              </span>
            )}
          </div>

          <p
            className={`text-muted-foreground ${styles.description} line-clamp-1`}
            title={description}
          >
            {description}
          </p>
        </div>

        {!isMobile && (
          <>
            {href ? (
              <Button
                asChild
                variant="link"
                size="sm"
                className={`shrink-0 ${styles.button}`}
              >
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {buttonText}
                </a>
              </Button>
            ) : (
              <Button
                variant="link"
                size="sm"
                className={`shrink-0 ${styles.button}`}
                onClick={onButtonClick}
              >
                {buttonText}
              </Button>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default CardTool;
