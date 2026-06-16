import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http_parser/http_parser.dart';

class ApiClient {
  static const String baseUrl = 'https://api.pattieplayshop.cloud-ip.cc/api';
  static const String staticUrl = 'https://api.pattieplayshop.cloud-ip.cc';

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<Map<String, String>> _getHeaders({bool isMultipart = false}) async {
    final token = await _getToken();
    final Map<String, String> headers = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  // Handle Response helper
  dynamic _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (response.body.isEmpty) return null;
      return jsonDecode(response.body);
    } else {
      Map<String, dynamic> errorData;
      try {
        errorData = jsonDecode(response.body);
      } catch (e) {
        errorData = {
          'messageEn': 'An unexpected error occurred',
          'messageTh': 'เกิดข้อผิดพลาดที่ไม่คาดคิด',
          'messageLa': 'ເກີດຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ',
        };
      }
      throw Exception(jsonEncode(errorData));
    }
  }

  Future<dynamic> get(String path) async {
    final headers = await _getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl$path'),
      headers: headers,
    );
    return _handleResponse(response);
  }

  Future<dynamic> post(String path, dynamic body) async {
    final headers = await _getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl$path'),
      headers: headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  Future<dynamic> put(String path, dynamic body) async {
    final headers = await _getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl$path'),
      headers: headers,
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  Future<dynamic> delete(String path) async {
    final headers = await _getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl$path'),
      headers: headers,
    );
    return _handleResponse(response);
  }

  // Upload receipt slip image
  Future<dynamic> uploadSlip(String path, File file, String fieldName) async {
    final headers = await _getHeaders(isMultipart: true);
    final request = http.MultipartRequest('POST', Uri.parse('$baseUrl$path'));
    
    // Add authorization header
    request.headers.addAll(headers);
    
    // Attach the file
    final mimeType = file.path.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
    request.files.add(await http.MultipartFile.fromPath(
      fieldName,
      file.path,
      contentType: MediaType.parse(mimeType),
    ));

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    return _handleResponse(response);
  }

  // Helper to resolve media URLs
  static String getMediaUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return '$staticUrl$url';
  }
}
