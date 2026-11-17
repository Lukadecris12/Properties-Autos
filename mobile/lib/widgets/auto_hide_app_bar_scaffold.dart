import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// A drop-in replacement for [Scaffold] whose top [appBar] and any
/// [AutoHideCollapsibleSection] smoothly slide and fade completely off the top
/// of the screen while scrolling, leaving 0px of header behind and never
/// resizing the underlying scroll viewport (keeping scrolling at 60/120fps).
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
  final ValueNotifier<bool> _visibleNotifier = ValueNotifier<bool>(true);
  bool _pointerDown = false;
  bool _isScrolling = false;
  Timer? _restoreTimer;

  @override
  void dispose() {
    _restoreTimer?.cancel();
    _visibleNotifier.dispose();
    super.dispose();
  }

  void _hideHeader() {
    _restoreTimer?.cancel();
    if (_visibleNotifier.value) {
      _visibleNotifier.value = false;
    }
  }

  void _scheduleRestore() {
    _restoreTimer?.cancel();
    if (_pointerDown || _isScrolling) return;
    _restoreTimer = Timer(const Duration(milliseconds: 220), () {
      if (!_pointerDown && !_isScrolling && !_visibleNotifier.value && mounted) {
        _visibleNotifier.value = true;
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
      final delta = notification.scrollDelta ?? 0.0;
      if (notification.dragDetails != null || delta.abs() > 1.5) {
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
    // If nested inside an outer AutoHideAppBarScaffold without its own appBar,
    // avoid creating a second competing scroll listener / scaffold.
    final parentScope = AutoHideHeaderScope.maybeOf(context);
    if (parentScope != null && widget.appBar == null && widget.bottomNavigationBar == null) {
      return ColoredBox(
        color: widget.backgroundColor ?? const Color(0xFF0B0F19),
        child: widget.body,
      );
    }

    final mq = MediaQuery.of(context);
    final topPadding = mq.padding.top;
    final bar = widget.appBar;
    final barHeight = bar?.preferredSize.height ?? 0.0;
    final topOffset = bar != null ? (topPadding + barHeight) : topPadding;
    final barBg = (bar is AppBar && bar.backgroundColor != null && bar.backgroundColor != Colors.transparent)
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
            visibleListenable: _visibleNotifier,
            topOffset: topOffset,
            child: Stack(
              children: [
                // Full-screen body from y=0 so content scrolls into the entire top area
                // with zero dark bar left behind and zero viewport height changes.
                Positioned.fill(
                  child: MediaQuery(
                    data: mq.copyWith(
                      padding: mq.padding.copyWith(top: topOffset),
                    ),
                    child: RepaintBoundary(child: widget.body),
                  ),
                ),
                if (bar != null)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    height: topOffset,
                    child: ValueListenableBuilder<bool>(
                      valueListenable: _visibleNotifier,
                      builder: (context, visible, child) {
                        return IgnorePointer(
                          ignoring: !visible,
                          child: AnimatedSlide(
                            offset: visible ? Offset.zero : const Offset(0, -1.1),
                            duration: const Duration(milliseconds: 200),
                            curve: Curves.easeOutCubic,
                            child: AnimatedOpacity(
                              opacity: visible ? 1.0 : 0.0,
                              duration: const Duration(milliseconds: 170),
                              curve: Curves.easeOutCubic,
                              child: child,
                            ),
                          ),
                        );
                      },
                      child: Container(
                        color: barBg,
                        child: bar,
                      ),
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

/// Provides the header visibility listenable and static top offset to descendants
/// without rebuilding the scaffold body when visibility changes.
class AutoHideHeaderScope extends InheritedWidget {
  final ValueListenable<bool> visibleListenable;
  final double topOffset;

  const AutoHideHeaderScope({
    super.key,
    required this.visibleListenable,
    required this.topOffset,
    required super.child,
  });

  static AutoHideHeaderScope? maybeOf(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AutoHideHeaderScope>();
  }

  static ValueListenable<bool>? listenableOf(BuildContext context) {
    return maybeOf(context)?.visibleListenable;
  }

  static double topOffsetOf(BuildContext context) {
    return maybeOf(context)?.topOffset ?? MediaQuery.of(context).padding.top;
  }

  @override
  bool updateShouldNotify(AutoHideHeaderScope oldWidget) {
    return oldWidget.visibleListenable != visibleListenable ||
        oldWidget.topOffset != topOffset;
  }
}

/// Smoothly slides and fades its [child] completely off the top of the screen
/// in sync with [AutoHideAppBarScaffold], leaving no dark header strip behind.
class AutoHideCollapsibleSection extends StatelessWidget {
  final Widget child;

  const AutoHideCollapsibleSection({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final listenable = AutoHideHeaderScope.listenableOf(context);
    if (listenable == null) return child;

    return ValueListenableBuilder<bool>(
      valueListenable: listenable,
      builder: (context, visible, staticChild) {
        return IgnorePointer(
          ignoring: !visible,
          child: AnimatedSlide(
            offset: visible ? Offset.zero : const Offset(0, -2.0),
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOutCubic,
            child: AnimatedOpacity(
              opacity: visible ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 170),
              curve: Curves.easeOutCubic,
              child: staticChild,
            ),
          ),
        );
      },
      child: RepaintBoundary(child: child),
    );
  }
}

/// For Column-based screens: adds the initial AppBar top offset and collapses
/// both the offset and [child] to 0px height when scrolling.
class AutoHideTopBar extends StatelessWidget {
  final Widget child;

  const AutoHideTopBar({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final listenable = AutoHideHeaderScope.listenableOf(context);
    final topOffset = AutoHideHeaderScope.topOffsetOf(context);
    final content = Padding(
      padding: EdgeInsets.only(top: topOffset),
      child: child,
    );
    if (listenable == null) return content;

    return ValueListenableBuilder<bool>(
      valueListenable: listenable,
      builder: (context, visible, staticChild) {
        return IgnorePointer(
          ignoring: !visible,
          child: ClipRect(
            child: AnimatedAlign(
              alignment: Alignment.topCenter,
              heightFactor: visible ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeOutCubic,
              child: AnimatedOpacity(
                opacity: visible ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 160),
                curve: Curves.easeOutCubic,
                child: staticChild,
              ),
            ),
          ),
        );
      },
      child: RepaintBoundary(child: content),
    );
  }
}
