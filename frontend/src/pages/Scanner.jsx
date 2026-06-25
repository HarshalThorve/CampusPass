import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion } from 'framer-motion';
import { attendanceService } from '../services/api';
import {
  ScanLine, HelpCircle, CheckCircle2, ShieldAlert,
  User, Calendar, Clock, Sparkles, Send, CameraOff
} from 'lucide-react';

const Scanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState([]);
  const [cameraError, setCameraError] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    const checkCameraAvailability = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (!isCancelled) setCameraError(true);
        return;
      }

      try {
        if (navigator.permissions && navigator.permissions.query) {
          const status = await navigator.permissions.query({ name: 'camera' });
          if (status.state === 'denied') {
            if (!isCancelled) setCameraError(true);
            return;
          }
        }
      } catch {
        // Ignore permission check errors
      }

      if (isCancelled) return;

      try {
        const container = document.getElementById('qr-reader');
        if (container) {
          container.innerHTML = '';
        }

        const scanner = new Html5QrcodeScanner('qr-reader', {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          rememberLastUsedCamera: true
        });

        const onScanSuccess = async (decodedText) => {
          scanner.clear().catch(console.error);
          await processTicketVerification(decodedText);
          setTimeout(() => {
            if (scannerRef.current) {
              scannerRef.current.render(onScanSuccess, onScanError);
            }
          }, 3000);
        };

        const onScanError = () => {};

        scanner.render(onScanSuccess, onScanError);
        scannerRef.current = scanner;
      } catch (err) {
        console.error("Scanner initialization failed:", err);
        if (!isCancelled) setCameraError(true);
      }
    };

    checkCameraAvailability();

    return () => {
      isCancelled = true;
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.warn);
        scannerRef.current = null;
      }
    };
  }, []);

  async function processTicketVerification(ticketNumber) {
    setLoading(true);
    setScanResult(null);

    try {
      const response = await attendanceService.scan(ticketNumber.trim());
      setScanResult(response);

      setRecentCheckins((prev) => [
        {
          ticketNumber: response.ticketInfo.ticketNumber,
          userName: response.ticketInfo.userName,
          eventTitle: response.ticketInfo.eventTitle,
          time: new Date(response.ticketInfo.checkinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'success',
          valid: true
        },
        ...prev.slice(0, 4)
      ]);

      try {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance("Checkin Approved");
        synth.speak(utterThis);
      } catch { }

    } catch (err) {
      console.error('Scan API error:', err);
      const errMsg = err.response?.data?.message || 'Verification failed. Unregistered or invalid code.';
      const status = err.response?.data?.status || 'invalid';
      const ticketInfo = err.response?.data?.ticketInfo;

      setScanResult({
        success: false,
        status: status,
        message: errMsg,
        ticketInfo: ticketInfo
      });

      setRecentCheckins((prev) => [
        {
          ticketNumber: ticketNumber.trim(),
          userName: ticketInfo?.userName || 'Unknown Student',
          eventTitle: ticketInfo?.eventTitle || 'Unregistered Event',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'error',
          valid: false
        },
        ...prev.slice(0, 4)
      ]);

      try {
        const synth = window.speechSynthesis;
        const utterThis = new SpeechSynthesisUtterance("Checkin Rejected");
        synth.speak(utterThis);
      } catch { }
    } finally {
      setLoading(false);
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    await processTicketVerification(manualCode.trim());
    setManualCode('');
  };

  return (
    <div className="min-h-screen flex-1 px-4 md:px-20 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAF7F2] font-display flex items-center">
          <ScanLine className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 text-emerald-500 animate-pulse" />
          Event Gate Attendance Scanner
        </h1>
        <p className="text-sm text-[rgba(250,247,242,0.5)] mt-1 font-sans">
          Scan QR ticket boarding passes or input confirmation numbers to register timestamps.
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
        
        {/* Left Column (Camera + Manual Input) */}
        <div className="space-y-6">
          
          {/* Camera Card */}
          <div className="amber-glow-card">
            <h3 className="text-emerald-500 text-[15px] font-[600] mb-4 font-sans select-none uppercase tracking-wider">
              Real-time Camera Reader
            </h3>

            {cameraError ? (
              <div
                className="flex flex-col items-center justify-center text-center p-8 gap-3"
                style={{
                  background: 'rgba(11,11,13,0.4)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: '16px',
                  minHeight: '320px',
                  position: 'relative'
                }}
              >
                {/* Corner Brackets */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-emerald-500/80 rounded-tl-lg" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-emerald-500/80 rounded-tr-lg" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-emerald-500/80 rounded-bl-lg" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-emerald-500/80 rounded-br-lg" />

                <div className="relative mb-4">
                  <div className="absolute -inset-4 bg-emerald-500/20 blur-xl rounded-full" />
                  <div className="w-16 h-16 rounded-full border border-emerald-500/40 flex items-center justify-center relative z-10 bg-[#111111]">
                    <CameraOff className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
                <p className="text-[rgba(250,247,242,0.55)] text-sm font-sans m-0 mt-2">Request Camera Permissions</p>
                <span
                  onClick={() => setCameraError(false)}
                  className="text-emerald-500 text-sm underline cursor-pointer hover:text-emerald-400 transition-colors"
                >
                  Scan an Image File
                </span>
              </div>
            ) : (
              <div className="relative p-2 rounded-[20px] bg-gradient-to-br from-emerald-500/20 to-transparent">
                <div className="absolute inset-0 bg-emerald-500/5 blur-xl rounded-[20px]" />
                <div id="qr-reader" className="camera-box overflow-hidden rounded-xl border-2 border-emerald-500/40 min-h-[280px] relative z-10 bg-[#111111]" />
                <motion.div 
                  className="absolute top-6 right-6 text-emerald-500 pointer-events-none z-20"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ScanLine className="w-6 h-6 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </motion.div>
                <div className="absolute left-2 right-2 top-2 bottom-2 rounded-xl overflow-hidden pointer-events-none z-20">
                  <div className="w-full h-0.5 bg-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-[scan_3s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>

          {/* Manual Entry Fallback Card */}
          <div className="amber-glow-card mt-6">
            <h3 className="text-emerald-500 text-[15px] font-[600] mb-1 font-sans uppercase tracking-wider">
              Manual Ticket Entry Fallback
            </h3>
            <p className="text-xs text-[rgba(250,247,242,0.45)] font-sans mb-4">
              If camera permissions are blocked or ticket code is typed, enter below (e.g. CP-HACK-SHARMA-001).
            </p>

            <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="CP-XXXX-XXXX-XXXX"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="input-field flex-1 text-sm tracking-wider uppercase"
              />
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black min-w-[100px] py-3.5 rounded-lg font-bold border-none transition-colors cursor-pointer font-sans btn-shimmer"
              >
                <Send className="w-4 h-4" />
                <span>Verify</span>
              </motion.button>
            </form>
          </div>

        </div>

        {/* Right Column (Verification & Logs) */}
        <div className="space-y-6">
          <div className="amber-glow-card flex flex-col gap-6">
            <h3 className="text-emerald-500 text-[15px] font-[600] font-sans pb-3 border-b border-white/10 uppercase tracking-wider">
              Check-in Verification
            </h3>

            {loading && (
              <div className="flex flex-col items-center py-12">
                <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-[rgba(250,247,242,0.45)] mt-3 font-semibold">Verifying ticket data...</p>
              </div>
            )}

            {!loading && !scanResult && (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-3 min-h-[280px]">
                <div className="relative mb-2">
                  <div className="absolute -inset-4 bg-emerald-500/10 blur-xl rounded-full" />
                  <div className="w-16 h-16 rounded-full border border-emerald-500/40 flex items-center justify-center relative z-10 bg-[#111111] shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                    <ScanLine className="w-7 h-7 text-emerald-500" />
                  </div>
                </div>
                <p className="text-emerald-500 text-[13px] font-[600] tracking-wider uppercase">Awaiting Entry Ticket</p>
                <p className="text-[rgba(250,247,242,0.35)] text-[13px] m-0 font-sans">Position ticket QR in scanner or type manual code.</p>
              </div>
            )}

            {!loading && scanResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="space-y-5"
              >
                {scanResult.success ? (
                  <div className="bg-[#8AC926]/10 border border-[#8AC926]/20 p-5 rounded-2xl text-center space-y-4">
                    <CheckCircle2 className="w-10 h-10 text-[#8AC926] mx-auto animate-bounce" />
                    <div>
                      <h4 className="text-sm font-extrabold text-[#8AC926] uppercase">Approved Check-in</h4>
                      <p className="text-[10px] text-[rgba(250,247,242,0.45)] mt-1 font-mono">{scanResult.ticketInfo.ticketNumber}</p>
                    </div>

                    <div className="text-left space-y-2.5 pt-3 border-t border-white/10 text-xs font-sans">
                      <div className="flex items-center text-[#FAF7F2]">
                        <User className="w-4 h-4 mr-2 text-emerald-500/70" />
                        <strong>{scanResult.ticketInfo.userName}</strong>
                      </div>
                      <div className="flex items-center text-[#FAF7F2]">
                        <Calendar className="w-4 h-4 mr-2 text-emerald-500/70" />
                        <span className="truncate">{scanResult.ticketInfo.eventTitle}</span>
                      </div>
                      <div className="flex items-center text-[#FAF7F2]">
                        <Clock className="w-4 h-4 mr-2 text-emerald-500/70" />
                        <span>Checked in: {new Date(scanResult.ticketInfo.checkinTime).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#E76F51]/10 border border-[#E76F51]/20 p-5 rounded-2xl text-center space-y-4">
                    <ShieldAlert className="w-10 h-10 text-[#E76F51] mx-auto" />
                    <div>
                      <h4 className="text-sm font-extrabold text-[#E76F51] uppercase">Rejected Entry</h4>
                      <p className="text-xs text-[#E76F51] font-semibold mt-2 leading-relaxed">{scanResult.message}</p>
                    </div>

                    {scanResult.ticketInfo && (
                      <div className="text-left space-y-2 pt-3 border-t border-white/10 text-xs font-sans">
                        <div className="flex items-center text-[rgba(250,247,242,0.55)]">
                          <User className="w-4 h-4 mr-2" />
                          <span>Student: {scanResult.ticketInfo.userName}</span>
                        </div>
                        <div className="flex items-center text-[rgba(250,247,242,0.55)]">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span className="truncate">Event: {scanResult.ticketInfo.eventTitle}</span>
                        </div>
                        <div className="flex items-center text-[rgba(250,247,242,0.55)]">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>Log: Checked-in at {new Date(scanResult.ticketInfo.checkinTime).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Recent Scans Session List / Placeholders */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <p className="text-[11px] font-bold text-[rgba(250,247,242,0.3)] uppercase tracking-wider flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                Recent Scans
              </p>
              <div className="space-y-2">
                {recentCheckins.length > 0 ? (
                  recentCheckins.map((ch, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.3 }}
                      className={`p-[12px_16px] rounded-[10px] mb-2 flex flex-col gap-2 ${
                        ch.valid 
                          ? 'bg-white/[0.04] border border-white/[0.08]' 
                          : 'bg-[#E76F51]/5 border border-[#E76F51]/40'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[#FAF7F2] text-[13px] font-[600] truncate max-w-[60%]">{ch.ticketNumber}</span>
                        <span className="text-[rgba(250,247,242,0.35)] text-[11px] font-mono">{ch.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[rgba(250,247,242,0.5)] text-[12px] truncate max-w-[60%]">{ch.eventTitle}</span>
                        <motion.span 
                          animate={{ 
                            boxShadow: ch.valid 
                              ? ['0 0 0px rgba(34,197,94,0)', '0 0 8px rgba(34,197,94,0.4)', '0 0 0px rgba(34,197,94,0)']
                              : undefined
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`text-[11px] font-[600] px-2 py-0.5 rounded-full uppercase ${
                            ch.valid 
                              ? 'bg-[#8AC926]/12 border border-[#8AC926]/30 text-[#8AC926]' 
                              : 'bg-[#E76F51]/12 border border-[#E76F51]/30 text-[#E76F51]'
                          }`}
                        >
                          {ch.valid ? 'VALID' : 'INVALID'}
                        </motion.span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <>
                    {/* Placeholder Entry 1 */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="p-[12px_16px] rounded-[10px] bg-white/[0.04] border border-white/[0.08] mb-2 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[#FAF7F2] text-[13px] font-[600]">CP-HACK-SHARMA-001</span>
                        <span className="text-[rgba(250,247,242,0.35)] text-[11px] font-mono">2:34 PM · Today</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[rgba(250,247,242,0.5)] text-[12px]">HackSummit 2026</span>
                        <motion.span 
                          animate={{ 
                            boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 8px rgba(34,197,94,0.4)', '0 0 0px rgba(34,197,94,0)']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-[11px] font-[600] px-2 py-0.5 rounded-full bg-[#8AC926]/12 border border-[#8AC926]/30 text-[#8AC926] uppercase"
                        >
                          VALID
                        </motion.span>
                      </div>
                    </motion.div>

                    {/* Placeholder Entry 2 */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                      className="p-[12px_16px] rounded-[10px] bg-white/[0.04] border border-white/[0.08] mb-2 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[#FAF7F2] text-[13px] font-[600]">CP-CULT-IYER-009</span>
                        <span className="text-[rgba(250,247,242,0.35)] text-[11px] font-mono">2:31 PM · Today</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[rgba(250,247,242,0.5)] text-[12px]">Rhythm Cultural Fest</span>
                        <motion.span 
                          animate={{ 
                            boxShadow: ['0 0 0px rgba(34,197,94,0)', '0 0 8px rgba(34,197,94,0.4)', '0 0 0px rgba(34,197,94,0)']
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-[11px] font-[600] px-2 py-0.5 rounded-full bg-[#8AC926]/12 border border-[#8AC926]/30 text-[#8AC926] uppercase"
                        >
                          VALID
                        </motion.span>
                      </div>
                    </motion.div>

                    {/* Placeholder Entry 3 */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                      className="p-[12px_16px] rounded-[10px] bg-[#E76F51]/5 border border-[#E76F51]/40 mb-2 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[#FAF7F2] text-[13px] font-[600]">CP-SPRT-DESAI-042</span>
                        <span className="text-[rgba(250,247,242,0.35)] text-[11px] font-mono">2:28 PM · Today</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[rgba(250,247,242,0.5)] text-[12px]">Inter-College Sports Meet</span>
                        <span className="text-[11px] font-[600] px-2 py-0.5 rounded-full bg-[#E76F51]/12 border border-[#E76F51]/30 text-[#E76F51] uppercase">
                          INVALID
                        </span>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Scanner;
