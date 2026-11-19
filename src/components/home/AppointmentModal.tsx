import { useEffect, useState, type FormEvent } from 'react';
import { Check, X } from 'lucide-react';

export interface AppointmentModalProps {
  isOpen: boolean;
  initialNote?: string;
  onClose: () => void;
}

export function AppointmentModal({
  isOpen,
  initialNote = '',
  onClose,
}: AppointmentModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [atelier, setAtelier] = useState<'Mumbai — Kala Ghoda' | 'New Delhi — Mehrauli'>(
    'Mumbai — Kala Ghoda'
  );
  const [notes, setNotes] = useState(initialNote);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes(initialNote);
      setSubmitted(false);
    }
  }, [isOpen, initialNote]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setNotes('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#151112]/85 p-4 sm:p-6 backdrop-blur-sm"
      onClick={handleResetAndClose}
    >
      <div
        className="relative w-full max-w-lg border border-[#EDE4D8]/15 bg-[#191416] p-7 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleResetAndClose}
          aria-label="Close appointment dialog"
          className="absolute top-5 right-5 inline-flex h-10 w-10 items-center justify-center text-[#EDE4D8]/70 hover:text-[#EDE4D8] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B69A6A]"
        >
          <X className="h-4 w-4" />
        </button>

        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#B69A6A]/60 text-[#B69A6A]">
              <Check className="h-5 w-5" />
            </div>
            <h3 className="font-editorial mt-5 text-3xl font-light text-[#EDE4D8]">
              Private Appointment Requested
            </h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-[#EDE4D8]/75">
              Our client director at <span className="text-[#EDE4D8]">{atelier}</span> will reach
              out to <span className="text-[#EDE4D8]">{email}</span> within 24 hours to confirm
              your private viewing.
            </p>
            <button
              type="button"
              onClick={handleResetAndClose}
              className="mt-8 min-h-[46px] bg-[#641F2B] px-8 py-3 text-xs font-medium uppercase tracking-[0.22em] text-[#EDE4D8] hover:bg-[#7A2735] cursor-pointer"
            >
              Return to NOIR®
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.28em] text-[#B69A6A]">
              Private Viewing
            </p>
            <h3
              id="appointment-modal-title"
              className="font-editorial mt-2 text-3xl font-light text-[#EDE4D8]"
            >
              Reserve an Atelier Salon
            </h3>
            <p className="mt-2 text-sm font-light text-[#EDE4D8]/68">
              One-on-one consultations for bespoke menswear, womenswear, and bridal couture.
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="noir-client-name"
                  className="block text-[11px] uppercase tracking-[0.2em] text-[#EDE4D8]/65 mb-2"
                >
                  Full Name
                </label>
                <input
                  id="noir-client-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Mehta"
                  className="w-full border border-[#EDE4D8]/18 bg-[#151112] px-4 py-3 text-sm text-[#EDE4D8] placeholder:text-[#EDE4D8]/30 focus:border-[#B69A6A] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="noir-client-email"
                  className="block text-[11px] uppercase tracking-[0.2em] text-[#EDE4D8]/65 mb-2"
                >
                  Email Address
                </label>
                <input
                  id="noir-client-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@domain.com"
                  className="w-full border border-[#EDE4D8]/18 bg-[#151112] px-4 py-3 text-sm text-[#EDE4D8] placeholder:text-[#EDE4D8]/30 focus:border-[#B69A6A] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="noir-salon-select"
                  className="block text-[11px] uppercase tracking-[0.2em] text-[#EDE4D8]/65 mb-2"
                >
                  Preferred Salon
                </label>
                <select
                  id="noir-salon-select"
                  value={atelier}
                  onChange={(e) =>
                    setAtelier(e.target.value as 'Mumbai — Kala Ghoda' | 'New Delhi — Mehrauli')
                  }
                  className="w-full border border-[#EDE4D8]/18 bg-[#151112] px-4 py-3 text-sm text-[#EDE4D8] focus:border-[#B69A6A] focus:outline-none"
                >
                  <option value="Mumbai — Kala Ghoda">Mumbai — Kala Ghoda Flagship</option>
                  <option value="New Delhi — Mehrauli">New Delhi — Mehrauli Heritage Salon</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="noir-client-notes"
                  className="block text-[11px] uppercase tracking-[0.2em] text-[#EDE4D8]/65 mb-2"
                >
                  Piece or Consultation Notes
                </label>
                <textarea
                  id="noir-client-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={initialNote || 'Bespoke menswear fitting, bridal inquiry...'}
                  className="w-full border border-[#EDE4D8]/18 bg-[#151112] px-4 py-3 text-sm text-[#EDE4D8] placeholder:text-[#EDE4D8]/30 focus:border-[#B69A6A] focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] bg-[#641F2B] px-6 py-3.5 text-xs font-medium uppercase tracking-[0.24em] text-[#EDE4D8] transition-colors hover:bg-[#7A2735] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B69A6A]"
              >
                Confirm Request
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
