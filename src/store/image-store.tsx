import { createContext, useContext, useCallback } from "react";
import { API_BASE_URL } from "@/service/api.config";

interface ImageContextType {
  getImageUrl: (filename: string) => string;
  getBoutiqueImageUrl: (filename: string) => string;
}

const ImageContext = createContext<ImageContextType | null>(null);

export function ImageProvider({ children }: { children: React.ReactNode }) {
  const getImageUrl = useCallback((filename: string): string => {
    if (!filename) return "";
    if (filename.startsWith("http") || filename.startsWith("data:")) return filename;
    return `${API_BASE_URL}/upload/${filename}`;
  }, []);

  const getBoutiqueImageUrl = useCallback(
    (filename: string): string => getImageUrl(filename),
    [getImageUrl]
  );

  return (
    <ImageContext.Provider value={{ getImageUrl, getBoutiqueImageUrl }}>
      {children}
    </ImageContext.Provider>
  );
}

export function useImage(): ImageContextType {
  const ctx = useContext(ImageContext);
  if (!ctx) throw new Error("useImage must be used inside <ImageProvider>");
  return ctx;
}
