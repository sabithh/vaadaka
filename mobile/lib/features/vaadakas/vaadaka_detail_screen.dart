import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:lucide_icons/lucide_icons.dart';

import '../../core/api/api_client.dart';
import '../../core/api/api_service.dart';
import '../../core/models/vaadaka.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_provider.dart';
import '../../core/widgets/brand_button.dart';
import '../../core/widgets/placeholder_screen.dart';
import '../auth/auth_providers.dart';
import '../bookings/booking_sheet.dart';

final vaadakaDetailProvider = FutureProvider.autoDispose.family<Vaadaka, String>((ref, id) async {
  return ref.watch(apiServiceProvider).getVaadaka(id);
});

class VaadakaDetailScreen extends ConsumerWidget {
  final String vaadakaId;
  const VaadakaDetailScreen({super.key, required this.vaadakaId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isLight = ref.watch(isLightProvider);
    final palette = VaadakaPalette(isLight);
    final async = ref.watch(vaadakaDetailProvider(vaadakaId));
    final user = ref.watch(authProvider).user;

    return Scaffold(
      backgroundColor: palette.bgPrimary,
      body: async.when(
        loading: () => const LoadingView(),
        error: (e, _) => EmptyStateView(
          icon: LucideIcons.alertTriangle,
          title: 'Couldn\'t load item',
          subtitle: VaadakaApiClient.describeError(e),
          action: BrandButton(label: 'Retry', onPressed: () => ref.invalidate(vaadakaDetailProvider(vaadakaId))),
        ),
        data: (vaadaka) {
          final image = vaadaka.primaryImage;
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                backgroundColor: palette.bgPrimary,
                pinned: true,
                leading: IconButton(
                  icon: Container(
                    decoration: BoxDecoration(color: palette.bgSurface, shape: BoxShape.circle),
                    padding: const EdgeInsets.all(8),
                    child: Icon(LucideIcons.arrowLeft, color: palette.textPrimary, size: 18),
                  ),
                  onPressed: () => context.canPop() ? context.pop() : context.go('/vaadakas'),
                ),
                expandedHeight: 300,
                flexibleSpace: FlexibleSpaceBar(
                  background: Hero(
                    tag: 'vaadaka-image-${vaadaka.id}',
                    child: image == null
                        ? Container(
                            color: palette.bgSurface2,
                            child: Icon(LucideIcons.package, size: 80, color: palette.textMuted2),
                          )
                        : CachedNetworkImage(
                            imageUrl: image,
                            fit: BoxFit.cover,
                            placeholder: (_, _) => Container(color: palette.bgSurface2),
                            errorWidget: (_, _, _) => Container(color: palette.bgSurface2),
                          ),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (vaadaka.categoryName != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: palette.bgSurface,
                            borderRadius: BorderRadius.circular(4),
                            border: Border.all(color: palette.border),
                          ),
                          child: Text(
                            vaadaka.categoryName!.toUpperCase(),
                            style: GoogleFonts.barlow(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: palette.textMuted,
                              letterSpacing: 2,
                            ),
                          ),
                        ),
                      const SizedBox(height: 16),
                      Text(
                        vaadaka.name,
                        style: GoogleFonts.bebasNeue(
                          fontSize: 40,
                          color: palette.textPrimary,
                          height: 0.95,
                          letterSpacing: -0.5,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            '₹${vaadaka.displayPrice.toStringAsFixed(0)}',
                            style: GoogleFonts.bebasNeue(
                              fontSize: 48,
                              color: isLight ? VaadakaColors.brandRed : palette.textPrimary,
                              letterSpacing: 1,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '/ ${vaadaka.displayUnit}',
                            style: GoogleFonts.barlow(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: palette.textMuted,
                              letterSpacing: 2,
                            ),
                          ),
                        ],
                      ),
                      if (vaadaka.depositAmount != null && vaadaka.depositAmount! > 0) ...[
                        const SizedBox(height: 4),
                        Text(
                          'REFUNDABLE DEPOSIT: ₹${vaadaka.depositAmount!.toStringAsFixed(0)}',
                          style: GoogleFonts.barlow(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: palette.textMuted,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                      const SizedBox(height: 24),
                      _InfoRow(
                        icon: LucideIcons.layers,
                        label: 'Available',
                        value: '${vaadaka.quantityAvailable} of ${vaadaka.quantityTotal}',
                        palette: palette,
                      ),
                      if (vaadaka.condition != null)
                        _InfoRow(
                          icon: LucideIcons.badgeCheck,
                          label: 'Condition',
                          value: vaadaka.condition!,
                          palette: palette,
                        ),
                      if (vaadaka.shopName != null)
                        _InfoRow(
                          icon: LucideIcons.store,
                          label: 'Owner',
                          value: vaadaka.shopName!,
                          palette: palette,
                        ),
                      if (vaadaka.description != null && vaadaka.description!.isNotEmpty) ...[
                        const SizedBox(height: 16),
                        Text(
                          'ABOUT',
                          style: GoogleFonts.barlow(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: palette.textMuted,
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          vaadaka.description!,
                          style: GoogleFonts.barlow(
                            fontSize: 14,
                            color: palette.textPrimary,
                            height: 1.55,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
      bottomSheet: async.maybeWhen(
        data: (vaadaka) {
          final isOwner = user != null && vaadaka.shop?['owner']?.toString() == user.id;
          final canBook = user != null && !isOwner && vaadaka.quantityAvailable > 0 && user.isRenter;
          return Container(
            padding: EdgeInsets.fromLTRB(16, 12, 16, MediaQuery.of(context).padding.bottom + 12),
            decoration: BoxDecoration(
              color: palette.bgSurface,
              border: Border(top: BorderSide(color: palette.border)),
            ),
            child: BrandButton(
              label: user == null
                  ? 'Sign In to Book'
                  : isOwner
                      ? 'This is Your Item'
                      : vaadaka.quantityAvailable == 0
                          ? 'Out of Stock'
                          : 'Book Now',
              icon: user == null ? LucideIcons.logIn : LucideIcons.calendar,
              expand: true,
              onPressed: user == null
                  ? () => context.push('/login')
                  : canBook
                      ? () => showBookingSheet(context, ref, vaadaka)
                      : null,
            ),
          );
        },
        orElse: () => const SizedBox.shrink(),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final VaadakaPalette palette;

  const _InfoRow({required this.icon, required this.label, required this.value, required this.palette});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 16, color: palette.textMuted),
          const SizedBox(width: 10),
          Text(
            '${label.toUpperCase()}: ',
            style: GoogleFonts.barlow(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              color: palette.textMuted,
              letterSpacing: 1.5,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.barlow(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: palette.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
