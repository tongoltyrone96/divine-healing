import 'package:flutter/material.dart';
import '../../theme.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _userCard(),
          const SizedBox(height: 20),
          _subscriptionSection(),
        ],
      ),
    );
  }

  Widget _userCard() => Card(
        child: ListTile(
          leading: const CircleAvatar(child: Icon(Icons.person)),
          title: const Text('Signed-in user name'),  // TODO: bind to authProvider
          subtitle: const Text('user@email.com'),
          trailing: TextButton(onPressed: () {}, child: const Text('Sign out')),
        ),
      );

  Widget _subscriptionSection() => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Subscription', style: DHTypography.heading(size: 18)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _planCard('MONTHLY', '\$19', '/mo',
                  'Full access to all content. Cancel any time.')),
              const SizedBox(width: 12),
              Expanded(child: _planCard('ANNUAL', '\$149', '/yr',
                  'Save 35% compared to monthly. Full access.')),
            ],
          ),
        ],
      );

  Widget _planCard(String header, String price, String period, String desc) =>
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(DHRadius.card),
          border: Border.all(color: DHColors.accent.withOpacity(0.3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(header,
                style: DHTypography.caption(color: DHColors.forestGreen)),
            const SizedBox(height: 8),
            RichText(
              text: TextSpan(
                style: DHTypography.heading(size: 26),
                children: [
                  TextSpan(text: price),
                  TextSpan(
                      text: period,
                      style: DHTypography.body(size: 14, color: DHColors.secondary)),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(desc, style: DHTypography.body(size: 12, color: DHColors.secondary)),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: null,  // TODO: hook to RevenueCat
              child: const Text('Coming soon'),
            ),
          ],
        ),
      );
}
