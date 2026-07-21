"use client";

import { useEffect } from "react";

export default function ReloadTimer() {
  useEffect(() => {
    setInterval(() => window.location.reload(), 1000);
  }, []);

  return null;
}
