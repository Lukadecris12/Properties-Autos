import 'dart:async';
import 'package:flutter/material.dart';

/// A drop-in replacement for [Scaffold] whose top [appBar] smoothly fades out
/// and collapses while the user touches and scrolls vertically, then fades
/// back in when scrolling stops and the user lifts their finger.
/// [bottomNavigationBar] remains completely static at all times.
class AutoHideAppBarScaffold extends StatefulWidget {
  final Color? backgroundColor;
  final PreferredSizeWidget? appBar;
  final Widget body;
  final Widget? bottomNavigationBar;
  final Widget? floatingActionButton;
  final bool? resizeToAvoidBottomInset;

  const AutoHideAppBarScaffold({
    super.key,
    this.backgroundColor,
    this.appBar,
    required this.body,
    this.bottomNavigationBar,
    this.floatingActionButton,
    this.resizeToAvoidBottomInset,
  });

  @override
  State<AutoHideAppBarScaffold> createState() => _AutoHideAppBarScaffoldState();
}

class _AutoHideAppBarScaffoldState extends State<AutoHideAppBarScaffold> {
  bool _headerVisible = true;
  bool _pointerDown = false;
  Timer? _restoreTimer;

  @override
  void dispose() {
    _restoreTimer?.cancel();
    super.dispose();
  }

  void _hideHeader() {
    _restoreTimer?.cancel();
    if (_headerVisible && mounted) {
      setState(() => _headerVisible = false);
    }
  }

  void _scheduleRestore() {
    _restoreTimer?.cancel();
    if (_pointerDown) return;
    _restoreTimer = Timer(const Duration(milliseconds: 160), () {
      if (!_pointerDown && !_headerVisible && mounted) {
        setState(() => _headerVisible = true);
      }
    });
  }

  bool _onScrollNotification(ScrollNotification notification) {
    if (widget.appBar == null) return false;
    if (notification.metrics.axis != Axis.vertical) return false;

    if (notification is ScrollStartNotification) {
      if (notification.dragDetails != null) {
        _hideHeader();
      }
    } else if (notification is ScrollUpdateNotification) {
      if (notification.dragDetails != null || (notification.scrollDelta?.abs() ?? 0) > 1.5) {
        _hideHeader();
      }
    } else if (notification is ScrollEndNotification) {
      _scheduleRestore();
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final bar = widget.appBar;
    final barHeight = bar?.preferredSize.height ?? 0.0;
    final barBg = (bar is AppBar && bar.backgroundColor != null)
        ? bar.backgroundColor!
        : (widget.backgroundColor ?? const Color(0xFF111827));

    return Scaffold(
      backgroundColor: widget.backgroundColor,
      resizeToAvoidBottomInset: widget.resizeToAvoidBottomInset,
      floatingActionButton: widget.floatingActionButton,
      bottomNavigationBar: widget.bottomNavigationBar,
      body: Listener(
        behavior: HitTestBehavior.translucent,
        onPointerDown: (_) {
          _pointerDown = true;
          _restoreTimer?.cancel();
        },
        onPointerUp: (_) {
          _pointerDown = false;
          _scheduleRestore();
        },
        onPointerCancel: (_) {
          _pointerDown = false;
          _scheduleRestore();
        },
        child: NotificationListener<ScrollNotification>(
          onNotification: _onScrollNotification,
          child: Column(
            children: [
              if (bar != null)
                AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  curve: Curves.easeOutCubic,
                  height: _headerVisible ? (topPadding + barHeight) : topPadding,
                  color: barBg,
                  child: ClipRect(
                    child: OverflowBox(
                      alignment: Alignment.topCenter,
                      minHeight: topPadding + barHeight,
                      maxHeight: topPadding + barHeight,
                      child: AnimatedOpacity(
                        opacity: _headerVisible ? 1.0 : 0.0,
                        duration: const Duration(milliseconds: 180),
                        curve: Curves.easeOut,
                        child: SizedBox(
                          height: topPadding + barHeight,
                          child: bar,
                        ),
                      ),
                    ),
                  ),
                ),
              Expanded(
                child: MediaQuery.removePadding(
                  context: context,
                  removeTop: bar != null,
                  child: widget.body,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
