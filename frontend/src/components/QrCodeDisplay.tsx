import { QRCodeSVG } from "qrcode.react";

export default function QrCodeDisplay({ value, size = 220 }: { value: string; size?: number }) {
  return (
    <div className="bg-paper p-4 rounded-2xl inline-block">
      <QRCodeSVG value={value} size={size} fgColor="#12111a" bgColor="#ffffff" level="M" />
    </div>
  );
}
