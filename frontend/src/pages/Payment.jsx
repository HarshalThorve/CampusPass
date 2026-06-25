import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registrationService } from '../services/api';
import confetti from 'canvas-confetti';
import {
  CreditCard, IndianRupee, ShieldCheck, ShieldAlert,
  CheckCircle2, Smartphone, Building2, Wallet, X, ChevronRight, Lock
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Realistic Demo Razorpay Modal — Desert Cyberpunk Theme Sandbox
   ───────────────────────────────────────────────────────────────────────────── */
const DemoCheckoutModal = ({ amount, eventTitle, onSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [netBankSelected, setNetBankSelected] = useState('');
  const [processing, setProcessing] = useState(false);
  const [upiError, setUpiError] = useState('');

  const banks = [
    { id: 'sbi', name: 'State Bank of India', logo: '🏦' },
    { id: 'hdfc', name: 'HDFC Bank', logo: '🏦' },
    { id: 'icici', name: 'ICICI Bank', logo: '🏦' },
    { id: 'axis', name: 'Axis Bank', logo: '🏦' },
    { id: 'kotak', name: 'Kotak Mahindra', logo: '🏦' },
    { id: 'pnb', name: 'Punjab National Bank', logo: '🏦' },
  ];

  // Brand-aligned colors for UPI apps
  const wallets = [
    { id: 'gpay', name: 'Google Pay', emoji: '🟢', color: 'from-[#22C55E]/10 to-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30' },
    { id: 'phonepe', name: 'PhonePe', emoji: '🟣', color: 'from-[#7C3AED]/10 to-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30' },
    { id: 'paytm', name: 'Paytm', emoji: '🔵', color: 'from-[#3B82F6]/10 to-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30' },
    { id: 'amazonpay', name: 'Amazon Pay', emoji: '🟠', color: 'from-[#F59E0B]/10 to-[#F59E0B]/20 text-[#FBBF24] border border-[#F59E0B]/30' },
  ];

  const handlePay = () => {
    if (activeTab === 'upi') {
      const upiRegex = /^[\w.\-_]{2,}@[a-zA-Z]{2,}$/;
      if (!upiId || !upiRegex.test(upiId)) {
        setUpiError('Please enter a valid UPI ID (e.g. name@upi)');
        return;
      }
      setUpiError('');
    }
    setProcessing(true);
    setTimeout(() => onSuccess(), 1500);
  };

  const tabs = [
    { id: 'upi', label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'card', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'netbanking', label: 'Net Banking', icon: <Building2 className="w-4 h-4" /> },
    { id: 'wallet', label: 'Wallets', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0A0A]/80 backdrop-blur-md p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#161616] border border-emerald-950 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header (Emerald Gradient) */}
        <div className="bg-gradient-to-r from-[#10B981] to-[#34D399] p-5 flex justify-between items-center gap-3">
          <div>
            <div className="text-black font-extrabold text-sm tracking-wider uppercase">CampusPass checkout</div>
            <div className="text-black/80 text-[11px] font-medium mt-0.5">{eventTitle}</div>
          </div>
          <div className="text-right">
            <div className="text-black/70 text-[10px] font-bold uppercase tracking-wider">Amount to Pay</div>
            <div className="text-black font-black text-xl">₹{amount}</div>
          </div>
          <button onClick={onClose} className="ml-2 p-1 rounded-lg hover:bg-black/10 text-black/70 hover:text-black transition-colors border-none bg-transparent cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sandbox Indicator (Warning gold background with low opacity) */}
        <div className="bg-amber-950/20 border-b border-amber-900/30 px-5 py-2.5 flex items-center space-x-2">
          <span className="text-amber-500 text-[10px] font-mono font-bold tracking-wider">🔒 DEMO SANDBOX</span>
          <span className="text-[#FAF7F2]/60 text-[10px] font-mono">No real transaction will occur.</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 bg-white/5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 text-[10px] font-mono font-bold gap-1 transition-all border-b-2 border-t-0 border-x-0 cursor-pointer bg-transparent ${
                activeTab === tab.id
                  ? 'border-[#10B981] text-emerald-400 bg-white/5'
                  : 'border-transparent text-[#FAF7F2]/50 hover:text-[#FAF7F2]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5 space-y-4 min-h-[220px]">
          {/* UPI Tab */}
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#FAF7F2]/70 uppercase tracking-wider mb-1.5">Enter UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                  className="w-full input-field text-sm"
                />
                {upiError && <p className="text-[#E76F51] text-[10px] mt-1.5 font-semibold font-mono">{upiError}</p>}
              </div>
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-3 text-[10px] text-[#FAF7F2]/40 font-mono uppercase tracking-wider">Or pay via UPI apps</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {wallets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => { setUpiId(`demo@${w.id}`); setUpiError(''); }}
                    className={`flex flex-col items-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                      upiId === `demo@${w.id}`
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : 'border-white/10 hover:border-emerald-500/30 bg-white/5'
                    }`}
                  >
                    <span className="text-xl">{w.emoji}</span>
                    <span className="text-[9px] font-mono font-semibold text-[#FAF7F2]/60 mt-1 leading-tight text-center">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card Tab */}
          {activeTab === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#FAF7F2]/70 uppercase tracking-wider mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="4111 1111 1111 1111"
                  maxLength={19}
                  value={cardNum}
                  onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  className="w-full input-field text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#FAF7F2]/70 uppercase tracking-wider mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name on card"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  className="w-full input-field text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#FAF7F2]/70 uppercase tracking-wider mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="12/27"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full input-field text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#FAF7F2]/70 uppercase tracking-wider mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="w-full input-field text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Net Banking Tab */}
          {activeTab === 'netbanking' && (
            <div className="space-y-2.5">
              <label className="block text-[11px] font-bold text-[#FAF7F2]/70 uppercase tracking-wider mb-1">Select Your Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {banks.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => setNetBankSelected(bank.id)}
                    className={`flex items-center space-x-2.5 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      netBankSelected === bank.id
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : 'border-white/10 hover:border-emerald-500/30 bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{bank.logo}</span>
                    <span className="text-[10px] font-mono font-semibold text-[#FAF7F2]/70 leading-tight">{bank.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallets Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-2.5">
              <label className="block text-[11px] font-bold text-[#FAF7F2]/70 uppercase tracking-wider mb-1">Choose Wallet</label>
              <div className="space-y-2">
                {wallets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => handlePay()}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r ${w.color} text-[#111111] font-black text-sm hover:brightness-110 transition-all shadow-md border-none cursor-pointer`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{w.emoji}</span>
                      <span>{w.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-80" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 pb-5 space-y-3">
          {activeTab !== 'wallet' && (
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3 rounded-lg font-bold flex items-center justify-center space-x-2 shadow-[0_4px_20px_rgba(16,185,129,0.3)] border-none cursor-pointer transition-colors disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{amount} Securely</span>
                </>
              )}
            </button>
          )}
          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-[#FAF7F2]/40 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured by Razorpay · SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main Payment Page Component
   ───────────────────────────────────────────────────────────────────────────── */
const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};

  const { registrationId, orderId, amount, keyId, eventTitle, eventPrice } = state;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [razorpayScriptLoaded, setRazorpayScriptLoaded] = useState(false);

  // Simulation mode active when no valid Razorpay key is configured
  const isSimulationMode = !keyId || keyId === 'rzp_test_placeholder_key';

  useEffect(() => {
    if (!registrationId) {
      navigate('/events');
      return;
    }

    if (!isSimulationMode) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayScriptLoaded(true);
      script.onerror = () => console.warn('Razorpay SDK failed to load.');
      document.body.appendChild(script);
    }
  }, [registrationId, navigate, isSimulationMode]);

  // Real Razorpay integration
  const handleRazorpayPayment = () => {
    if (!razorpayScriptLoaded) return;
    setLoading(true);
    setError('');

    const options = {
      key: keyId,
      amount,
      currency: 'INR',
      name: 'CampusPass Ticketing',
      description: `Entry Pass for ${eventTitle}`,
      order_id: orderId,
      handler: async (response) => {
        try {
          const result = await registrationService.verifyPayment({
            registrationId,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          triggerSuccess(result.ticket.id);
        } catch (err) {
          setError(err || 'Payment verification failed.');
          setLoading(false);
        }
      },
      prefill: { name: '', email: '' },
      theme: { color: '#10B981' },
      modal: { ondismiss: () => setLoading(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Safe Simulation Mode Checkout
  const handleDemoPaymentSuccess = async () => {
    setShowDemoModal(false);
    setLoading(true);
    setError('');
    try {
      const randomId = Math.random().toString(36).substring(2, 11);
      const result = await registrationService.verifyPayment({
        registrationId,
        orderId: orderId || `order_sim_${registrationId}`,
        paymentId: `pay_sim_${randomId}`,
        signature: `sig_sim_${randomId}`,
      });
      triggerSuccess(result.ticket.id);
    } catch (err) {
      setError(err || 'Verification failed.');
      setLoading(false);
    }
  };

  const triggerSuccess = (ticketId) => {
    setSuccess(true);
    setLoading(false);
    confetti({ 
      particleCount: 150, 
      spread: 80, 
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#059669', '#6EE7B7', '#065F46']
    });
    setTimeout(() => navigate(`/ticket/${ticketId}`), 2000);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 md:px-20 bg-transparent relative z-10">
      
      {/* Demo Checkout Modal overlay */}
      {showDemoModal && (
        <DemoCheckoutModal
          amount={eventPrice}
          eventTitle={eventTitle}
          onSuccess={handleDemoPaymentSuccess}
          onClose={() => setShowDemoModal(false)}
        />
      )}

      <div className="w-full max-w-md space-y-8 relative">
        {/* Header Title */}
        <div className="text-center">
          <span className="text-4xl inline-block bg-white/5 p-3 rounded-2xl border border-white/10 shadow-lg">💳</span>
          <h2 className="mt-6 text-3xl font-extrabold text-[#FAF7F2] tracking-tight">
            Secure Checkout
          </h2>
          <p className="mt-2 text-sm text-[#FAF7F2]/60 font-mono">
            Confirm your booking details and complete payment
          </p>
        </div>

        {/* Main Payment card Panel */}
        <div className="custom-card relative space-y-6">
          
          {error && (
            <div className="flex items-center space-x-2 bg-[#E76F51]/10 border border-[#E76F51]/20 p-3.5 rounded-xl text-[#E76F51] text-xs font-mono">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center text-center p-5 bg-emerald-950/20 text-[#10B981] rounded-xl space-y-2 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8 text-[#10B981] animate-bounce" />
              <span className="font-bold text-sm font-mono tracking-wider uppercase">Payment Successful!</span>
              <span className="text-[11px] text-[#FAF7F2]/60 font-mono">Redirecting to your entry pass...</span>
            </div>
          )}

          {!success && (
            <div className="space-y-6">
              {/* Order Detail Summary Breakdown */}
              <div className="bg-white/5 p-5 rounded-xl border border-white/5 space-y-3.5">
                <h4 className="font-bold text-sm text-[#FAF7F2]/90 uppercase tracking-wider">
                  Booking Summary
                </h4>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#FAF7F2]/60 font-mono">1x Entry Pass ({eventTitle})</span>
                  <span className="font-bold text-[#FAF7F2]/90">₹{eventPrice}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#FAF7F2]/60 font-mono">Platform Fee</span>
                  <span className="font-mono font-bold text-[10px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded-md uppercase tracking-wider border border-emerald-500/20">FREE</span>
                </div>
                
                <div className="pt-3.5 border-t border-white/5 flex justify-between items-center">
                  <span className="text-xs font-bold text-[#FAF7F2] font-mono uppercase tracking-wider">Total Payable</span>
                  <span className="text-xl font-extrabold text-emerald-400 flex items-center">
                    <IndianRupee className="w-4 h-4 mr-0.5 text-emerald-400" />
                    <span>{eventPrice}</span>
                  </span>
                </div>
              </div>

              {/* Secure Trust Badge */}
              <div className="flex items-center text-[10px] text-[#FAF7F2]/50 justify-center space-x-1.5 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Encrypted 256-bit payment verified by Razorpay</span>
              </div>

              {/* Checkout Controls Trigger */}
              {isSimulationMode ? (
                <div className="space-y-3.5 pt-2">
                  <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl text-amber-500 text-center text-[10px] font-mono leading-relaxed">
                    🔒 Demo Sandbox Mode — Razorpay test key not configured. Use the sandbox checkout below.
                  </div>

                  {/* Payment Methods Quick-Selector Grid */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'UPI', icon: '📱' },
                      { label: 'Card', icon: '💳' },
                      { label: 'Net Bank', icon: '🏦' },
                      { label: 'Wallet', icon: '👛' },
                    ].map(m => (
                      <button
                        key={m.label}
                        onClick={() => setShowDemoModal(true)}
                        className="flex flex-col items-center p-2.5 rounded-xl border-2 border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group bg-white/5 cursor-pointer"
                      >
                        <span className="text-xl">{m.icon}</span>
                        <span className="text-[9px] font-mono font-semibold text-[#FAF7F2]/50 group-hover:text-emerald-400 mt-1 leading-none">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowDemoModal(true)}
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 text-sm flex items-center justify-center space-x-2 border-none rounded-lg cursor-pointer transition-colors"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay ₹{eventPrice} via Demo Checkout</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleRazorpayPayment}
                  disabled={loading || !razorpayScriptLoaded}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-3.5 text-sm flex items-center justify-center space-x-2 border-none rounded-lg cursor-pointer transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Pay via Razorpay</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Payment;
