import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { attendanceService } from '../services/api';
import { 
  ScanLine, HelpCircle, CheckCircle2, ShieldAlert, 
  User, Calendar, Clock, Sparkles, Send 
} from 'lucide-react';

const AttendanceScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Track scanned items locally in page session for recent checkin logs
  const [recentCheckins, setRecentCheckins] = useState([]);

  const scannerRef = useRef(null);

  // Initialize camera scanner on mount
  useEffect(() => {
    // Configure html5-qrcode scanner
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [0] // Camera only
    });

    const onScanSuccess = async (decodedText) => {
      // Stop scanner temporarily to prevent multi-scans of the same code
      scanner.clear().catch(err => console.error("Error clearing scanner", err));
      await processTicketVerification(decodedText);
      
      // Re-render scanner after 3 seconds to resume gate check-ins
      setTimeout(() => {
        scanner.render(onScanSuccess, onScanError);
      }, 3000);
    };

    const onScanError = (_error) => {
      // Verbose scan failures (errors occur on every frame if no QR present)
      // We suppress console noise to keep performance smooth
    };

    scanner.render(onScanSuccess, onScanError);

    scannerRef.current = scanner;

    return () => {
      // Clean up scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.warn("Scanner already cleared", err));
      }
    };
  }, []);

  const processTicketVerification = async (ticketNumber) => {
    setLoading(true);
    setScanResult(null);
    setErrorMsg('');

    try {
      const response = await attendanceService.scan(ticketNumber.trim());
      
      // Verification succeeded!
      setScanResult(response);
      
      // Append to local session log
      setRecentCheckins((prev) => [
        {
          ticketNumber: response.ticketInfo.ticketNumber,
          userName: response.ticketInfo.userName,
          eventTitle: response.ticketInfo.eventTitle,
          time: new Date(response.ticketInfo.checkinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'success'
        },
        ...prev.slice(0, 4) // Keep last 5 checkins
      ]);

      // Sound notification trigger (web browser standard synthesis)
      try {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance("Checkin Approved");
        synth.speak(utterThis);
      } catch (e) { /* Speech not supported */ }

    } catch (err) {
      console.error('Scan API error:', err);
      const errMsg = err.response?.data?.message || 'Verification failed. Unregistered or invalid code.';
      const status = err.response?.data?.status || 'invalid';
      const ticketInfo = err.response?.data?.ticketInfo;

      setErrorMsg(errMsg);
      
      setScanResult({
        success: false,
        status: status,
        message: errMsg,
        ticketInfo: ticketInfo
      });

      // Sound notification for fail
      try {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance("Checkin Rejected");
        synth.speak(utterThis);
      } catch (e) { /* Speech not supported */ }
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await processTicketVerification(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-dark-100 font-display flex items-center">
          <ScanLine className="w-8 h-8 mr-2.5 text-primary-500 animate-pulse" />
          Event Gate Attendance Scanner
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          Scan QR ticket boarding passes or input confirmation numbers to register timestamps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Scanner and Manual Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Camera Scanner Box */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-md">
            <h3 className="text-lg font-bold text-slate-800 dark:text-dark-200 font-display mb-4">
              Real-time Camera Reader
            </h3>
            
            {/* HTML5 Qr Scanner Target Element */}
            <div id="qr-reader" className="overflow-hidden rounded-xl border border-slate-200 dark:border-dark-850"></div>
          </div>

          {/* Manual Input Fallback */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-md">
            <h3 className="text-lg font-bold text-slate-800 dark:text-dark-200 font-display mb-3">
              Manual Ticket Entry Fallback
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-4">
              If camera permissions are blocked or ticket code is typed, enter below (e.g. CP-HACK-SHARMA-001).
            </p>

            <form onSubmit={handleManualSubmit} className="flex gap-3">
              <input
                type="text"
                required
                placeholder="CP-XXXX-XXXX-XXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="input-field flex-1 text-sm tracking-wider uppercase"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center space-x-1 text-sm px-6"
              >
                <Send className="w-4 h-4" />
                <span>Verify</span>
              </button>
            </form>
          </div>

        </div>

        {/* Verification Results Panel */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-md space-y-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-dark-100 font-display pb-3 border-b border-slate-100 dark:border-dark-850">
              Check-in Verification
            </h3>

            {loading && (
              <div className="flex flex-col items-center py-12">
                <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 mt-3 font-semibold">Verifying ticket data...</p>
              </div>
            )}

            {!loading && !scanResult && (
              <div className="text-center py-12 space-y-2">
                <HelpCircle className="w-12 h-12 text-slate-300 dark:text-dark-800 mx-auto" />
                <p className="text-xs text-slate-400 font-bold uppercase">Awaiting Entry Ticket</p>
                <p className="text-[10px] text-slate-400">Position ticket QR in scanner or type manual code.</p>
              </div>
            )}

            {/* Verification Result Cards */}
            {!loading && scanResult && (
              <div className="space-y-5 animate-fade-in">
                {scanResult.success ? (
                  // Success layout
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-900/30 p-5 rounded-2xl text-center space-y-4">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                    <div>
                      <h4 className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">Approved Check-in</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{scanResult.ticketInfo.ticketNumber}</p>
                    </div>

                    <div className="text-left space-y-2.5 pt-3 border-t border-slate-200 dark:border-dark-800 text-xs">
                      <div className="flex items-center text-slate-600 dark:text-dark-300">
                        <User className="w-4 h-4 mr-2 text-slate-400" />
                        <strong>{scanResult.ticketInfo.userName}</strong>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-dark-300">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        <span className="line-clamp-1">{scanResult.ticketInfo.eventTitle}</span>
                      </div>
                      <div className="flex items-center text-slate-600 dark:text-dark-300">
                        <Clock className="w-4 h-4 mr-2 text-slate-400" />
                        <span>Checked in: {new Date(scanResult.ticketInfo.checkinTime).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Fail layout
                  <div className="bg-rose-50/50 dark:bg-rose-950/15 border border-rose-200 dark:border-rose-900/30 p-5 rounded-2xl text-center space-y-4">
                    <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto" />
                    <div>
                      <h4 className="text-sm font-extrabold text-rose-700 dark:text-rose-400">Rejected Entry</h4>
                      <p className="text-xs text-rose-500 font-semibold mt-2 leading-relaxed">{scanResult.message}</p>
                    </div>

                    {scanResult.ticketInfo && (
                      <div className="text-left space-y-2 pt-3 border-t border-slate-200 dark:border-dark-800 text-xs">
                        <div className="flex items-center text-slate-500">
                          <User className="w-4 h-4 mr-2" />
                          <span>Student: {scanResult.ticketInfo.userName}</span>
                        </div>
                        <div className="flex items-center text-slate-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="line-clamp-1">Event: {scanResult.ticketInfo.eventTitle}</span>
                        </div>
                        <div className="flex items-center text-slate-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Log: Checked-in at {new Date(scanResult.ticketInfo.checkinTime).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recent Checkins Feed */}
            {recentCheckins.length > 0 && (
              <div className="pt-4 border-t border-slate-100 dark:border-dark-850 space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  Recent Checkins (This Session)
                </p>
                <div className="space-y-2">
                  {recentCheckins.map((ch, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-dark-800 flex justify-between items-center text-xs"
                    >
                      <div className="max-w-[70%]">
                        <span className="font-bold text-slate-700 dark:text-dark-200 block truncate">{ch.userName}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{ch.eventTitle}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">{ch.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default AttendanceScanner;
