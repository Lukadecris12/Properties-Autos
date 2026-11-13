import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AIChatScreen extends StatefulWidget {
  final bool showAppBar;
  const AIChatScreen({Key? key, this.showAppBar = true}) : super(key: key);

  @override
  State<AIChatScreen> createState() => _AIChatScreenState();
}

class _ChatMessage {
  final bool isUser;
  final String text;

  _ChatMessage({required this.isUser, required this.text});
}

class _AIChatScreenState extends State<AIChatScreen> with WidgetsBindingObserver {
  final ApiService _apiService = ApiService();
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _inputFocusNode = FocusNode();
  final List<_ChatMessage> _messages = [
    _ChatMessage(
      isUser: false,
      text: "Hello! I am Properties & Autos AI. Ask me anything about Nigerian properties, land title verifications (like C of O and Governor's Consent), short-let apartment reservations, or automobile rentals.",
    ),
  ];
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _inputFocusNode.addListener(() {
      if (_inputFocusNode.hasFocus) {
        Future.delayed(const Duration(milliseconds: 250), _scrollToBottom);
      }
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _textController.dispose();
    _scrollController.dispose();
    _inputFocusNode.dispose();
    super.dispose();
  }

  @override
  void didChangeMetrics() {
    super.didChangeMetrics();
    _scrollToBottom();
  }

  void _sendMessage([String? quickQuery]) async {
    final text = quickQuery ?? _textController.text.trim();
    if (text.isEmpty || _loading) return;

    if (quickQuery == null) _textController.clear();

    final recent = _messages.length > 1 ? _messages.sublist(1) : <_ChatMessage>[];
    final sliced = recent.length > 10 ? recent.sublist(recent.length - 10) : recent;
    final history = sliced
        .map((m) => {'role': m.isUser ? 'user' : 'model', 'text': m.text})
        .toList();

    setState(() {
      _messages.add(_ChatMessage(isUser: true, text: text));
      _loading = true;
    });

    _scrollToBottom();

    try {
      final answer = await _apiService.queryAIConcierge(text, history: history);
      if (mounted) {
        setState(() {
          _messages.add(_ChatMessage(isUser: false, text: answer));
        });
        _scrollToBottom();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _messages.add(_ChatMessage(
            isUser: false,
            text: "I'm temporarily unable to reach the live AI intelligence engine. Please try again.",
          ));
        });
        _scrollToBottom();
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
        _scrollToBottom();
      }
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F19),
      appBar: widget.showAppBar
          ? AppBar(
              backgroundColor: const Color(0xFF111827),
              elevation: 0,
              title: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF059669),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.auto_awesome, color: Colors.white, size: 18),
                  ),
                  const SizedBox(width: 8),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Chat AI', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
                      Text('Marketplace Intelligence', style: TextStyle(fontSize: 10, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            )
          : null,
      body: Column(
        children: [
          // Quick suggestion chips
          Container(
            height: 46,
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _buildQuickChip("Explain C of O vs Governor's Consent"),
                _buildQuickChip("Find 3-bed short-let in Lekki"),
                _buildQuickChip("Toyota Land Cruiser rental rate"),
                _buildQuickChip("How AI Matching works"),
              ],
            ),
          ),

          // Message history
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),

          if (_loading)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 16),
              alignment: Alignment.centerLeft,
              child: const Row(
                children: [
                  SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF10B981)),
                  ),
                  SizedBox(width: 8),
                  Text('Chat AI is thinking...', style: TextStyle(color: Colors.grey, fontSize: 11)),
                ],
              ),
            ),

          // Input bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: const BoxDecoration(
              color: Color(0xFF111827),
              border: Border(top: BorderSide(color: Color(0xFF1F2937))),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF0B0F19),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFF374151)),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: TextField(
                        controller: _textController,
                        focusNode: _inputFocusNode,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: const InputDecoration(
                          hintText: 'Ask Chat AI anything...',
                          hintStyle: TextStyle(color: Colors.grey, fontSize: 12),
                          border: InputBorder.none,
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () => _sendMessage(),
                    icon: const Icon(Icons.send_rounded, color: Color(0xFF10B981)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickChip(String text) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ActionChip(
        backgroundColor: const Color(0xFF1F2937),
        label: Text(text, style: const TextStyle(color: Color(0xFF10B981), fontSize: 11)),
        onPressed: () => _sendMessage(text),
      ),
    );
  }

  Widget _buildMessageBubble(_ChatMessage msg) {
    return Align(
      alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          color: msg.isUser ? const Color(0xFF059669) : const Color(0xFF1E293B),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(msg.isUser ? 16 : 4),
            bottomRight: Radius.circular(msg.isUser ? 4 : 16),
          ),
        ),
        child: Text(
          msg.text,
          style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.4),
        ),
      ),
    );
  }
}
