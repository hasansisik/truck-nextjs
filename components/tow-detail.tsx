"use client";

import { format } from "date-fns";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { formatDateTimeTR } from "@/lib/utils";

interface TowDetailProps {
  tow: any;
}

export function TowDetail({ tow }: TowDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  if (!tow) return null;

  const hasImages = tow.images && tow.images.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-muted/40 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Araç Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Çeken Araç</p>
              <p className="text-sm font-medium mt-1">{tow.towTruck}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Plaka</p>
              <Badge variant="outline" className="mt-1 text-sm font-medium">
                {tow.licensePlate}
              </Badge>
            </div>
          </div>
        </div>

        <div className="bg-muted/40 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Çekme Bilgileri</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Şoför</p>
              <p className="text-sm font-medium mt-1">{tow.driver}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Firma</p>
              <p className="text-sm font-medium mt-1">{tow.company}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/40 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Çekilme Detayları</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-500">Çekilme Tarihi</p>
              <p className="text-sm font-medium mt-1">
                {formatDateTimeTR(new Date(tow.towDate))}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Mesafe (km)</p>
              <p className="text-sm font-medium mt-1">{tow.distance}</p>
            </div>
          </div>
        </div>
      </div>

      {hasImages && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500">Fotoğraflar</h3>
          
          {/* Main selected image */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-muted">
            <Image
              src={tow.images[selectedImageIndex]}
              alt={`Çekme fotoğrafı ${selectedImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>
          
          {/* Thumbnail gallery */}
          {tow.images.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tow.images.map((image: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Küçük resim ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 