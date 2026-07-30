import 'package:flutter/material.dart';
import '../models/user_profile.dart';
import '../services/firestore_service.dart';

class PaymentScreen extends StatefulWidget {
  final UserProfile user;
  final FirestoreService firestoreService;

  const PaymentScreen({
    Key? key,
    required this.user,
    required this.firestoreService,
  }) : super(key: key);

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String selectedNetwork = 'MTN';
  final _txnIdController = TextEditingController();
  final _codeController = TextEditingController();
  bool isSubmitting = false;

  Future<void> _handlePayment() async {
    if (_txnIdController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please enter the Mobile Money Transaction ID")),
      );
      return;
    }

    setState(() => isSubmitting = true);
    try {
      await widget.firestoreService.submitPaymentRequest(
        userId: widget.user.uid,
        amount: 1000,
        transactionId: _txnIdController.text.trim(),
        network: selectedNetwork,
        paymentCode: _codeController.text.trim(),
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Payment submitted successfully! Pending admin approval.")),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error submitting payment: $e")),
      );
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool isPaid = widget.user.paymentStatus == 'paid';
    final bool isPending = widget.user.paymentStatus == 'pending';

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
        title: const Text(
          "Premium Subscription",
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (isPaid)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF10B981).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF10B981)),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.check_circle_rounded, color: Color(0xFF34D399), size: 36),
                    SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        "Your GradeBoost60 account is Fully Activated! Enjoy unlimited GCE practice.",
                        style: TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              )
            else if (isPending)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFFF59E0B).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFF59E0B)),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.hourglass_top_rounded, color: Color(0xFFFBBF24), size: 36),
                    SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        "Your Mobile Money payment is currently under verification by admin.",
                        style: TextStyle(color: Color(0xFFFBBF24), fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ],
                ),
              )
            else ...[
              // Pricing header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4F46E5), Color(0xFF6366F1)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  children: const [
                    Text(
                      "60-DAY GCE PREP PASS",
                      style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
                    ),
                    SizedBox(height: 8),
                    Text(
                      "1,000 FCFA",
                      style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.black),
                    ),
                    SizedBox(height: 4),
                    Text(
                      "One-Time Payment for Full Season Access",
                      style: TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text(
                "PAYMENT INSTRUCTIONS (CAMEROON)",
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
              const SizedBox(height: 12),

              // MoMo Details box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  children: [
                    _momoInfoTile("MTN Mobile Money", "677 123 456", Colors.amber),
                    const Divider(color: Color(0xFF334155), height: 24),
                    _momoInfoTile("Orange Money", "699 123 456", Colors.deepOrange),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Form
              const Text(
                "SUBMIT TRANSACTION PROOF",
                style: TextStyle(color: Color(0xFF94A3B8), fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: RadioListTile<String>(
                      title: const Text("MTN MoMo", style: TextStyle(color: Colors.white, fontSize: 14)),
                      value: 'MTN',
                      groupValue: selectedNetwork,
                      activeColor: const Color(0xFF4F46E5),
                      onChanged: (val) => setState(() => selectedNetwork = val!),
                    ),
                  ),
                  Expanded(
                    child: RadioListTile<String>(
                      title: const Text("Orange Money", style: TextStyle(color: Colors.white, fontSize: 14)),
                      value: 'Orange',
                      groupValue: selectedNetwork,
                      activeColor: const Color(0xFF4F46E5),
                      onChanged: (val) => setState(() => selectedNetwork = val!),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              TextField(
                controller: _txnIdController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: "Transaction ID (e.g. 1294810283)",
                  labelStyle: const TextStyle(color: Color(0xFF94A3B8)),
                  filled: true,
                  fillColor: const Color(0xFF1E293B),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: isSubmitting ? null : _handlePayment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4F46E5),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: isSubmitting
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text("CONFIRM PAYMENT", style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              )
            ]
          ],
        ),
      ),
    );
  }

  Widget _momoInfoTile(String title, String number, Color color) {
    return Row(
      children: [
        Icon(Icons.phone_android_rounded, color: color, size: 28),
        const SizedBox(width: 14),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
            const SizedBox(height: 2),
            Text("Send 1,000 FCFA to: $number", style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
          ],
        )
      ],
    );
  }
}
