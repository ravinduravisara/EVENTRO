import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess, onScanError }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        onScanSuccess(decodedText);
        scanner.clear().catch(() => {});
      },
      (errorMessage) => {
        if (onScanError) onScanError(errorMessage);
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScanSuccess, onScanError]);

  return <div id="qr-reader" ref={scannerRef} className="w-full max-w-md mx-auto" />;
};

export default QRScanner;
