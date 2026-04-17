import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../services/api';

const STATES = { IDLE: 'idle', LOADING: 'loading', SUCCESS: 'success', ERROR: 'error' };

function DriveWallPage() {
  const [searchParams] = useSearchParams();
  const driveId = searchParams.get('drive');

  const [email, setEmail]         = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [state, setState]         = useState(STATES.IDLE);
  const [errorMsg, setErrorMsg]   = useState('');
  const [result, setResult]       = useState(null);
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect countdown after successful verification
  useEffect(() => {
    if (state !== STATES.SUCCESS || !result?.redirectUrl) return;
    if (countdown <= 0) {
      window.location.href = result.redirectUrl;
      return;
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [state, countdown, result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !accessKey.trim()) return;
    if (!driveId) {
      setErrorMsg('Invalid drive link. Please use the link from your inbox message.');
      setState(STATES.ERROR);
      return;
    }

    setState(STATES.LOADING);
    setErrorMsg('');

    try {
      const response = await apiRequest('/drives/verify-access', {
        method: 'POST',
        body: JSON.stringify({
          email:     email.trim().toLowerCase(),
          accessKey: accessKey.trim().toUpperCase(),
          driveId:   parseInt(driveId, 10),
        }),
      });

      if (response.success) {
        setResult(response);
        setState(STATES.SUCCESS);
        setCountdown(5);
      } else {
        setErrorMsg(response.message || 'Verification failed. Please check your email and access key.');
        setState(STATES.ERROR);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error. Please try again.');
      setState(STATES.ERROR);
    }
  };

  // Format access key input: auto-uppercase + insert dash after 4 chars
  const handleKeyInput = (e) => {
    let val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (val.length > 4) val = val.slice(0, 4) + '-' + val.slice(4, 8);
    setAccessKey(val);
  };

  return (
    <div className="min-h-screen bg-[#0f0f12] flex flex-col items-center justify-center px-4">
      {/* Logo strip */}
      <div className="mb-10 text-center">
        <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-2">Placement Portal</p>
        <h1 className="text-2xl font-bold text-zinc-100">Drive Access Wall</h1>
        <p className="text-zinc-500 text-sm mt-2">Enter the credentials from your inbox message to proceed.</p>
      </div>

      <div className="w-full max-w-md">
        {/* Top accent bar */}
        <div className="h-0.5 bg-gradient-to-r from-[#f7b545] via-[#ffd37a] to-[#f7b545] mb-0" />

        <div className="border border-[#2f2f36] bg-[#1a1a1f] p-8">

          {/* ── SUCCESS STATE ── */}
          {state === STATES.SUCCESS && (
            <div className="text-center space-y-5">
              <div className="w-14 h-14 mx-auto bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-zinc-100">Access Verified</h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Your application for <span className="text-zinc-200 font-medium">{result?.company}</span>{' '}
                  — <span className="text-zinc-200 font-medium">{result?.role}</span> has been recorded.
                </p>
              </div>

              {result?.redirectUrl ? (
                <div className="border border-[#2f2f36] bg-[#23232a] p-4 text-sm text-zinc-300 space-y-3">
                  <p>You will be redirected to the company application form in <span className="text-[#f7b545] font-bold">{countdown}s</span>.</p>
                  <a
                    href={result.redirectUrl}
                    className="block w-full text-center bg-[#f7b545] text-[#1a1a1f] py-2.5 text-sm font-bold hover:bg-[#f9c46c] transition-colors"
                  >
                    Go Now →
                  </a>
                </div>
              ) : (
                <div className="border border-[#2f2f36] bg-[#23232a] p-4 text-sm text-zinc-400">
                  Your application has been submitted. The placement cell will contact you with next steps.
                </div>
              )}
            </div>
          )}

          {/* ── FORM STATE ── */}
          {state !== STATES.SUCCESS && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Registered Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@college.edu"
                  required
                  disabled={state === STATES.LOADING}
                  className="w-full bg-[#24242b] border border-[#363640] text-zinc-100 px-4 py-3 text-sm outline-none focus:border-[#f7b545] placeholder:text-zinc-600 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Access Key
                  <span className="ml-2 font-normal text-zinc-600 normal-case tracking-normal">(from your inbox message)</span>
                </label>
                <input
                  type="text"
                  value={accessKey}
                  onChange={handleKeyInput}
                  placeholder="XXXX-XXXX"
                  maxLength={9}
                  required
                  disabled={state === STATES.LOADING}
                  className="w-full bg-[#24242b] border border-[#363640] text-zinc-100 px-4 py-3 text-sm outline-none focus:border-[#f7b545] placeholder:text-zinc-600 font-mono tracking-widest uppercase disabled:opacity-50"
                />
              </div>

              {/* Error message */}
              {state === STATES.ERROR && (
                <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={state === STATES.LOADING || !email || !accessKey}
                className="w-full bg-[#f7b545] text-[#1a1a1f] py-3 text-sm font-bold tracking-wide hover:bg-[#f9c46c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {state === STATES.LOADING ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify & Apply'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Access keys are sent only to eligible students via the placement portal inbox.
          If you did not receive a key, contact your placement coordinator.
        </p>
      </div>
    </div>
  );
}

export default DriveWallPage;
