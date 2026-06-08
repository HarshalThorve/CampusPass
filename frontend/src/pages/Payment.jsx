import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registrationService } from '../services/api';
import confetti from 'canvas-confetti';
import {
  CreditCard, IndianRupee, ShieldCheck, ShieldAlert,
  CheckCircle2, Smartphone, Building2, Wallet, X, ChevronRight, Lock
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
   Realistic Demo Razorpay Modal — shown when no real key is configured
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

  const wallets = [
    { id: 'gpay', name: 'Google Pay', emoji: '🟢', color: 'from-green-500 to-teal-500' },
    { id: 'phonepe', name: 'PhonePe', emoji: '🟣', color: 'from-purple-600 to-indigo-600' },
    { id: 'paytm', name: 'Paytm', emoji: '🔵', color: 'from-blue-500 to-cyan-500' },
    { id: 'amazonpay', name: 'Amazon Pay', emoji: '🟠', color: 'from-orange-500 to-amber-500' },
  ];

  const handlePay = () => {
    // Basic UPI validation
    if (activeTab === 'upi') {
      const upiRegex = /^[\w.\-_]{2,}@[a-zA-Z]{2,}$/;
      if (!upiId || !upiRegex.test(upiId)) {
        setUpiError('Please enter a valid UPI ID (e.g. name@upi)');
        return;
      }
      setUpiError('');
    }
    setProcessing(true);
    // Simulate 1.5s processing delay before success
    setTimeout(() => onSuccess(), 1500);
  };

  const tabs = [
    { id: 'upi', label: 'UPI', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'card', label: 'Card', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'netbanking', label: 'Net Banking', icon: <Building2 className="w-4 h-4" /> },
    { id: 'wallet', label: 'Wallets', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white dark:bg-dark-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-dark-700 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center">
          <div>
            <div className="text-white font-bold text-sm">CampusPass Ticketing</div>
            <div className="text-white/70 text-[11px] mt-0.5">{eventTitle}</div>
          </div>
          <div className="text-right">
            <div className="text-white/70 text-[10px]">Amount to Pay</div>
            <div className="text-white font-extrabold text-lg">₹{amount}</div>
          </div>
          <button onClick={onClose} className="ml-4 text-white/60 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Mode Badge */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/30 px-4 py-2 flex items-center space-x-2">
          <span className="text-amber-500 text-[10px] font-bold">🔒 DEMO SANDBOX</span>
          <span className="text-amber-600 dark:text-amber-400 text-[10px]">No real transaction will occur. All payment methods are simulated.</span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-850">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-3 text-[10px] font-bold gap-1 transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-dark-900'
                  : 'border-transparent text-slate-400 dark:text-dark-500 hover:text-slate-600'
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
                <label className="text-xs font-semibold text-slate-600 dark:text-dark-300 block mb-1.5">Enter UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => { setUpiId(e.target.value); setUpiError(''); }}
                  className="w-full border border-slate-200 dark:border-dark-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-dark-800 text-slate-800 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {upiError && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{upiError}</p>}
              </div>
              <p className="text-[10px] text-slate-400 text-center">Or pay via UPI apps</p>
              <div className="grid grid-cols-4 gap-2">
                {wallets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => { setUpiId(`demo@${w.id}`); setUpiError(''); }}
                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${
                      upiId === `demo@${w.id}`
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-dark-700 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-xl">{w.emoji}</span>
                    <span className="text-[9px] font-semibold text-slate-600 dark:text-dark-400 mt-1 leading-tight text-center">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Card Tab */}
          {activeTab === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-dark-300 block mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="4111 1111 1111 1111"
                  maxLength={19}
                  value={cardNum}
                  onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  className="w-full border border-slate-200 dark:border-dark-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-dark-800 text-slate-800 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-dark-300 block mb-1">Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name on card"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  className="w-full border border-slate-200 dark:border-dark-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-dark-800 text-slate-800 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-dark-300 block mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    placeholder="12/27"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full border border-slate-200 dark:border-dark-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-dark-800 text-slate-800 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-dark-300 block mb-1">CVV</label>
                  <input
                    type="password"
                    placeholder="•••"
                    maxLength={4}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="w-full border border-slate-200 dark:border-dark-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-dark-800 text-slate-800 dark:text-dark-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Net Banking Tab */}
          {activeTab === 'netbanking' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-dark-300 block mb-2">Select Your Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {banks.map(bank => (
                  <button
                    key={bank.id}
                    onClick={() => setNetBankSelected(bank.id)}
                    className={`flex items-center space-x-2 p-3 rounded-xl border-2 text-left transition-all ${
                      netBankSelected === bank.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30'
                        : 'border-slate-200 dark:border-dark-700 hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-lg">{bank.logo}</span>
                    <span className="text-[10px] font-semibold text-slate-600 dark:text-dark-300 leading-tight">{bank.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wallets Tab */}
          {activeTab === 'wallet' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-dark-300 block mb-2">Choose Wallet</label>
              <div className="space-y-2">
                {wallets.map(w => (
                  <button
                    key={w.id}
                    onClick={() => handlePay()}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r ${w.color} text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-md`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{w.emoji}</span>
                      <span>{w.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pay Button Footer */}
        <div className="px-5 pb-5 space-y-3">
          {activeTab !== 'wallet' && (
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-60"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{amount} Securely</span>
                </>
              )}
            </button>
          )}
          <div className="flex items-center justify-center space-x-1 text-[9px] text-slate-400">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Secured by Razorpay · SSL Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main Payment Page
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

  // Simulation mode = no real key configured
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

  // Real Razorpay checkout (when live/test key is set)
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
      theme: { color: '#6366f1' },
      modal: { ondismiss: () => setLoading(false) },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Called after demo modal succeeds
  const handleDemoPaymentSuccess = async () => {
    setShowDemoModal(false);
    setLoading(true);
    setError('');
    try {
      const randomId = Math.random().toString(36).substr(2, 9);
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
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    setTimeout(() => navigate(`/ticket/${ticketId}`), 2000);
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-dark-950 transition-colors duration-200 bg-grid-mesh relative">

      {/* Demo Modal Overlay */}
      {showDemoModal && (
        <DemoCheckoutModal
          amount={eventPrice}
          eventTitle={eventTitle}
          onSuccess={handleDemoPaymentSuccess}
          onClose={() => setShowDemoModal(false)}
        />
      )}

      <div className="w-full max-w-md space-y-8 relative z-10">

        {/* Header */}
        <div className="text-center">
          <span className="text-4xl inline-block bg-white dark:bg-dark-900 p-3 rounded-2xl shadow-md border border-slate-200 dark:border-dark-800">💳</span>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-800 dark:text-dark-100 font-display">
            Secure Checkout
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-dark-400">
            Confirm your booking details and complete payment
          </p>
        </div>

        {/* Payment Summary Panel */}
        <div className="glass-panel p-8 rounded-2xl border border-slate-200 dark:border-dark-800 shadow-xl space-y-6">

          {error && (
            <div className="flex items-center space-x-2 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/40 p-3 rounded-lg text-rose-500 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex flex-col items-center text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl space-y-2 border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 animate-bounce" />
              <span className="font-bold text-sm">Payment Successful!</span>
              <span className="text-[10px] text-slate-400">Redirecting to your entry pass...</span>
            </div>
          )}

          {!success && (
            <div className="space-y-6">
              {/* Order Breakup */}
              <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-xl border border-slate-100 dark:border-dark-800 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-dark-200 font-display">
                  Booking Summary
                </h4>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-dark-400 font-medium">1x Entry Pass ({eventTitle})</span>
                  <span className="font-bold text-slate-700 dark:text-dark-300">₹{eventPrice}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 dark:text-dark-400 font-medium">Platform Fee</span>
                  <span className="font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded">FREE</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-dark-800 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-800 dark:text-dark-100">Total Payable</span>
                  <span className="text-lg font-extrabold text-primary-600 dark:text-primary-400 flex items-center font-display">
                    <IndianRupee className="w-4 h-4 mr-0.5" />
                    {eventPrice}
                  </span>
                </div>
              </div>

              {/* Secure badge */}
              <div className="flex items-center text-[10px] text-slate-400 justify-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Encrypted 256-bit payment verified by Razorpay</span>
              </div>

              {/* Action Buttons */}
              {isSimulationMode ? (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-lg text-amber-700 dark:text-amber-400 text-center text-[10px] font-semibold">
                    🔒 Demo Sandbox Mode — Razorpay test key not configured. Use the demo checkout below.
                  </div>

                  {/* Payment method quick-select chips */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'UPI', icon: '📱' },
                      { label: 'Card', icon: '💳' },
                      { label: 'Net Banking', icon: '🏦' },
                      { label: 'Wallet', icon: '👛' },
                    ].map(m => (
                      <button
                        key={m.label}
                        onClick={() => setShowDemoModal(true)}
                        className="flex flex-col items-center p-2 rounded-xl border-2 border-slate-200 dark:border-dark-700 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all group"
                      >
                        <span className="text-xl">{m.icon}</span>
                        <span className="text-[9px] font-semibold text-slate-500 dark:text-dark-400 group-hover:text-indigo-600 mt-0.5">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowDemoModal(true)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-500/25"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  className="w-full btn-primary py-3.5 text-sm font-bold flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
