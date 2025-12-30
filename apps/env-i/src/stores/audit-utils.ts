import { getAuth } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AuditLog } from "@/lib/types";

// Helper function to log actions to the audit trail
export const logAudit = async (action: AuditLog["action"], details: string) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
         addDoc(collection(db, "audit-logs"), {
          user: "System/Unknown",
          action,
          details,
          timestamp: serverTimestamp(),
        }).catch(err => console.error("Error writing audit log for unknown user:", err));
        return;
    }

    addDoc(collection(db, "audit-logs"), {
      user: user.email || user.uid,
      action,
      details,
      timestamp: serverTimestamp(),
    }).catch(err => console.error("Error writing audit log:", err));

  } catch (error) {
    console.error("Error initiating audit log:", error);
  }
};
