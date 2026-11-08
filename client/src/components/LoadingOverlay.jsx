import { motion } from "framer-motion";

export default function LoadingOverlay({ text = "Loading..." }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        minHeight: 240,
        gap: 16,
        color: "var(--text3)"
      }}
    >
      <div style={{ position: "relative", width: 48, height: 48 }}>
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          style={{
            display: "block",
            width: 48,
            height: 48,
            border: "4px solid var(--surface2)",
            borderTopColor: "var(--sidebar-bg)",
            borderRadius: "50%"
          }}
        />
      </div>
      <div style={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.02em" }}>{text}</div>
    </motion.div>
  );
}
