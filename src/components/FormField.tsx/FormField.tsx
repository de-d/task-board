import { ReactNode } from "react";
import styles from "./formField.module.scss";

export interface FormField {
  label?: string;
  errorMessage?: string;
  text?: string;
  placeholder?: string;
  children: ReactNode;
}

export const FormField = ({
  label,
  errorMessage,
  text,
  placeholder,
  children,
}: FormField) => {
  return (
    <div className={styles["form-field"]}>
      <label className={styles.label}>{label}</label>
      <div className={styles["input-wrapper"]}>
        {children}
        {!text && <span className={styles.placeholder}>{placeholder}</span>}
      </div>
      {errorMessage && <p className={styles.error}>{errorMessage}</p>}
    </div>
  );
};
