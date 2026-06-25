import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { X, Download, Award } from 'lucide-react';

const loadGoogleFont = () => {
  if (!document.getElementById('cert-google-fonts')) {
    const link = document.createElement('link');
    link.id = 'cert-google-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap';
    document.head.appendChild(link);
  }
};

const certificateThemes = {
  cream: {
    background: 'radial-gradient(circle at center, #FAF8F5 0%, #F5EFEB 60%, #EAE2D8 100%)',
    textColor: '#0B0805',
    primaryBorder: '#C5A059',
    secondaryBorder: '#DFBA73',
    subTitleColor: '#8E6F54',
    descriptionColor: '#1C1814',
    flourishColor1: '#C5A059',
    flourishColor2: '#DFBA73',
    watermarkColor: '#C5A059',
    watermarkOpacity: 0.07,
    showCornerFlourishes: true,
    showWatermarkLines: true,
    signatureLineColor: '#1C1814'
  },
  dark: {
    background: 'linear-gradient(135deg, #0A0A0A 0%, #161616 50%, #0A0A0A 100%)',
    textColor: '#FAF7F2',
    primaryBorder: '#10B981',
    secondaryBorder: '#34D399',
    subTitleColor: '#34D399',
    descriptionColor: 'rgba(250,247,242,0.85)',
    flourishColor1: '#10B981',
    flourishColor2: '#34D399',
    watermarkColor: '#10B981',
    watermarkOpacity: 0.03,
    showCornerFlourishes: true,
    showWatermarkLines: true,
    signatureLineColor: '#10B981'
  },
  sage: {
    background: 'linear-gradient(135deg, #1F2E29 0%, #0A0A0A 50%, #1F2E29 100%)',
    textColor: '#FAF7F2',
    primaryBorder: '#84A59D',
    secondaryBorder: '#34D399',
    subTitleColor: '#34D399',
    descriptionColor: '#FAF7F2',
    flourishColor1: '#84A59D',
    flourishColor2: '#34D399',
    watermarkColor: '#84A59D',
    watermarkOpacity: 0.03,
    showCornerFlourishes: true,
    showWatermarkLines: true,
    signatureLineColor: '#84A59D'
  },
  emerald: {
    background: 'linear-gradient(135deg, #1F2E29 0%, #0A0A0A 50%, #1F2E29 100%)',
    textColor: '#FAF7F2',
    primaryBorder: '#10B981',
    secondaryBorder: '#34D399',
    subTitleColor: '#34D399',
    descriptionColor: '#FAF7F2',
    flourishColor1: '#10B981',
    flourishColor2: '#34D399',
    watermarkColor: '#10B981',
    watermarkOpacity: 0.02,
    showCornerFlourishes: true,
    showWatermarkLines: true,
    signatureLineColor: '#10B981'
  },
  custom: {
    background: 'transparent',
    textColor: '#FAF7F2',
    primaryBorder: 'transparent',
    secondaryBorder: 'transparent',
    subTitleColor: 'rgba(250,247,242,0.6)',
    descriptionColor: 'rgba(250,247,242,0.8)',
    flourishColor1: 'transparent',
    flourishColor2: 'transparent',
    watermarkColor: 'transparent',
    watermarkOpacity: 0,
    showCornerFlourishes: false,
    showWatermarkLines: false,
    signatureLineColor: '#FAF7F2'
  }
};

const CertificateModal = ({ isOpen, onClose, certificateData }) => {
  const certRef = useRef(null);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    loadGoogleFont();
  }, []);

  if (!isOpen || !certificateData) return null;

  const {
    certificateId,
    studentName,
    eventTitle,
    eventDate,
    eventCategory,
    settings
  } = certificateData;

  const institutionName = settings?.institution_name || 'CampusPass Institute';
  const organizerName   = settings?.organizer_name   || 'Event Coordinator';
  const organizerTitle  = settings?.organizer_title  || 'Head of Department';
  const footerText      = settings?.footer_text      || 'This certificate is digitally verified by CampusPass.';
  const theme           = settings?.certificate_theme || 'cream';
  const backgroundUrl   = settings?.certificate_background_url || '';

  // Map old theme "blue" to "sage" for safety
  const resolvedTheme = theme === 'blue' ? 'sage' : theme;
  const currentTheme = certificateThemes[resolvedTheme] || certificateThemes.cream;

  const formattedDate = new Date(eventDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  const categoryLabel = (eventCategory || '').toUpperCase();

  const downloadPDF = async () => {
    setPdfError('');
    try {
      const el = certRef.current;
      await new Promise(r => setTimeout(r, 300));
      const canvas = await html2canvas(el, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, w, h);
      pdf.save(`Certificate-${studentName.replace(/\s+/g, '_')}-${eventTitle.slice(0, 20).replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setPdfError('Could not generate PDF. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,10,0.90)', backdropFilter: 'blur(8px)' }}
    >
      <div className="relative flex flex-col max-w-5xl w-full max-h-[95vh] overflow-y-auto rounded-2xl bg-[#161616] border border-white/10 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-white font-mono tracking-wide">
              CERTIFICATE PREVIEW — Auto-filled for <span className="text-emerald-400">{studentName}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {pdfError && (
          <div className="mx-6 mt-2 px-4 py-2 rounded-lg bg-error/10 border border-error/20 text-error text-xs font-mono">
            {pdfError}
          </div>
        )}

        {/* Certificate Display Scroll View */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-8 flex items-center justify-center">
          <div style={{
            padding: '2px',
            background: 'transparent',
            boxShadow: '0 25px 65px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08)',
            margin: 'auto',
          }}>
            <div
              ref={certRef}
              style={{
                width: '842px',
                minWidth: '842px',
                height: '595px',
                minHeight: '595px',
                background: resolvedTheme === 'custom' && backgroundUrl
                  ? `url(${backgroundUrl}) no-repeat center/cover`
                  : currentTheme.background,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0',
                fontFamily: 'EB Garamond, Georgia, serif',
                color: currentTheme.textColor,
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
            {/* Outer Border */}
            {currentTheme.primaryBorder !== 'transparent' && (
              <div style={{
                position: 'absolute',
                inset: '14px',
                border: `2.5px solid ${currentTheme.primaryBorder}`,
                pointerEvents: 'none',
                zIndex: 1,
              }} />
            )}
            {currentTheme.secondaryBorder !== 'transparent' && (
              <div style={{
                position: 'absolute',
                inset: '20px',
                border: `1px solid ${currentTheme.secondaryBorder}`,
                pointerEvents: 'none',
                zIndex: 1,
              }} />
            )}

            {/* Corner Ornaments aligned with border intersections */}
            {currentTheme.showCornerFlourishes && [
              { top: '14px', left: '14px', transform: 'rotate(0deg)' },
              { top: '14px', right: '14px', transform: 'rotate(90deg)' },
              { bottom: '14px', right: '14px', transform: 'rotate(180deg)' },
              { bottom: '14px', left: '14px', transform: 'rotate(270deg)' },
            ].map((pos, i) => (
              <svg
                key={i}
                width="90" height="90"
                viewBox="0 0 90 90"
                style={{ position: 'absolute', ...pos, zIndex: 2 }}
              >
                <path d="M5 5 L35 5 Q45 5 45 15 L45 35" stroke={currentTheme.flourishColor1} strokeWidth="1.5" fill="none"/>
                <path d="M5 5 L5 35 Q5 45 15 45 L35 45" stroke={currentTheme.flourishColor1} strokeWidth="1.5" fill="none"/>
                <path d="M5 5 L20 5 Q28 5 28 13 L28 20" stroke={currentTheme.flourishColor2} strokeWidth="0.8" fill="none"/>
                <path d="M5 5 L5 20 Q5 28 13 28 L20 28" stroke={currentTheme.flourishColor2} strokeWidth="0.8" fill="none"/>
                <circle cx="5" cy="5" r="3" fill={currentTheme.flourishColor1}/>
                <circle cx="45" cy="5" r="1.5" fill={currentTheme.flourishColor2}/>
                <circle cx="5" cy="45" r="1.5" fill={currentTheme.flourishColor2}/>
                <circle cx="25" cy="5" r="1.2" fill={currentTheme.flourishColor2}/>
                <circle cx="5" cy="25" r="1.2" fill={currentTheme.flourishColor2}/>
              </svg>
            ))}

            {/* Header flourishes */}
            {resolvedTheme !== 'custom' && (
              <div style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                paddingTop: '44px',
                paddingLeft: '60px',
                paddingRight: '60px',
              }}>
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${currentTheme.secondaryBorder}, transparent)` }}/>
                <span style={{ margin: '0 12px', color: currentTheme.flourishColor1, fontSize: '18px' }}>❧</span>
                <span style={{ margin: '0 4px', color: currentTheme.flourishColor2, fontSize: '14px' }}>✦</span>
                <span style={{ margin: '0 12px', color: currentTheme.flourishColor1, fontSize: '18px' }}>❧</span>
                <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, transparent, ${currentTheme.secondaryBorder}, transparent)` }}/>
              </div>
            )}
            {resolvedTheme === 'custom' && <div style={{ height: '50px' }} />}

            {/* Institution */}
            <div style={{
              position: 'relative', zIndex: 3,
              fontFamily: 'Cinzel, serif',
              fontSize: '11px',
              letterSpacing: '4px',
              color: currentTheme.subTitleColor,
              textTransform: 'uppercase',
              marginTop: '6px',
            }}>
              {institutionName}
            </div>

            {/* Certificate Title */}
            <div style={{
              position: 'relative', zIndex: 3,
              fontFamily: 'Cinzel, serif',
              fontSize: '32px',
              fontWeight: '700',
              color: currentTheme.textColor,
              letterSpacing: '2px',
              marginTop: '6px',
              textAlign: 'center',
            }}>
              Certificate of Achievement
            </div>

            {/* Subtitle */}
            <div style={{
              position: 'relative', zIndex: 3,
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
              letterSpacing: '5px',
              color: currentTheme.subTitleColor,
              textTransform: 'uppercase',
              marginTop: '4px',
            }}>
              The Following Award is Given to
            </div>

            {/* Student Name */}
            <div style={{
              position: 'relative', zIndex: 3,
              fontFamily: '"Great Vibes", cursive',
              fontSize: '58px',
              color: currentTheme.textColor,
              marginTop: '6px',
              lineHeight: '1.1',
              textAlign: 'center',
              letterSpacing: '2px',
            }}>
              {studentName}
            </div>

            {/* Underline */}
            {resolvedTheme !== 'custom' && (
              <div style={{
                position: 'relative', zIndex: 3,
                width: '340px',
                height: '1px',
                background: `linear-gradient(to right, transparent, ${currentTheme.textColor} 30%, ${currentTheme.textColor} 70%, transparent)`,
                marginTop: '2px',
                borderBottom: `1px dotted ${currentTheme.secondaryBorder}`,
              }}/>
            )}
            {resolvedTheme === 'custom' && <div style={{ height: '4px' }} />}

            {/* Description */}
            <div style={{
              position: 'relative', zIndex: 3,
              fontFamily: 'EB Garamond, Georgia, serif',
              fontStyle: 'italic',
              fontSize: '13.5px',
              color: currentTheme.descriptionColor,
              textAlign: 'center',
              maxWidth: '520px',
              lineHeight: '1.6',
              marginTop: '10px',
              paddingLeft: '60px',
              paddingRight: '60px',
            }}>
              for successfully participating and attending the{' '}
              <strong style={{ fontStyle: 'normal', fontWeight: '600', color: currentTheme.textColor }}>
                {categoryLabel} event — {eventTitle}
              </strong>
              {' '}held on{' '}
              <strong style={{ fontStyle: 'normal', color: currentTheme.textColor }}>{formattedDate}</strong>.
            </div>

            {/* Signatures and Seal */}
            <div style={{
              position: 'relative', zIndex: 3,
              width: '100%',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              paddingLeft: '80px',
              paddingRight: '80px',
              paddingBottom: '44px',
              marginTop: '10px',
            }}>
              {/* Left Signatory */}
              <div style={{ textAlign: 'center', minWidth: '130px' }}>
                <div style={{
                  width: '130px', height: '1px',
                  background: currentTheme.signatureLineColor,
                  marginBottom: '6px',
                }}/>
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  color: currentTheme.textColor,
                  textTransform: 'uppercase',
                }}>
                  {organizerName}
                </div>
                <div style={{
                  fontFamily: 'EB Garamond, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '10px',
                  color: currentTheme.subTitleColor,
                  marginTop: '2px',
                }}>
                  {organizerTitle}
                </div>
              </div>

              {/* Seal Monogram */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '4px' }}>
                <svg width="76" height="76" viewBox="0 0 68 68">
                  <defs>
                    <linearGradient id="goldSealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#DFBA73" />
                      <stop offset="50%" stopColor="#FFF2D4" />
                      <stop offset="100%" stopColor="#C5A059" />
                    </linearGradient>
                    <linearGradient id="darkGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#C5A059" />
                      <stop offset="100%" stopColor="#765C43" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points="34,2 38,14 50,8 46,20 60,22 50,30 58,42 46,40 44,54 34,46 24,54 22,40 10,42 18,30 8,22 22,20 18,8 30,14"
                    fill={resolvedTheme === 'cream' ? 'url(#goldSealGrad)' : '#065F46'}
                    stroke={currentTheme.secondaryBorder}
                    strokeWidth="0.5"
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }}
                  />
                  <circle cx="34" cy="34" r="16" fill={resolvedTheme === 'cream' ? 'url(#darkGoldGrad)' : '#0A0A0A'} stroke={resolvedTheme === 'cream' ? '#FFF2D4' : currentTheme.secondaryBorder} strokeWidth="1.2"/>
                  <circle cx="34" cy="34" r="13" fill="none" stroke={resolvedTheme === 'cream' ? '#FFF2D4' : currentTheme.secondaryBorder} strokeWidth="0.5" strokeDasharray="2,2"/>
                  <text x="34" y="31" textAnchor="middle" fill={resolvedTheme === 'cream' ? '#FFF2D4' : '#FAF7F2'}
                    style={{ fontFamily: 'Cinzel, serif', fontSize: '8px', fontWeight: '700', letterSpacing: '1px' }}>
                    CP
                  </text>
                  <text x="34" y="39" textAnchor="middle" fill={resolvedTheme === 'cream' ? '#FFF2D4' : currentTheme.secondaryBorder}
                    style={{ fontFamily: 'Cinzel, serif', fontSize: '5px', letterSpacing: '2px', fontWeight: 'bold' }}>
                    VERIFIED
                  </text>
                </svg>
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '7px',
                  color: currentTheme.subTitleColor,
                  letterSpacing: '1px',
                  marginTop: '4px',
                }}>
                  {certificateId}
                </div>
              </div>

              {/* Right Signatory */}
              <div style={{ textAlign: 'center', minWidth: '130px' }}>
                <div style={{
                  width: '130px', height: '1px',
                  background: currentTheme.signatureLineColor,
                  marginBottom: '6px',
                }}/>
                <div style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  color: currentTheme.textColor,
                  textTransform: 'uppercase',
                }}>
                  Head of Event
                </div>
                <div style={{
                  fontFamily: 'EB Garamond, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '10px',
                  color: currentTheme.subTitleColor,
                  marginTop: '2px',
                }}>
                  {institutionName}
                </div>
              </div>
            </div>

            {/* Footer Text */}
            <div style={{
              position: 'absolute',
              bottom: '22px',
              left: 0, right: 0,
              textAlign: 'center',
              zIndex: 3,
              fontFamily: 'EB Garamond, Georgia, serif',
              fontStyle: 'italic',
              fontSize: '9px',
              color: currentTheme.subTitleColor,
              letterSpacing: '1px',
            }}>
              {footerText}
            </div>

            {/* Watermark Crest */}
            {currentTheme.showWatermarkLines && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: currentTheme.watermarkOpacity,
                zIndex: 0,
                pointerEvents: 'none',
              }}>
                <svg width="340" height="340" viewBox="0 0 100 100" fill="none">
                  {/* Circular border rings */}
                  <circle cx="50" cy="50" r="48" stroke={currentTheme.watermarkColor} strokeWidth="0.3" strokeDasharray="2,2" />
                  <circle cx="50" cy="50" r="45" stroke={currentTheme.watermarkColor} strokeWidth="0.8" />
                  <circle cx="50" cy="50" r="42" stroke={currentTheme.watermarkColor} strokeWidth="0.3" />
                  {/* Central shield/crest */}
                  <path d="M50 22 L68 30 L68 55 Q68 72 50 80 Q32 72 32 55 L32 30 Z" stroke={currentTheme.watermarkColor} strokeWidth="0.8" />
                  {/* Laurel Wreath decorative curves */}
                  <path d="M22 65 Q18 48 26 33 M78 65 Q82 48 74 33" stroke={currentTheme.watermarkColor} strokeWidth="0.6" />
                  {/* Center Star of excellence */}
                  <polygon points="50,38 52,43 57,43 53,46 55,51 50,48 45,51 47,46 43,43 48,43" fill={currentTheme.watermarkColor} />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#161616]">
        <p className="text-xs text-gray-400 font-mono">
          Each participant gets a personalized certificate with their name auto-filled.
        </p>
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-white/20 text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 font-mono text-xs uppercase tracking-wide transition-all duration-300"
          >
            Close
          </button>
          <button
            onClick={downloadPDF}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold py-2.5 px-6 rounded-full flex items-center gap-2 font-mono text-xs uppercase tracking-wide transition-all duration-300"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};

export default CertificateModal;
