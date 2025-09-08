import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  AlertTriangle,
  Eye,
  Upload,
  Download,
  BarChart3,
  TrendingDown,
  Star,
  X
} from 'lucide-react';
import './ProductManagement.css';

// API configuration
const API_BASE_URL = 'http://localhost:8000/api';

const ProductManagement = ({ api, adminToken, setIsLoading, setError, handleApiError }) => {
  const [products, setProducts] = useState([]);
  const [productStats, setProductStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    product_id: '',
    brand: '',
    category: '',
    price: '',
    piece: '',
    description: '',
    ingredients: '',
    storage_condition: '',
    gram: '',
    image: null
  });

  useEffect(() => {
    fetchProducts();
    fetchProductStats();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', adminToken);
      
      if (response.success) {
        setProducts(response.data);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStats = async () => {
    try {
      const response = await api.get('/admin/products/stats', adminToken);
      
      if (response.success) {
        setProductStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesBrand = !brandFilter || product.brand === brandFilter;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const lowStockProducts = products.filter(product => product.piece < 10);

  const resetForm = () => {
    setFormData({
      name: '',
      product_id: '',
      brand: '',
      category: '',
      price: '',
      piece: '',
      description: '',
      ingredients: '',
      storage_condition: '',
      gram: '',
      image: null
    });
  };

  // Generate unique product ID
  const generateProductId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `PRD${timestamp}${random}`;
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Generate product ID if not provided
      const productId = formData.product_id || generateProductId();
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('product_id', productId);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('piece', formData.piece);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('ingredients', formData.ingredients || '');
      formDataToSend.append('storage_condition', formData.storage_condition || '');
      formDataToSend.append('gram', formData.gram);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${API_BASE_URL}/admin/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setProducts(prev => [...prev, result.data]);
        setShowCreateModal(false);
        resetForm();
        fetchProductStats();
        alert('Product created successfully!');
      } else {
        throw new Error(result.message || 'Failed to create product');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '' && key !== 'image') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${API_BASE_URL}/products/${selectedProduct.product_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setProducts(prev => prev.map(p => 
          p._id === selectedProduct._id ? result.data : p
        ));
        setShowEditModal(false);
        resetForm();
        setSelectedProduct(null);
        fetchProductStats();
        alert('Product updated successfully!');
      } else {
        throw new Error(result.message || 'Failed to update product');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await api.delete(`/products/${productId}`, adminToken);
      
      if (response.success) {
        setProducts(prev => prev.filter(p => p.product_id !== productId));
        fetchProductStats();
        alert('Product deleted successfully!');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Export Products
  const handleExportProducts = async (format = 'csv') => {
    try {
      setIsLoading(true);
      
      const exportData = products.map(product => ({
        product_id: product.product_id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: product.price,
        piece: product.piece,
        description: product.description,
        ingredients: product.ingredients,
        storage_condition: product.storage_condition,
        gram: product.gram
      }));

      let content, filename, mimeType;
      
      if (format === 'csv') {
        const headers = Object.keys(exportData[0]).join(',');
        const csvContent = exportData.map(row => 
          Object.values(row).map(value => 
            `"${String(value).replace(/"/g, '""')}"`
          ).join(',')
        ).join('\n');
        
        content = headers + '\n' + csvContent;
        filename = `products_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else {
        content = JSON.stringify(exportData, null, 2);
        filename = `products_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert(`Products exported successfully as ${format.toUpperCase()}!`);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Import CSV/JSON File Handler
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          let parsedData = [];
          
          if (file.name.endsWith('.csv')) {
            const lines = content.split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                const obj = {};
                headers.forEach((header, index) => {
                  obj[header] = values[index] || '';
                });
                parsedData.push(obj);
              }
            }
          } else if (file.name.endsWith('.json')) {
            parsedData = JSON.parse(content);
          }
          
          setImportPreview(parsedData.slice(0, 5)); // Show first 5 rows for preview
        } catch (error) {
          alert('Error reading file. Please check the format.');
          setImportFile(null);
          setImportPreview([]);
        }
      };
      reader.readAsText(file);
    }
  };

  // Import Products
  const handleImportProducts = async () => {
    if (!importFile) return;

    try {
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target.result;
          let productsToImport = [];
          
          if (importFile.name.endsWith('.csv')) {
            const lines = content.split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            
            for (let i = 1; i < lines.length; i++) {
              if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                const obj = {};
                headers.forEach((header, index) => {
                  obj[header] = values[index] || '';
                });
                
                // Ensure required fields
                if (obj.name && obj.price && obj.piece) {
                  obj.product_id = obj.product_id || generateProductId();
                  obj.price = parseFloat(obj.price) || 0;
                  obj.piece = parseInt(obj.piece) || 0;
                  obj.gram = parseFloat(obj.gram) || 0;
                  productsToImport.push(obj);
                }
              }
            }
          } else if (importFile.name.endsWith('.json')) {
            const jsonData = JSON.parse(content);
            productsToImport = jsonData.filter(item => item.name && item.price && item.piece);
            
            // Ensure data types and required fields
            productsToImport = productsToImport.map(item => ({
              ...item,
              product_id: item.product_id || generateProductId(),
              price: parseFloat(item.price) || 0,
              piece: parseInt(item.piece) || 0,
              gram: parseFloat(item.gram) || 0
            }));
          }

          if (productsToImport.length === 0) {
            alert('No valid products found in the file.');
            return;
          }

          // Send to backend
          const response = await fetch(`${API_BASE_URL}/admin/products/bulk-import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ products: productsToImport }),
          });

          const result = await response.json();
          
          if (response.ok && result.success) {
            setProducts(prev => [...prev, ...result.data]);
            setShowImportModal(false);
            setImportFile(null);
            setImportPreview([]);
            fetchProductStats();
            alert(`${result.data.length} products imported successfully!`);
          } else {
            throw new Error(result.message || 'Failed to import products');
          }
        } catch (error) {
          alert('Error processing file: ' + error.message);
        }
      };
      
      reader.readAsText(importFile);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      product_id: product.product_id || '',
      brand: product.brand || '',
      category: product.category || '',
      price: product.price?.toString() || '',
      piece: product.piece?.toString() || '',
      description: product.description || '',
      ingredients: product.ingredients || '',
      storage_condition: product.storage_condition || '',
      gram: product.gram?.toString() || '',
      image: null
    });
    setShowEditModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount || 0);
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { text: 'Out of Stock', class: 'stock-out' };
    if (stock < 10) return { text: 'Low Stock', class: 'stock-low' };
    if (stock < 50) return { text: 'Medium Stock', class: 'stock-medium' };
    return { text: 'In Stock', class: 'stock-high' };
  };

  const categories = [...new Set(products.map(p => p.category))];
  const brands = [...new Set(products.map(p => p.brand))];

  return (
    <div className="product-management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h1>Product Management</h1>
          <p>Manage your inventory, products and stock levels</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => setShowImportModal(true)}
            className="admin-btn admin-btn-outline"
          >
            <Upload className="icon" />
            Import CSV
          </button>
          <div className="export-dropdown">
            <button 
              onClick={() => handleExportProducts('csv')}
              className="admin-btn admin-btn-outline"
            >
              <Download className="icon" />
              Export CSV
            </button>
            <button 
              onClick={() => handleExportProducts('json')}
              className="admin-btn admin-btn-outline"
            >
              <Download className="icon" />
              Export JSON
            </button>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="admin-btn admin-btn-primary"
          >
            <Plus className="icon" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {productStats && (
        <div className="stats-grid">
          <div className="admin-card stats-card">
            <div className="stat-item">
              <div className="stat-icon">
                <Package className="icon" />
              </div>
              <div className="stat-content">
                <h3>{productStats.totalProducts}</h3>
                <p>Total Products</p>
              </div>
            </div>
          </div>

          <div className="admin-card stats-card low-stock">
            <div className="stat-item">
              <div className="stat-icon">
                <AlertTriangle className="icon" />
              </div>
              <div className="stat-content">
                <h3>{productStats.lowStockProducts?.length || 0}</h3>
                <p>Low Stock Alerts</p>
              </div>
            </div>
          </div>

          <div className="admin-card stats-card">
            <div className="stat-item">
              <div className="stat-icon">
                <BarChart3 className="icon" />
              </div>
              <div className="stat-content">
                <h3>{productStats.categoryStats?.length || 0}</h3>
                <p>Categories</p>
              </div>
            </div>
          </div>

          <div className="admin-card stats-card">
            <div className="stat-item">
              <div className="stat-icon">
                <Star className="icon" />
              </div>
              <div className="stat-content">
                <h3>{productStats.brandStats?.length || 0}</h3>
                <p>Brands</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="admin-card alert-card">
          <div className="alert-header">
            <div className="alert-icon">
              <AlertTriangle className="icon" />
            </div>
            <div className="alert-content">
              <h3>Low Stock Alert</h3>
              <p>{lowStockProducts.length} products are running low on stock</p>
            </div>
          </div>
          <div className="low-stock-list">
            {lowStockProducts.slice(0, 3).map(product => (
              <div key={product._id} className="low-stock-item">
                <span className="product-name">{product.name}</span>
                <span className="stock-count">{product.piece} left</span>
              </div>
            ))}
            {lowStockProducts.length > 3 && (
              <div className="view-all-link">
                +{lowStockProducts.length - 3} more items
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="search-filter-bar">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="admin-form-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        
        <select 
          value={brandFilter} 
          onChange={(e) => setBrandFilter(e.target.value)}
          className="admin-form-select"
        >
          <option value="">All Brands</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
        
        <button className="admin-btn admin-btn-outline">
          <Filter className="icon" />
          More Filters
        </button>
      </div>

      {/* Products Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">All Products</h2>
          <span className="product-count">{filteredProducts.length} products</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Weight</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.piece);
                  
                  return (
                    <tr key={product._id}>
                      <td>
                        <div className="product-info">
                          <div className="product-image">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} />
                            ) : (
                              <div className="image-placeholder">
                                <Package className="icon" />
                              </div>
                            )}
                          </div>
                          <div className="product-details">
                            <span className="product-name">{product.name}</span>
                            <span className="product-id">ID: {product.product_id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{product.category}</span>
                      </td>
                      <td className="brand-name">{product.brand}</td>
                      <td className="price">{formatCurrency(product.price)}</td>
                      <td>
                        <div className="stock-info">
                          <span className={`stock-badge ${stockStatus.class}`}>
                            {product.piece} units
                          </span>
                          <span className="stock-status">{stockStatus.text}</span>
                        </div>
                      </td>
                      <td className="weight">{product.gram}g</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openEditModal(product)}
                            className="admin-btn admin-btn-outline"
                            title="Edit product"
                          >
                            <Edit className="icon" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.product_id)}
                            className="admin-btn admin-btn-danger"
                            title="Delete product"
                          >
                            <Trash2 className="icon" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Package className="empty-state-icon" />
            <h3>No products found</h3>
            <p>No products match your search criteria.</p>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="admin-modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Import Products</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowImportModal(false)}
              >
                <X className="icon" />
              </button>
            </div>
            
            <div className="import-content">
              <div className="admin-form-group">
                <label className="admin-form-label">Select File (CSV or JSON)</label>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="admin-form-input"
                />
                <small>Upload a CSV or JSON file with product data</small>
              </div>

              {importPreview.length > 0 && (
                <div className="import-preview">
                  <h4>Preview (First 5 rows)</h4>
                  <div className="preview-table">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          {Object.keys(importPreview[0]).map(key => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value, i) => (
                              <td key={i}>{String(value).substring(0, 50)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="sample-format">
                <h4>Required Format:</h4>
                <p>Your file should contain these columns:</p>
                <ul>
                  <li><strong>name</strong> (required) - Product name</li>
                  <li><strong>price</strong> (required) - Product price</li>
                  <li><strong>piece</strong> (required) - Stock quantity</li>
                  <li><strong>brand</strong> - Product brand</li>
                  <li><strong>category</strong> - Product category</li>
                  <li><strong>description</strong> - Product description</li>
                  <li><strong>gram</strong> - Weight in grams</li>
                  <li><strong>ingredients</strong> - Product ingredients</li>
                  <li><strong>storage_condition</strong> - Storage instructions</li>
                </ul>
              </div>
            </div>
            
            <div className="admin-modal-actions">
              <button 
                type="button"
                className="admin-btn admin-btn-outline"
                onClick={() => setShowImportModal(false)}
              >
                Cancel
              </button>
              <button 
                onClick={handleImportProducts}
                disabled={!importFile}
                className="admin-btn admin-btn-primary"
              >
                <Upload className="icon" />
                Import Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Add New Product</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                <X className="icon" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="product-form">
              <div className="form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label">Product Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Product ID</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Brand *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Category *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Price (CAD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="admin-form-input"
                    value={formData.piece}
                    onChange={(e) => setFormData({...formData, piece: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Weight (grams) *</label>
                  <input
                    type="number"
                    className="admin-form-input"
                    value={formData.gram}
                    onChange={(e) => setFormData({...formData, gram: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-form-input"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                  />
                </div>
              </div>
              
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Description *</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Ingredients</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                />
              </div>
              
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Storage Conditions</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.storage_condition}
                  onChange={(e) => setFormData({...formData, storage_condition: e.target.value})}
                />
              </div>
              
              <div className="admin-modal-actions">
                <button 
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Plus className="icon" />
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="admin-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Edit Product</h3>
              <button
                className="admin-modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <X className="icon" />
              </button>
            </div>
            
            <form onSubmit={handleEditProduct} className="product-form">
              <div className="form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label">Product Name *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Brand *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Category *</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Price (CAD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="admin-form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="admin-form-input"
                    value={formData.piece}
                    onChange={(e) => setFormData({...formData, piece: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group">
                  <label className="admin-form-label">Weight (grams) *</label>
                  <input
                    type="number"
                    className="admin-form-input"
                    value={formData.gram}
                    onChange={(e) => setFormData({...formData, gram: e.target.value})}
                    required
                  />
                </div>
                
                <div className="admin-form-group full-width">
                  <label className="admin-form-label">Update Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="admin-form-input"
                    onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                  />
                  {selectedProduct.imageUrl && (
                    <div className="current-image">
                      <img src={selectedProduct.imageUrl} alt="Current" />
                      <span>Current image</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Description *</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
              
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Ingredients</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                />
              </div>
              
              <div className="admin-form-group full-width">
                <label className="admin-form-label">Storage Conditions</label>
                <textarea
                  className="admin-form-textarea"
                  value={formData.storage_condition}
                  onChange={(e) => setFormData({...formData, storage_condition: e.target.value})}
                />
              </div>
              
              <div className="admin-modal-actions">
                <button 
                  type="button"
                  className="admin-btn admin-btn-outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Edit className="icon" />
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;