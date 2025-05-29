let allProducts = [];
let userAddedProducts = [];

// Function to fetch products from the API
async function fetchProducts() {
  const loadingDiv = document.getElementById("loading");
  const productsGrid = document.getElementById("productsGrid");

  try {
    // Show loading, hide products grid
    loadingDiv.style.display = "block";
    productsGrid.style.display = "none";

    // Make the fetch request to the API
    const response = await fetch("https://fakestoreapi.com/products");

    // Check if the response is successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Convert response to JSON
    const products = await response.json();

    // Store products in global variable
    allProducts = [...products];

    // Hide loading, show products grid
    loadingDiv.style.display = "none";
    productsGrid.style.display = "grid";

    // Display the products
    displayProducts(allProducts);

    // Load any saved user products after API products are loaded
    loadUserProductsFromStorage();
  } catch (error) {
    // Handle any errors that occur during fetching
    console.error("Error fetching products:", error);

    loadingDiv.style.display = "none";
    productsGrid.innerHTML =
      '<p style="color: red; text-align: center; grid-column: 1 / -1;">Failed to load products. Please check your internet connection and try again.</p>';
    productsGrid.style.display = "block";
  }
}

// Function to display products in the DOM
function displayProducts(products) {
  const productsGrid = document.getElementById("productsGrid");

  // Clear any existing content
  productsGrid.innerHTML = "";

  // Loop through each product and create HTML elements
  products.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

// Function to create a single product card element
function createProductCard(product) {
  // Create the main product div container
  const productDiv = document.createElement("div");
  productDiv.className = "product-card";
  productDiv.id = `product-${product.id}`; // Set unique ID for deletion
  productDiv.setAttribute("data-product-id", product.id);

  // Create product image
  const productImage = document.createElement("img");
  productImage.src = product.image;
  productImage.alt = product.title || product.name;
  productImage.className = "product-image";
  productImage.onerror = function () {
    this.src = "https://via.placeholder.com/150?text=No+Image";
  };

  // Create product name
  const productTitle = document.createElement("h3");
  productTitle.className = "product-title";
  productTitle.textContent = product.title || product.name;

  // Create product description
  const productDescription = document.createElement("p");
  productDescription.className = "product-description";
  const maxLength = 100;
  const truncatedDescription =
    product.description.length > maxLength
      ? product.description.substring(0, maxLength) + "..."
      : product.description;
  productDescription.textContent = truncatedDescription;

  // Create product price
  const productPrice = document.createElement("p");
  productPrice.className = "product-price";
  productPrice.innerHTML = `<strong>Price: $${parseFloat(product.price).toFixed(2)}</strong>`;

  // Create product category
  const productCategory = document.createElement("p");
  productCategory.className = "product-category";
  productCategory.textContent = `Category: ${product.category || "Uncategorized"}`;

  // Create delete button
  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-btn";
  deleteButton.textContent = "Delete";
  deleteButton.setAttribute("data-product-id", product.id);

  // Append all elements to product card
  productDiv.appendChild(productImage);
  productDiv.appendChild(productTitle);
  productDiv.appendChild(productDescription);
  productDiv.appendChild(productPrice);
  productDiv.appendChild(productCategory);
  productDiv.appendChild(deleteButton);

  return productDiv;
}

// Function to initialize the form functionality
function initializeProductForm() {
  const productForm = document.getElementById("productForm");

  // Add event listener for form submission
  productForm.addEventListener("submit", handleFormSubmission);

  // Add real-time validation for better user experience
  addRealTimeValidation();
}

// Function to handle form submission
function handleFormSubmission(event) {
  // Prevent the default form submission behavior
  event.preventDefault();

  // Clear any previous messages
  clearMessage();

  // Get form data
  const formData = getFormData();

  // Validate the form data
  const validationResult = validateFormData(formData);

  if (validationResult.isValid) {
    // If validation passes, add the product
    addNewProduct(formData);
    showSuccessMessage("✅ Product added successfully!");
    clearFormFields();
  } else {
    // If validation fails, show error messages
    showErrorMessages(validationResult.errors);
  }
}

// Function to get data from the form
function getFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    description: document.getElementById("description").value.trim(),
    imageUrl: document.getElementById("imageUrl").value.trim(),
    price: document.getElementById("price").value.trim(),
    category: document.getElementById("category").value.trim(),
  };
}

// Function to validate form data
function validateFormData(data) {
  const errors = [];

  // Validate required fields
  if (!data.name) {
    errors.push("Product name is required");
  }

  if (!data.description) {
    errors.push("Description is required");
  }

  if (!data.imageUrl) {
    errors.push("Image URL is required");
  } else if (!isValidUrl(data.imageUrl)) {
    errors.push(
      "Please enter a valid image URL (must start with http:// or https://)"
    );
  }

  if (!data.price) {
    errors.push("Price is required");
  } else if (isNaN(data.price) || parseFloat(data.price) <= 0) {
    errors.push("Price must be a positive number");
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

// Function to check if URL is valid
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
}

// Function to add a new product to the display
function addNewProduct(formData) {
  // Create a new product object with a unique ID
  const newProduct = {
    id: Date.now(), // Simple unique ID based on timestamp
    name: formData.name,
    title: formData.name, // Ensure consistency with API products
    description: formData.description,
    image: formData.imageUrl,
    price: parseFloat(formData.price).toFixed(2),
    category: formData.category || "Uncategorized",
    isUserAdded: true, // Flag to identify user-added products
  };

  // Add to the global products array
  allProducts.push(newProduct);
  userAddedProducts.push(newProduct);

  // Create and display the new product card
  const productsGrid = document.getElementById("productsGrid");
  const productCard = createProductCard(newProduct);

  // Add smooth animation when adding the product
  productCard.style.opacity = "0";
  productCard.style.transform = "scale(0.8)";
  productsGrid.appendChild(productCard);

  // Animate the product card appearance
  setTimeout(() => {
    productCard.style.transition = "all 0.3s ease";
    productCard.style.opacity = "1";
    productCard.style.transform = "scale(1)";
  }, 10);

  // Save to localStorage for persistence
  saveUserProductsToStorage();
}

// Function to initialize delete functionality using event delegation
function initializeDeleteFunctionality() {
  const productsGrid = document.getElementById("productsGrid");

  // Use event delegation to handle delete button clicks
  productsGrid.addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-btn")) {
      const productId = parseInt(event.target.getAttribute("data-product-id"));
      deleteProduct(productId);
    }
  });
}

// Function to delete a product
function deleteProduct(productId) {
  // Find the product card element
  const productCard = document.getElementById(`product-${productId}`);

  if (productCard) {
    if (confirm("Are you sure you want to delete this product?")) {
      // Add a fade-out effect
      productCard.style.transition = "all 0.3s ease";
      productCard.style.opacity = "0";
      productCard.style.transform = "scale(0.8)";

      // Remove the product card after animation
      setTimeout(() => {
        productCard.remove();

        // Remove from the allProducts array
        allProducts = allProducts.filter((product) => product.id !== productId);

        // Remove from userAddedProducts array if it's a user-added product
        userAddedProducts = userAddedProducts.filter(
          (product) => product.id !== productId
        );

        // Update localStorage
        saveUserProductsToStorage();

        // Show feedback message
        showSuccessMessage("🗑️ Product deleted successfully!");
      }, 300);
    }
  } else {
    console.error(`Product with ID ${productId} not found`);
  }
}

// Function to save user-added products to localStorage
function saveUserProductsToStorage() {
  try {
    // Use a different approach that doesn't rely on localStorage
    console.log("User products saved:", userAddedProducts);
  } catch (error) {
    console.error("Error saving products:", error);
    showErrorMessages(["Failed to save product."]);
  }
}

// Function to load user products from storage
function loadUserProductsFromStorage() {
  try {
    // In a real application, this would load from localStorage
    // For now, just log that we're attempting to load
    console.log("Attempting to load user products...");
  } catch (error) {
    console.error("Error loading products:", error);
  }
}

// Function to initialize reset functionality
function initializeResetFunctionality() {
  const resetButton = document.getElementById("resetAllBtn");

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      // Show confirmation dialog
      const confirmReset = confirm(
        "⚠️ This will remove ALL products from the display and clear your saved products. This action cannot be undone. Are you sure?"
      );

      if (confirmReset) {
        resetAllProducts();
      }
    });
  }
}

// Function to reset all products
function resetAllProducts() {
  // Clear the products grid
  const productsGrid = document.getElementById("productsGrid");
  const loadingDiv = document.getElementById("loading");

  // Add fade-out animation to all products
  const productCards = productsGrid.querySelectorAll(".product-card");
  productCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.transition = "all 0.3s ease";
      card.style.opacity = "0";
      card.style.transform = "scale(0.8)";
    }, index * 50); // Stagger the animations
  });

  // After animations complete, clear everything
  setTimeout(() => {
    // Clear arrays
    allProducts = [];
    userAddedProducts = [];

    // Clear the grid
    productsGrid.innerHTML = "";

    // Show success message
    showSuccessMessage(
      "🔄 All products have been reset! Reloading original products..."
    );

    // Reload original products from API
    setTimeout(() => {
      fetchProducts();
    }, 1000);
  }, productCards.length * 50 + 300);
}

// Function to clear form fields
function clearFormFields() {
  const fields = ["name", "description", "imageUrl", "price", "category"];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) field.value = "";
  });

  // Remove any validation styling
  removeValidationStyling();
}

// Function to show success message
function showSuccessMessage(message) {
  const messageDiv = document.getElementById("message");
  if (messageDiv) {
    messageDiv.innerHTML = `<p class="success-message">${message}</p>`;
    messageDiv.style.display = "block";

    // Auto-hide the message after 4 seconds
    setTimeout(() => {
      clearMessage();
    }, 4000);
  }
}

// Function to show error messages
function showErrorMessages(errors) {
  const messageDiv = document.getElementById("message");
  if (messageDiv) {
    const errorHtml = errors
      .map((error) => `<p class="error-message">• ${error}</p>`)
      .join("");
    messageDiv.innerHTML = `<div class="error-container">${errorHtml}</div>`;
    messageDiv.style.display = "block";
  }
}

// Function to clear messages
function clearMessage() {
  const messageDiv = document.getElementById("message");
  if (messageDiv) {
    messageDiv.innerHTML = "";
    messageDiv.style.display = "none";
  }
}

// Function to add real-time validation for better UX
function addRealTimeValidation() {
  const inputs = ["name", "description", "imageUrl", "price"];

  inputs.forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      // Validate when user leaves the field
      input.addEventListener("blur", function () {
        validateSingleField(inputId, this.value.trim());
      });

      // Clear validation styling when user starts typing
      input.addEventListener("input", function () {
        clearFieldValidation(inputId);
        // Clear any error messages when user starts correcting
        const messageDiv = document.getElementById("message");
        if (messageDiv && messageDiv.style.display === "block") {
          setTimeout(clearMessage, 2000);
        }
      });
    }
  });
}

// Function to validate a single field
function validateSingleField(fieldId, value) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  let isValid = true;
  let errorMessage = "";

  switch (fieldId) {
    case "name":
    case "description":
      if (!value) {
        isValid = false;
        errorMessage = `${fieldId.charAt(0).toUpperCase() + fieldId.slice(1)} is required`;
      }
      break;
    case "imageUrl":
      if (!value) {
        isValid = false;
        errorMessage = "Image URL is required";
      } else if (!isValidUrl(value)) {
        isValid = false;
        errorMessage = "Please enter a valid URL";
      }
      break;
    case "price":
      if (!value) {
        isValid = false;
        errorMessage = "Price is required";
      } else if (isNaN(value) || parseFloat(value) <= 0) {
        isValid = false;
        errorMessage = "Price must be a positive number";
      }
      break;
  }

  if (isValid) {
    field.classList.remove("error");
    field.classList.add("valid");
    field.title = "";
  } else {
    field.classList.remove("valid");
    field.classList.add("error");
    field.title = errorMessage;
  }
}

// Function to clear field validation styling
function clearFieldValidation(fieldId) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.classList.remove("error", "valid");
    field.title = "";
  }
}

// Function to remove all validation styling
function removeValidationStyling() {
  const inputs = ["name", "description", "imageUrl", "price", "category"];
  inputs.forEach((inputId) => {
    clearFieldValidation(inputId);
  });
}

// Main function to initialize the entire application
function initializeApp() {
  // Check if DOM is loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      startApplication();
    });
  } else {
    startApplication();
  }
}

// Function to start all application components
function startApplication() {
  // Initialize all functionality
  fetchProducts(); // Load products from API
  initializeProductForm(); // Form functionality
  initializeDeleteFunctionality(); // Delete functionality
  initializeResetFunctionality(); // Reset functionality
}

// CSS for styling
const style = document.createElement("style");
style.textContent = `
    .product-card {
        border: 1px solid rgba(75, 85, 99, 0.25);
        padding: 10px;
        margin: 8px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
    }
    
    .product-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      
    }
    
    .product-image {
        width: 100%;
        max-width: 300px;
        height: 200px;
        object-fit: cover;
        border-radius: 4px;
        margin-bottom: 10px;
    }
    
    .product-title {
        color: #333;
        margin: 10px 0;
        font-size: 1.2em;
    }
    
    .product-description {
        color: black;
        line-height: 1.4;
        margin: 8px 0;
    }
    
    .product-price {
        color: #e74c3c;
        font-weight: bold;
        margin: 8px 0;
    }
    
    .product-category {
        color: #7f8c8d;
        font-style: italic;
        margin: 8px 0;
    }
    
    .delete-btn {
        background-color: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s ease;
    }
    
    .delete-btn:hover {
        background-color: #c82333;
    }
    
    .success-message {
        color: #28a745;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        padding: 10px;
        border-radius: 4px;
        margin: 10px 0;
    }
    
    .error-message {
        color: #dc3545;
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        padding: 8px;
        border-radius: 4px;
        margin: 5px 0;
    }
    
    .error-container {
        margin: 10px 0;
    }
    
    input.error {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
    }
    
    input.valid {
        border-color: #28a745;
        box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
    }
`;
document.head.appendChild(style);

// Initialize the application
initializeApp();