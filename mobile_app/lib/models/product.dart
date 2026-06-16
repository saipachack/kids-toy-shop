class Category {
  final String id;
  final String nameEn;
  final String nameTh;
  final String nameLa;
  final String slug;

  Category({
    required this.id,
    required this.nameEn,
    required this.nameTh,
    required this.nameLa,
    required this.slug,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      nameEn: json['nameEn'] ?? '',
      nameTh: json['nameTh'] ?? '',
      nameLa: json['nameLa'] ?? '',
      slug: json['slug'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nameEn': nameEn,
      'nameTh': nameTh,
      'nameLa': nameLa,
      'slug': slug,
    };
  }

  String getName(String language) {
    switch (language) {
      case 'TH':
        return nameTh.isNotEmpty ? nameTh : nameEn;
      case 'LA':
        return nameLa.isNotEmpty ? nameLa : nameEn;
      default:
        return nameEn;
    }
  }
}

class Product {
  final String id;
  final String nameEn;
  final String nameTh;
  final String nameLa;
  final String descriptionEn;
  final String descriptionTh;
  final String descriptionLa;
  final double price;
  final int stock;
  final List<String> images;
  final bool isBestSeller;
  final bool isNewArrival;
  final Category? category;

  Product({
    required this.id,
    required this.nameEn,
    required this.nameTh,
    required this.nameLa,
    required this.descriptionEn,
    required this.descriptionTh,
    required this.descriptionLa,
    required this.price,
    required this.stock,
    required this.images,
    required this.isBestSeller,
    required this.isNewArrival,
    this.category,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    var imgsFromJson = json['images'];
    List<String> imgs = [];
    if (imgsFromJson != null) {
      imgs = List<String>.from(imgsFromJson);
    }

    return Product(
      id: json['id'] ?? '',
      nameEn: json['nameEn'] ?? '',
      nameTh: json['nameTh'] ?? '',
      nameLa: json['nameLa'] ?? '',
      descriptionEn: json['descriptionEn'] ?? '',
      descriptionTh: json['descriptionTh'] ?? '',
      descriptionLa: json['descriptionLa'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      images: imgs,
      isBestSeller: json['isBestSeller'] ?? false,
      isNewArrival: json['isNewArrival'] ?? false,
      category: json['category'] != null ? Category.fromJson(json['category']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nameEn': nameEn,
      'nameTh': nameTh,
      'nameLa': nameLa,
      'descriptionEn': descriptionEn,
      'descriptionTh': descriptionTh,
      'descriptionLa': descriptionLa,
      'price': price,
      'stock': stock,
      'images': images,
      'isBestSeller': isBestSeller,
      'isNewArrival': isNewArrival,
      'category': category?.toJson(),
    };
  }

  String getName(String language) {
    switch (language) {
      case 'TH':
        return nameTh.isNotEmpty ? nameTh : nameEn;
      case 'LA':
        return nameLa.isNotEmpty ? nameLa : nameEn;
      default:
        return nameEn;
    }
  }

  String getDescription(String language) {
    switch (language) {
      case 'TH':
        return descriptionTh.isNotEmpty ? descriptionTh : descriptionEn;
      case 'LA':
        return descriptionLa.isNotEmpty ? descriptionLa : descriptionEn;
      default:
        return descriptionEn;
    }
  }
}
