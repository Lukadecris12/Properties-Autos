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
  bool _isScrolling = false;
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
    if (_pointerDown || _isScrolling) return;
    _restoreTimer = Timer(const Duration(milliseconds: 200), () {
      if (!_pointerDown && !_isScrolling && !_headerVisible && mounted) {
        setState(() => _headerVisible = true);
      }
    });
  }

  bool _onScrollNotification(ScrollNotification notification) {
    if (notification.metrics.axis != Axis.vertical) return false;

    if (notification is ScrollStartNotification) {
      _isScrolling = true;
      if (notification.dragDetails != null) {
        _hideHeader();
      }
    } else if (notification is ScrollUpdateNotification) {
      if (notification.dragDetails != null) {
        _hideHeader();
      }
    } else if (notification is ScrollEndNotification) {
      _isScrolling = false;
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
          child: AutoHideHeaderScope(
            isHeaderVisible: _headerVisible,
            child: Column(
              children: [
                if (bar != null)
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 240),
                    curve: Curves.easeInOutCubic,
                    height: _headerVisible ? (topPadding + barHeight) : topPadding,
                    color: barBg,
                    child: ClipRect(
                      child: OverflowBox(
                        alignment: Alignment.topCenter,
                        minHeight: topPadding + barHeight,
                        maxHeight: topPadding + barHeight,
                        child: AnimatedOpacity(
                          opacity: _headerVisible ? 1.0 : 0.0,
                          duration: const Duration(milliseconds: 220),
                          curve: Curves.easeInOutCubic,
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
      ),
    );
  }
}

/// Provides the current header visibility state from [AutoHideAppBarScaffold]
/// to descendant widgets such as [AutoHideCollapsibleSection].
class AutoHideHeaderScope extends InheritedWidget {
  final bool isHeaderVisible;

  const AutoHideHeaderScope({
    super.key,
    required this.isHeaderVisible,
    required super.child,
  });

  static bool isVisibleOf(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AutoHideHeaderScope>();
    return scope?.isHeaderVisible ?? true;
  }

  @override
  bool updateShouldNotify(AutoHideHeaderScope oldWidget) {
    return oldWidget.isHeaderVisible != isHeaderVisible;
  }
}

/// Smoothly fades and slides out its [child] in sync with [AutoHideAppBarScaffold]
/// without resizing the underlying scrollable viewport, keeping scrolling smooth.
class AutoHideCollapsibleSection extends StatelessWidget {
  final Widget child;

  const AutoHideCollapsibleSection({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final visible = AutoHideHeaderScope.isVisibleOf(context);
    return IgnorePointer(
      ignoring: !visible,
      child: AnimatedSlide(
        offset: visible ? Offset.zero : const Offset(0, -0.2),
        duration: const Duration(milliseconds: 240),
        curve: Curves.easeInOutCubic,
        child: AnimatedOpacity(
          opacity: visible ? 1.0 : 0.0,
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeInOutCubic,
          child: child,
        ),
      ),
    );
  }
}
