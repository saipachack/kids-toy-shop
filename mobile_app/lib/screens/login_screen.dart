import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/language_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String? _errorMessage;

  Future<void> _handleGoogleSignIn(BuildContext context, bool isMock) async {
    final auth = Provider.of<AuthProvider>(context, listen: false);
    setState(() {
      _errorMessage = null;
    });

    try {
      if (isMock) {
        await auth.loginWithGoogleMock();
      } else {
        await auth.loginWithGoogle();
      }
      if (mounted && Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception:', '').trim();
        if (_errorMessage!.isEmpty) {
          _errorMessage = 'An error occurred during Google Sign-In.';
        }
      });
    }
  }

  Widget _buildLogoLetter(String char, Color color) {
    return Text(
      char,
      style: TextStyle(
        fontFamily: 'Display',
        fontSize: 36,
        fontWeight: FontWeight.w900,
        color: color,
        letterSpacing: -1,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = Provider.of<LanguageProvider>(context);
    final auth = Provider.of<AuthProvider>(context);

    // Custom theme colors matching Next.js site
    final pinkColor = Colors.pink[400]!;
    final blueColor = Colors.blue[400]!;
    final yellowColor = Colors.amber[600]!;
    final mintColor = Colors.teal[300]!;
    final purpleColor = Colors.purple[400]!;
    final orangeColor = Colors.orange[400]!;

    return Scaffold(
      backgroundColor: const Color(0xFFFDFDFD),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: Colors.grey[150] ?? Colors.grey[200]!),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  )
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo Title (PattiePlayShop)
                  Center(
                    child: Wrap(
                      spacing: 0,
                      children: [
                        _buildLogoLetter('P', pinkColor),
                        _buildLogoLetter('a', blueColor),
                        _buildLogoLetter('t', yellowColor),
                        _buildLogoLetter('t', mintColor),
                        _buildLogoLetter('i', purpleColor),
                        _buildLogoLetter('e', orangeColor),
                        _buildLogoLetter('P', pinkColor),
                        _buildLogoLetter('l', blueColor),
                        _buildLogoLetter('a', yellowColor),
                        _buildLogoLetter('y', mintColor),
                        _buildLogoLetter('S', purpleColor),
                        _buildLogoLetter('h', orangeColor),
                        _buildLogoLetter('o', pinkColor),
                        _buildLogoLetter('p', blueColor),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Header Texts
                  Text(
                    lang.t('loginTitle'),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E293B),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    lang.t('loginSub'),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF64748B),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Error Banner
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.red[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.error_outline, color: Colors.red[600], size: 20),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              _errorMessage!,
                              style: TextStyle(
                                color: Colors.red[700],
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Loading Indicator
                  if (auth.loading) ...[
                    const Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.pink),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],

                  // Sign In Buttons
                  // 1. Native Google Sign In
                  ElevatedButton(
                    onPressed: auth.loading
                        ? null
                        : () => _handleGoogleSignIn(context, false),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF334155),
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                        side: BorderSide(color: Colors.grey[300]!),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Image.network(
                          'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
                          height: 18,
                          errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, size: 18),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          lang.t('googleMockRegister').replaceAll(' (Mock Mode)', ''),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // 2. Mock Google Sign In (Fallback for testing)
                  OutlinedButton(
                    onPressed: auth.loading
                        ? null
                        : () => _handleGoogleSignIn(context, true),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: pinkColor,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(30),
                      ),
                      side: BorderSide(color: pinkColor.withOpacity(0.5)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.developer_mode, size: 18),
                        const SizedBox(width: 8),
                        Text(
                          lang.t('googleMockLogin'),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Language Switcher Selector
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildLangButton(context, 'EN', '🇺🇸 EN'),
                      const SizedBox(width: 10),
                      _buildLangButton(context, 'TH', '🇹🇭 TH'),
                      const SizedBox(width: 10),
                      _buildLangButton(context, 'LA', '🇱🇦 LA'),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLangButton(BuildContext context, String code, String label) {
    final lang = Provider.of<LanguageProvider>(context);
    final isSelected = lang.language == code;

    return GestureDetector(
      onTap: () => lang.setLanguage(code),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.pink[50] : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? Colors.pink[300]! : Colors.grey[300]!,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            color: isSelected ? Colors.pink[700] : const Color(0xFF64748B),
          ),
        ),
      ),
    );
  }
}
