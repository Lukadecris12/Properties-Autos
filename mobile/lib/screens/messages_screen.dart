import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../services/api_service.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({Key? key}) : super(key: key);

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _conversations = [];
  bool _loading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadConversations();
  }

  void _loadConversations() async {
    setState(() => _loading = true);
    final convs = await _apiService.fetchConversations();
    setState(() {
      _conversations = convs;
      _loading = false;
    });
  }

  void _launchUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  void _openChatModal(Map<String, dynamic> conv) {
    final partner = conv['participant_1'] ?? {};
    final partnerName = partner['company_name'] ?? 
        '${partner['first_name'] ?? ''} ${partner['last_name'] ?? ''}'.trim();
    final displayName = partnerName.isNotEmpty ? partnerName : 'Properties & Autos Partner';
    final phone = partner['phone_number'] ?? '+234 803 123 4567';
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final waPhone = cleanPhone.startsWith('0') ? '234${cleanPhone.substring(1)}' : (cleanPhone.isNotEmpty ? cleanPhone : '2348031234567');
    final waUrl = 'https://wa.me/$waPhone?text=${Uri.encodeComponent('Hello $displayName, I am following up on our conversation on Properties & Autos.')}';
    final telUrl = 'tel:$cleanPhone';

    final textController = TextEditingController();
    List messages = List.from(conv['messages'] ?? []);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF111827),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: SizedBox(
                height: MediaQuery.of(context).size.height * 0.8,
                child: Column(
                  children: [
                    // Handle Bar
                    Container(
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      height: 4,
                      width: 40,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade700,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),

                    // Chat Header
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: const BoxDecoration(
                        border: Border(bottom: BorderSide(color: Color(0xFF1F2937))),
                      ),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 18,
                            backgroundColor: const Color(0xFF059669),
                            child: Text(
                              displayName.isNotEmpty ? displayName[0].toUpperCase() : 'P',
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  displayName,
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                Row(
                                  children: [
                                    Container(
                                      width: 6,
                                      height: 6,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFF10B981),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    const SizedBox(width: 4),
                                    const Text('Online • Verified Agent', style: TextStyle(color: Colors.grey, fontSize: 10)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          // Fast Connect Buttons
                          IconButton(
                            icon: const Icon(Icons.chat, color: Color(0xFF25D366), size: 20),
                            tooltip: 'Chat on WhatsApp',
                            onPressed: () => _launchUrl(waUrl),
                          ),
                          IconButton(
                            icon: const Icon(Icons.call, color: Color(0xFF10B981), size: 20),
                            tooltip: 'Call Phone',
                            onPressed: () => _launchUrl(telUrl),
                          ),
                        ],
                      ),
                    ),

                    // Messages List
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: messages.length,
                        itemBuilder: (context, idx) {
                          final msg = messages[idx];
                          final isMe = msg['sender_id'] != 2; // Simulated: partner id is 2
                          return Align(
                            alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 10),
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                              constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                              decoration: BoxDecoration(
                                color: isMe ? const Color(0xFF059669) : const Color(0xFF1F2937),
                                borderRadius: BorderRadius.only(
                                  topLeft: const Radius.circular(14),
                                  topRight: const Radius.circular(14),
                                  bottomLeft: Radius.circular(isMe ? 14 : 2),
                                  bottomRight: Radius.circular(isMe ? 2 : 14),
                                ),
                              ),
                              child: Text(
                                msg['content'] ?? '',
                                style: const TextStyle(color: Colors.white, fontSize: 12, height: 1.3),
                              ),
                            ),
                          );
                        },
                      ),
                    ),

                    // Input Box
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: const BoxDecoration(
                        color: Color(0xFF0F1523),
                        border: Border(top: BorderSide(color: Color(0xFF1F2937))),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: textController,
                              style: const TextStyle(color: Colors.white, fontSize: 12),
                              decoration: InputDecoration(
                                hintText: 'Type your message...',
                                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                                filled: true,
                                fillColor: const Color(0xFF0B0F19),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(20),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          CircleAvatar(
                            radius: 20,
                            backgroundColor: const Color(0xFF10B981),
                            child: IconButton(
                              icon: const Icon(Icons.send, color: Colors.white, size: 16),
                              onPressed: () async {
                                final text = textController.text.trim();
                                if (text.isEmpty) return;

                                textController.clear();
                                setModalState(() {
                                  messages.add({
                                    'id': DateTime.now().millisecondsSinceEpoch,
                                    'sender_id': 1,
                                    'content': text,
                                    'created_at': DateTime.now().toIso8601String(),
                                  });
                                });

                                await _apiService.sendMessage({
                                  'conversation_id': conv['id'],
                                  'content': text,
                                });
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _conversations.where((c) {
      final partner = c['participant_1'] ?? {};
      final name = '${partner['company_name'] ?? ''} ${partner['first_name'] ?? ''} ${partner['last_name'] ?? ''}'.toLowerCase();
      final subject = (c['subject'] ?? '').toString().toLowerCase();
      return name.contains(_searchQuery.toLowerCase()) || subject.contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: AppBar(
        backgroundColor: const Color(0xFF111827),
        elevation: 0,
        title: const Text(
          'Direct Messages',
          style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white, size: 20),
            onPressed: _loadConversations,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Input
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            color: const Color(0xFF111827),
            child: TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(color: Colors.white, fontSize: 12),
              decoration: InputDecoration(
                hintText: 'Search chats & property inquiries...',
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                prefixIcon: const Icon(Icons.search, color: Colors.grey, size: 18),
                filled: true,
                fillColor: const Color(0xFF0B0F19),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Conversation List
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981)))
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.forum_outlined, size: 48, color: Colors.grey.shade600),
                            const SizedBox(height: 12),
                            const Text('No direct conversations yet', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 6),
                            const Text('Inquire on any property or vehicle listing to start chatting directly.', style: TextStyle(color: Colors.grey, fontSize: 11), textAlign: TextAlign.center),
                          ],
                        ),
                      )
                    : ListView.separated(
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const Divider(color: Color(0xFF1F2937), height: 1),
                        itemBuilder: (context, index) {
                          final conv = filtered[index];
                          final partner = conv['participant_1'] ?? {};
                          final partnerName = partner['company_name'] ??
                              '${partner['first_name'] ?? ''} ${partner['last_name'] ?? ''}'.trim();
                          final displayName = partnerName.isNotEmpty ? partnerName : 'Properties & Autos Partner';
                          final subject = conv['subject'] ?? 'Direct Inquiry';
                          final lastMsg = (conv['messages'] != null && (conv['messages'] as List).isNotEmpty)
                              ? (conv['messages'] as List).last['content']
                              : 'Tap to open chat';

                          return ListTile(
                            onTap: () => _openChatModal(conv),
                            leading: CircleAvatar(
                              radius: 20,
                              backgroundColor: const Color(0xFF064E3B),
                              child: Text(
                                displayName.isNotEmpty ? displayName[0].toUpperCase() : 'P',
                                style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                            ),
                            title: Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    displayName,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF064E3B),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: const Text('VERIFIED', style: TextStyle(color: Color(0xFF34D399), fontSize: 9, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const SizedBox(height: 2),
                                Text(
                                  subject,
                                  style: const TextStyle(color: Color(0xFF10B981), fontSize: 11, fontWeight: FontWeight.w600),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  lastMsg,
                                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                            trailing: const Icon(Icons.chevron_right, color: Colors.grey, size: 18),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
