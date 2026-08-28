import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme.dart';

/// Bottom-nav shell wrapping Home / Library / Profile.
/// Admin tab intentionally omitted — client manages content via Glide web admin.
class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.child});

  final Widget child;

  static const _tabs = [
    _NavTab(label: 'Home',    icon: Icons.home_outlined,    activeIcon: Icons.home,           path: '/'),
    _NavTab(label: 'Library', icon: Icons.book_outlined,    activeIcon: Icons.book,           path: '/library'),
    _NavTab(label: 'Profile', icon: Icons.person_outline,   activeIcon: Icons.person,         path: '/profile'),
  ];

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).uri.toString();
    if (loc.startsWith('/library')) return 1;
    if (loc.startsWith('/profile')) return 2;
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final idx = _currentIndex(context);
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: idx,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        indicatorColor: DHColors.sageMist,
        height: 60,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        onDestinationSelected: (i) => context.go(_tabs[i].path),
        destinations: [
          for (final t in _tabs)
            NavigationDestination(
              icon: Icon(t.icon, color: DHColors.mossGreen, size: 22),
              selectedIcon:
                  Icon(t.activeIcon, color: DHColors.forestGreen, size: 22),
              label: t.label,
            ),
        ],
      ),
    );
  }
}

class _NavTab {
  const _NavTab({
    required this.label,
    required this.icon,
    required this.activeIcon,
    required this.path,
  });
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String path;
}
