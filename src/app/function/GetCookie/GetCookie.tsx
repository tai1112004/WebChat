"use client";

export function getCookie(name: string) {
  if (typeof document === "undefined") {
    // Not running in a browser environment
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part !== undefined) {
      return part.split(";").shift();
    }
  }
  return null;
}
