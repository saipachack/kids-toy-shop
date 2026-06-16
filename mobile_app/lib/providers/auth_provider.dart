import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../models/user.dart';
import '../services/api_client.dart';

class AuthProvider with ChangeNotifier {
  final ApiClient _apiClient = ApiClient();
  final GoogleSignIn _googleSignIn = GoogleSignIn(
    scopes: ['email', 'profile'],
  );

  User? _user;
  String? _token;
  bool _loading = false;

  User? get user => _user;
  String? get token => _token;
  bool get loading => _loading;
  bool get isAuthenticated => _token != null;

  AuthProvider() {
    _loadSession();
  }

  Future<void> _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
    final userData = prefs.getString('auth_user');
    if (userData != null) {
      _user = User.fromJson(jsonDecode(userData));
    }
    notifyListeners();
  }

  Future<void> _saveSession(String token, User user) async {
    _token = token;
    _user = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('auth_user', jsonEncode(user.toJson()));
    notifyListeners();
  }

  // Classic Form Login
  Future<void> login(String email, String password) async {
    _loading = true;
    notifyListeners();
    try {
      final res = await _apiClient.post('/auth/login', {
        'email': email,
        'password': password,
      });
      final token = res['token'] as String;
      final user = User.fromJson(res['user']);
      await _saveSession(token, user);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  // Real Google Login (native flow)
  Future<void> loginWithGoogle() async {
    _loading = true;
    notifyListeners();
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw Exception('Google Sign-In was cancelled by user');
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final String? idToken = googleAuth.idToken;

      if (idToken == null) {
        throw Exception('Failed to retrieve Google ID Token');
      }

      // Send ID Token to backend verify endpoint
      final res = await _apiClient.post('/auth/google-login', {
        'credential': idToken,
      });

      final token = res['token'] as String;
      final user = User.fromJson(res['user']);
      await _saveSession(token, user);
    } catch (e) {
      print('Google sign in error: $e');
      rethrow;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  // Mock Google Login (for testing without GSI keys)
  Future<void> loginWithGoogleMock() async {
    _loading = true;
    notifyListeners();
    try {
      final res = await _apiClient.post('/auth/google-login', {
        'mock': true,
        'email': 'google.user@gmail.com',
        'name': 'Google Playful User',
      });
      final token = res['token'] as String;
      final user = User.fromJson(res['user']);
      await _saveSession(token, user);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    try {
      if (await _googleSignIn.isSignedIn()) {
        await _googleSignIn.signOut();
      }
    } catch (e) {
      print('Error signing out from Google: $e');
    }
    _token = null;
    _user = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_user');
    notifyListeners();
  }
}
