class User {
  final String id;
  final String email;
  final String name;
  final String phone;
  final String address;
  final String role;

  User({
    required this.id,
    required this.email,
    required this.name,
    required this.phone,
    required this.address,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      address: json['address'] ?? '',
      role: json['role'] ?? 'CUSTOMER',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'phone': phone,
      'address': address,
      'role': role,
    };
  }

  bool get isAdmin => role == 'ADMIN';
}
