import styles from "./Toast.module.css";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

interface ToastMessage {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  description?: string;
}

interface ToastProps {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ messages, onDismiss }) => {
  const getIcon = (type: ToastMessage["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle2 size={20} />;
      case "warning":
        return <AlertTriangle size={20} />;
      case "error":
        return <XCircle size={20} />;
      case "info":
        return <Info size={20} />;
    }
  };

  return (
    <div className={styles.container}>
      {messages.map((message) => (
        <div key={message.id} className={`${styles.toast} ${styles[message.type]}`}>
          <span className={styles.icon}>{getIcon(message.type)}</span>
          <div className={styles.content}>
            <h4 className={styles.title}>{message.title}</h4>
            {message.description && <p className={styles.description}>{message.description}</p>}
          </div>
          <button className={styles.close} onClick={() => onDismiss(message.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
