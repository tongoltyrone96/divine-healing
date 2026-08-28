import 'package:flutter/material.dart';
import '../../theme.dart';

class LibraryScreen extends StatelessWidget {
  const LibraryScreen({super.key, this.category});
  final String? category;

  static const _filters = [
    (label: 'All',            slug: null),
    (label: 'Meditations',    slug: 'meditation'),
    (label: 'Shadow Work',    slug: 'shadow_work'),
    (label: 'Chakra Healing', slug: 'chakra_healing'),
    (label: 'Reiki',          slug: 'reiki'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Library')),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            color: DHColors.softSage.withOpacity(0.3),
            child: Text(
              "You're viewing free preview content. Subscribe to unlock everything.",
              style: DHTypography.caption(),
              textAlign: TextAlign.center,
            ),
          ),
          SizedBox(
            height: 48,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              scrollDirection: Axis.horizontal,
              itemCount: _filters.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (_, i) {
                final f = _filters[i];
                final selected = f.slug == category;
                return ChoiceChip(
                  label: Text(f.label),
                  selected: selected,
                  onSelected: (_) {/* TODO: navigate with new filter */},
                );
              },
            ),
          ),
          // TODO: replace with ConsumerWidget backed by contentProvider
          const Expanded(
            child: Center(child: Text('Session list loads here')),
          ),
        ],
      ),
    );
  }
}
