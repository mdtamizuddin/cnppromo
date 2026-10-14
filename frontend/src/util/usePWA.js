import { useState, useEffect } from "react";
import toast from "react-hot-toast";

let deferredPrompt = null;

export const usePWA = () => {
  const [hasPrompt, setHasPrompt] = useState(Boolean(deferredPrompt));
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(isStandaloneMode);

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      setHasPrompt(true);
    };

    const handleAppInstalled = () => {
      deferredPrompt = null;
      setHasPrompt(false);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !window.MSStream;

  const installApp = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          deferredPrompt = null;
          setHasPrompt(false);
          setIsStandalone(true);
          return true;
        }
      } catch (err) {
        console.error("PWA install error:", err);
      }
      return false;
    }

    if (isIOS) {
      toast(
        "আইফোনে ইনস্টল করতে: Safari-এর Share (⎋) বাটনে চাপ দিয়ে 'Add to Home Screen' (+) সিলেক্ট করুন।",
        { duration: 6000, icon: "📲" }
      );
      return false;
    }

    toast(
      "ইনস্টল করতে: ব্রাউজারের অ্যাড্রেস বারের Install (⬇) আইকন অথবা মেনু থেকে 'Install app' চাপুন।",
      { duration: 5000, icon: "💡" }
    );
    return false;
  };

  return {
    isInstallable: !isStandalone,
    hasNativePrompt: hasPrompt,
    isStandalone,
    isIOS,
    installApp,
  };
};
