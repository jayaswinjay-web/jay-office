import styles from "./Avatar.module.css";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, name, size = "md", className }) => {
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    const initials = words.map((word) => word[0]?.toUpperCase()).join("").slice(0, 2);
    return initials || null;
  };

  const initials = name ? getInitials(name) : null;

  return (
    <div className={`${styles.root} ${styles[size]} ${className || ""}`}>
      {src ? (
        <img src={src} alt={alt || name} className={styles.img} />
      ) : initials ? (
        <span className={styles.initials}>{initials}</span>
      ) : (
        <User size={size === "lg" ? 24 : size === "sm" ? 16 : 20} />
      )}
    </div>
  );
};

export default Avatar;
