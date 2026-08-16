import React from 'react';
import { Download, Printer, CheckCircle2, ShieldCheck, X, FileText, Calendar, CreditCard, User, Building } from 'lucide-react';
import { PaymentReceipt } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PaymentReceiptModalProps {
  receipt: PaymentReceipt;
  onClose: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({ receipt, onClose }) => {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden my-8 max-h-[calc(100dvh-2rem)] overflow-y-auto">
        {/* Top Header bar */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <FileText size={22} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Official Payment Receipt</h3>
              <p className="text-xs text-slate-400">Receipt No: <span className="font-mono text-indigo-300 font-bold">{receipt.receiptNumber}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-8 space-y-6 text-slate-800 print:p-0" id="receipt-print-area">
          {/* Company Branding & Status */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
            <div>
              <h1 className="text-2xl font-black text-indigo-950 tracking-tight">{receipt.companyName}</h1>
              <p className="text-xs font-semibold text-slate-500">Vertexon Technologies Academic Platform</p>
              <p className="text-xs text-slate-400 mt-0.5">{receipt.companyContact}</p>
            </div>
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full font-bold text-xs border border-emerald-200">
              <CheckCircle2 size={16} /> Payment Verified & Paid
            </div>
          </div>

          {/* Key Transaction Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Student Name</span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <User size={14} className="text-indigo-600" /> {receipt.studentName}
              </span>
              <span className="text-[11px] text-slate-500 block">{receipt.studentEmail}</span>
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Transaction ID</span>
              <span className="font-mono font-bold text-slate-900 text-xs block mt-0.5">{receipt.transactionId}</span>
              <span className="text-[11px] text-slate-500 block mt-1 font-semibold">{receipt.paymentMethod}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Description / Plan</th>
                  <th className="p-3 text-center">Billing Cycle</th>
                  <th className="p-3 text-right">Amount Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{receipt.planName}</div>
                    <div className="text-[11px] text-slate-500">Full access to subjects, mock exams & AI tutor</div>
                  </td>
                  <td className="p-3 text-center capitalize">{receipt.planName.toLowerCase().includes('annual') ? 'Annual' : 'Monthly'}</td>
                  <td className="p-3 text-right font-bold text-slate-900">{receipt.amountPaid.toLocaleString()} {receipt.currency}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dates & Totals */}
          <div className="flex justify-between items-end pt-2">
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={14} className="text-indigo-500" />
                <span>Payment Date: <strong>{receipt.date}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={14} className="text-emerald-500" />
                <span>Subscription Expiry: <strong>{receipt.expiryDate}</strong></span>
              </div>
            </div>

            <div className="text-right bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
              <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest block">Total Amount</span>
              <span className="text-2xl font-black text-indigo-700">{receipt.amountPaid.toLocaleString()} {receipt.currency}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
            <p className="flex items-center justify-center gap-1 font-bold text-slate-500">
              <ShieldCheck size={14} className="text-indigo-600" /> Official Edulpha Electronic Receipt
            </p>
            <p>Thank you for studying with Edulpha. For billing inquiries, contact support.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs flex items-center gap-2"
          >
            <Printer size={15} /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};
