import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/navigation/Navbar';
import { DynamicFooter } from '../components/DynamicFooter';
import { SEO } from '../components/SEO';
import { Badge, Button } from '../components/ui';
import toast from 'react-hot-toast';

export default function SupportContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitted(true);
    toast.success('Your ticket has been submitted to Edulpha Support!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <SEO title="Support Centre & Contact Us | Edulpha" description="Get in touch with Edulpha support for account assistance, payment queries, or school partnerships." />
      <Navbar />

      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 px-3 py-1 text-xs uppercase font-black">
            24/7 SUPPORT DESK
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black">Contact & Support Centre</h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            We are here to help you get the most out of your Edulpha revision experience.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2">
            <Mail className="mx-auto text-indigo-500" size={28} />
            <h3 className="font-bold text-sm">Email Support</h3>
            <p className="text-xs text-slate-500">support@edulpha.com</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2">
            <Phone className="mx-auto text-emerald-500" size={28} />
            <h3 className="font-bold text-sm">WhatsApp / Call Desk</h3>
            <p className="text-xs text-slate-500">+237 600 000 000 / +234 800 000 000</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center space-y-2">
            <MapPin className="mx-auto text-sky-500" size={28} />
            <h3 className="font-bold text-sm">Headquarters</h3>
            <p className="text-xs text-slate-500">Douala & Yaoundé, Cameroon</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-2xl mx-auto space-y-6 shadow-xs">
          <h2 className="text-xl font-bold">Send Support Message</h2>
          {submitted ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-2xl text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
              <h3 className="font-bold text-sm">Thank You!</h3>
              <p className="text-xs">Your inquiry has been logged. An Edulpha representative will reach out shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. MoMo Subscription issue, School partnership"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <Button type="submit" className="bg-indigo-600 text-white font-bold w-full py-3 rounded-xl flex items-center justify-center gap-2">
                <Send size={14} />
                <span>Submit Ticket</span>
              </Button>
            </form>
          )}
        </div>
      </section>

      <DynamicFooter />
    </div>
  );
}
